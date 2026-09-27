'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

// Titik Lokasi Resmi: Gudang Mas Wakit (https://maps.app.goo.gl/RVFBr11kwQ6Pj2ji9)
const TARGET_OFFICE = {
  name: 'Gudang Mas Wakit',
  latitude: -7.6079492,
  longitude: 110.9408299,
  maxRadiusMeters: 100 // Radius batas toleransi maksimal 100 meter
};

/**
 * Rumus Haversine: Menghitung jarak akurat antara GPS handphone dan titik tujuan (dalam meter)
 */
function calculateDistanceInMeters(lat1, lon1, lat2, lon2) {
  if (
    lat1 === undefined || lon1 === undefined ||
    lat2 === undefined || lon2 === undefined ||
    isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)
  ) {
    return null;
  }

  const R = 6371e3; // Radius bumi dalam meter
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c); // Dalam meter
}

export default function AttendancePage() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaStreamRef = useRef(null);

  // States
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [phoneGps, setPhoneGps] = useState(null);
  const [distanceMeters, setDistanceMeters] = useState(null);
  const [isWithinRadius, setIsWithinRadius] = useState(false);
  const [gpsError, setGpsError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // State Modal Sukses (Hanya memunculkan tanda sukses, TIDAK redirect ke admin)
  const [successRecord, setSuccessRecord] = useState(null);

  // 1. Live Video Stream Kamera Depan
  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Perangkat tidak mendukung akses live kamera.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });

      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setCameraReady(true);
        };
      }
    } catch (err) {
      console.error('Akses kamera ditolak:', err);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Izin kamera ditolak. Aktifkan izin kamera pada browser untuk absensi live.'
          : `Gagal mengakses kamera: ${err.message}`
      );
      setCameraReady(false);
    }
  }, []);

  // 2. Ambil Lokasi REAL Smartphone (High Accuracy, Tanpa Cache)
  const getRealPhoneLocation = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        return reject(new Error('Geolocation tidak didukung oleh browser Anda.'));
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => resolve(pos),
        (err) => {
          let msg = 'Gagal membaca GPS.';
          if (err.code === 1) msg = 'Izin lokasi (GPS) ditolak pada smartphone.';
          if (err.code === 2) msg = 'Sinyal posisi GPS perangkat tidak tersedia.';
          if (err.code === 3) msg = 'Waktu permintaan GPS habis (Timeout).';
          reject(new Error(msg));
        },
        {
          enableHighAccuracy: true, // Wajib: baca sensor hardware GPS fisik
          timeout: 12000,
          maximumAge: 0            // Wajib: jangan gunakan cache lokasi lama
        }
      );
    });
  }, []);

  // Tracking GPS Real Handphone saat halaman dibuka
  const refreshLocation = useCallback(async () => {
    try {
      setGpsError(null);
      const pos = await getRealPhoneLocation();
      const coords = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: Math.round(pos.coords.accuracy)
      };

      setPhoneGps(coords);

      // Hitung jarak real smartphone ke Gudang Mas Wakit
      const dist = calculateDistanceInMeters(
        coords.latitude,
        coords.longitude,
        TARGET_OFFICE.latitude,
        TARGET_OFFICE.longitude
      );

      setDistanceMeters(dist);
      setIsWithinRadius(dist <= TARGET_OFFICE.maxRadiusMeters);
    } catch (err) {
      console.error('GPS error:', err);
      setGpsError(err.message);
      setIsWithinRadius(false);
    }
  }, [getRealPhoneLocation]);

  useEffect(() => {
    startCamera();
    refreshLocation();

    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [startCamera, refreshLocation]);

  // 3. Watermark koordinat REAL handphone langsung pada canvas foto
  const stampPhotoWatermark = (canvas, coords, dist, timeString) => {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Gradasi gelap bawah
    const bannerHeight = 75;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.78)';
    ctx.fillRect(0, height - bannerHeight, width, bannerHeight);

    // Render Text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px monospace';
    ctx.fillText(`🕒 ${timeString}`, 15, height - 42);

    ctx.font = '12px monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(
      `📍 REAL GPS: ${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)} | Radius: ${dist}m (${TARGET_OFFICE.name})`,
      15,
      height - 18
    );
  };

  // 4. Eksekusi Presensi
  const handleAbsen = async () => {
    if (!cameraReady || !videoRef.current) {
      alert('Kamera belum siap.');
      return;
    }

    setIsLoading(true);

    try {
      // Validasi ulang koordinat real smartphone saat tombol ditekan
      const pos = await getRealPhoneLocation();
      const coords = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: Math.round(pos.coords.accuracy)
      };

      const verifiedDist = calculateDistanceInMeters(
        coords.latitude,
        coords.longitude,
        TARGET_OFFICE.latitude,
        TARGET_OFFICE.longitude
      );

      setPhoneGps(coords);
      setDistanceMeters(verifiedDist);

      // JIKA DI LUAR 100 METER, BLOKIR ABSENSI!
      if (verifiedDist > TARGET_OFFICE.maxRadiusMeters) {
        setIsWithinRadius(false);
        throw new Error(
          `Gagal Absen: Anda berada ${verifiedDist} meter dari Gudang Mas Wakit. Batas maksimal absensi adalah 100 meter dari lokasi resmi.`
        );
      }

      setIsWithinRadius(true);

      // Snapshot Video Stream ke Canvas
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const now = new Date();
      const timeStr = now.toLocaleDateString('id-ID', { dateStyle: 'full' }) + ' ' + now.toLocaleTimeString('id-ID');
      stampPhotoWatermark(canvas, coords, verifiedDist, timeStr);

      const photoBlob = await new Promise((resolve) =>
        canvas.toBlob(resolve, 'image/jpeg', 0.88)
      );

      if (!photoBlob) throw new Error('Gagal memproses gambar kamera.');

      // Upload ke Supabase Storage
      const fileName = `absen_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('attendance_photos')
        .upload(fileName, photoBlob, { contentType: 'image/jpeg' });

      let publicUrl = '';
      if (!uploadError) {
        const { data } = supabase.storage.from('attendance_photos').getPublicUrl(fileName);
        publicUrl = data?.publicUrl || '';
      }

      // Simpan record data presensi dengan koordinat REAL SMARTPHONE
      const attendanceRecord = {
        latitude: coords.latitude,       // REAL GPS SMARTPHONE
        longitude: coords.longitude,     // REAL GPS SMARTPHONE
        gps_accuracy_meters: coords.accuracy,
        photo_url: publicUrl || canvas.toDataURL('image/jpeg', 0.8),
        distance_ip_gps_km: verifiedDist / 1000,
        is_suspicious: false,
        suspicious_reason: `Terverifikasi dalam radius ${verifiedDist}m (${TARGET_OFFICE.name})`,
        captured_at: now.toISOString()
      };

      await supabase.from('attendance').insert([attendanceRecord]);

      // TAMPILKAN TANDA SUKSES ABSEN (TIDAK REDIRECT KE ADMIN)
      setSuccessRecord({
        ...attendanceRecord,
        timeFormatted: timeStr,
        distanceMeters: verifiedDist
      });

    } catch (error) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 flex flex-col items-center justify-center font-sans">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
        
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-1">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            Geofence GPS Real (Radius Max 100m)
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Presensi Kehadiran</h1>
          <p className="text-xs text-slate-400">
            Lokasi Resmi: <strong className="text-slate-200">Gudang Mas Wakit</strong>
          </p>
        </div>

        {/* Viewfinder Kamera Live */}
        <div className="relative aspect-video w-full bg-black rounded-2xl overflow-hidden border border-slate-800 shadow-inner flex items-center justify-center">
          {cameraError ? (
            <div className="p-6 text-center text-rose-400 text-xs space-y-3">
              <p>{cameraError}</p>
              <button
                onClick={startCamera}
                className="px-4 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition"
              >
                Coba Ulang Kamera
              </button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100"
              />

              {/* Target Face Guide */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-40 h-52 border-2 border-dashed border-white/40 rounded-full flex items-center justify-center">
                  <span className="text-[10px] text-white/70 bg-black/60 px-2 py-0.5 rounded backdrop-blur">
                    Posisikan Wajah
                  </span>
                </div>
              </div>

              <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold text-emerald-400 border border-white/10">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                LIVE HARDWARE
              </div>
            </>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Telemetri Sensor: GPS Real Handphone & Radius Jarak */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* Sensor GPS Handphone */}
          <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span>📱 GPS Real Handphone</span>
              {phoneGps ? (
                <span className="text-emerald-400 font-mono">Terkunci</span>
              ) : (
                <span className="text-amber-400 font-mono">Mencari...</span>
              )}
            </div>
            {phoneGps ? (
              <p className="font-mono text-slate-200 text-xs font-semibold">
                {phoneGps.latitude.toFixed(5)}, {phoneGps.longitude.toFixed(5)}
              </p>
            ) : (
              <p className="text-slate-500 italic text-[11px]">{gpsError || 'Mengambil koordinat perangkat...'}</p>
            )}
            <p className="text-[10px] text-slate-500">
              {phoneGps ? `Akurasi perangkat: ±${phoneGps.accuracy}m` : 'Menunggu sinyal GPS'}
            </p>
          </div>

          {/* Jarak ke Gudang Mas Wakit */}
          <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span>📍 Radius Lokasi</span>
              {distanceMeters !== null ? (
                <span className={`font-mono font-bold ${isWithinRadius ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isWithinRadius ? 'Dalam Radius' : 'Di Luar Radius'}
                </span>
              ) : (
                <span className="text-amber-400 font-mono">Menghitung...</span>
              )}
            </div>
            <p className="font-mono text-slate-200 text-xs font-bold">
              {distanceMeters !== null ? `Jarak: ${distanceMeters} meter` : 'Jarak: -'}
            </p>
            <p className="text-[10px] text-slate-400">Batas toleransi: Maksimal 100m</p>
          </div>
        </div>

        {/* Geofence Status Alert Banner */}
        <div
          className={`p-3.5 rounded-2xl border text-xs flex items-start gap-2.5 ${
            isWithinRadius
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          <span className="text-base">{isWithinRadius ? '✅' : '❌'}</span>
          <div className="space-y-0.5">
            <div className="font-bold">
              {isWithinRadius
                ? `Lokasi Terverifikasi Valid (${distanceMeters}m)`
                : `Presensi Ditolak (${distanceMeters ?? '-'}m)`}
            </div>
            <p className="text-[11px] text-slate-400">
              {isWithinRadius
                ? 'Anda berada di dalam radius 100 meter dari Gudang Mas Wakit. Presensi dapat dilakukan.'
                : `Jarak Anda melebihi batas 100 meter dari lokasi Gudang Mas Wakit. Anda tidak dapat melakukan absensi.`}
            </p>
          </div>
        </div>

        {/* Action Button (Otomatis disable jika di luar 100m) */}
        <div>
          <button
            onClick={handleAbsen}
            disabled={isLoading || !cameraReady || !isWithinRadius}
            className={`w-full py-3.5 px-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg ${
              isLoading || !cameraReady || !isWithinRadius
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white shadow-blue-600/30'
            }`}
          >
            {isLoading ? (
              'Memverifikasi Kehadiran...'
            ) : !isWithinRadius ? (
              `Di Luar Radius 100m (${distanceMeters ?? '-'}m)`
            ) : (
              '📸 Ambil Foto & Catat Presensi'
            )}
          </button>
        </div>

        {/* Link ke Google Maps */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800/80">
          <span>Titik: Gudang Mas Wakit</span>
          <a
            href="https://maps.app.goo.gl/RVFBr11kwQ6Pj2ji9"
            target="_blank"
            rel="noreferrer"
            className="text-blue-400 hover:underline"
          >
            Buka di Google Maps ↗
          </a>
        </div>
      </div>

      {/* =================================================== */}
      <!-- MODAL TANDA SUKSES ABSEN (TIDAK REDIRECT KE ADMIN)  -->
      {/* =================================================== */}
      {successRecord && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-5 shadow-2xl text-center">
            {/* Animated Checkmark */}
            <div className="w-20 h-20 rounded-full bg-emerald-500/15 border-2 border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto text-4xl shadow-[0_0_25px_rgba(16,185,129,0.3)]">
              ✓
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-black text-white">Presensi Berhasil!</h3>
              <p className="text-xs text-emerald-400 font-semibold">Kehadiran fisik Anda telah terverifikasi aman di dalam radius resmi.</p>
            </div>

            {/* Bukti Foto */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-inner">
              <img src={successRecord.photo_url} alt="Bukti Presensi" className="w-full h-full object-cover" />
            </div>

            {/* Detail GPS Real Handphone */}
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-left text-xs space-y-2">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
                <span className="text-slate-400">Lokasi Presensi:</span>
                <strong className="text-slate-200">Gudang Mas Wakit</strong>
              </div>
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
                <span className="text-slate-400">Jarak ke Titik:</span>
                <strong className="text-emerald-400 font-mono">{successRecord.distanceMeters} meter</strong>
              </div>
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
                <span className="text-slate-400">GPS Handphone:</span>
                <span className="text-slate-300 font-mono text-[11px]">
                  {successRecord.latitude.toFixed(6)}, {successRecord.longitude.toFixed(6)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Akurasi Perangkat:</span>
                <span className="text-slate-300 font-mono text-[11px]">±{successRecord.gps_accuracy_meters} meter</span>
              </div>
            </div>

            {/* Tombol Tutup Saja */}
            <button
              onClick={() => setSuccessRecord(null)}
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl transition shadow-lg shadow-emerald-600/30"
            >
              Selesai
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
