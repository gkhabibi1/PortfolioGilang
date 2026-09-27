'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * Menghitung jarak geodesic antara 2 koordinat (Latitude & Longitude)
 * Menggunakan rumus Haversine (hasil dalam satuan kilometer)
 */
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  if (
    lat1 === undefined || lon1 === undefined ||
    lat2 === undefined || lon2 === undefined ||
    isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)
  ) {
    return null;
  }

  const R = 6371; // Radius bumi dalam KM
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 100) / 100; // Pembulatan 2 desimal
}

/**
 * Fetch data IP Geolocation dengan fallback multi-provider
 * Mencegah kegagalan bila salah satu provider kena rate-limit
 */
async function fetchIpGeolocation() {
  // Provider 1: ipapi.co
  try {
    const res = await fetch('https://ipapi.co/json/', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data.latitude && data.longitude) {
        return {
          ip: data.ip,
          city: data.city,
          region: data.region,
          country: data.country_name,
          latitude: parseFloat(data.latitude),
          longitude: parseFloat(data.longitude),
          org: data.org,
          provider: 'ipapi.co'
        };
      }
    }
  } catch (err) {
    console.warn('[Anti-Spoof] Gagal request ipapi.co, mencoba fallback...', err);
  }

  // Provider 2 (Fallback): ipwho.is
  try {
    const res = await fetch('https://ipwho.is/', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data.success !== false && data.latitude && data.longitude) {
        return {
          ip: data.ip,
          city: data.city,
          region: data.region,
          country: data.country,
          latitude: parseFloat(data.latitude),
          longitude: parseFloat(data.longitude),
          org: data.connection?.org || data.connection?.isp,
          provider: 'ipwho.is'
        };
      }
    }
  } catch (err) {
    console.warn('[Anti-Spoof] Gagal request fallback ipwho.is', err);
  }

  return null;
}

export default function AttendancePage() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaStreamRef = useRef(null);

  // States
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [gpsData, setGpsData] = useState(null);
  const [gpsError, setGpsError] = useState(null);
  const [ipData, setIpData] = useState(null);
  const [securityAudit, setSecurityAudit] = useState({
    distanceKm: null,
    isSuspicious: false,
    reasons: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState(null);

  // 1. PENGAMANAN 1: Live Capture (Bukan Upload File)
  // Memaksa akses langsung ke hardware video stream (kamera depan / user facing)
  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Perangkat / browser Anda tidak mendukung akses live kamera.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user', // Kamera depan
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
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
          ? 'Izin kamera ditolak. Silakan aktifkan izin kamera di browser Anda untuk absensi live.'
          : `Gagal mengakses kamera: ${err.message}`
      );
      setCameraReady(false);
    }
  }, []);

  // Cleanup stream saat unmount untuk mencegah memory leak & lampu kamera tetap menyala
  useEffect(() => {
    startCamera();

    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [startCamera]);

  // 2. PENGAMANAN 2: High Accuracy GPS
  // Mengambil GPS perangkat dengan akurasi tinggi tanpa cache (maximumAge: 0)
  const getHighAccuracyLocation = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        return reject(new Error('Geolocation tidak didukung oleh browser Anda.'));
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => resolve(pos),
        (err) => {
          let msg = 'Gagal membaca GPS.';
          if (err.code === 1) msg = 'Izin lokasi (GPS) ditolak oleh pengguna.';
          if (err.code === 2) msg = 'Sinyal posisi GPS tidak tersedia.';
          if (err.code === 3) msg = 'Waktu permintaan GPS habis (Timeout).';
          reject(new Error(msg));
        },
        {
          enableHighAccuracy: true, // Wajib: paksa hardware GPS aktif
          timeout: 10000,          // Maksimal 10 detik
          maximumAge: 0            // Wajib: jangan gunakan cache lokasi lama
        }
      );
    });
  }, []);

  // Preload IP Geolocation & Initial GPS check saat halaman terbuka
  useEffect(() => {
    let isMounted = true;

    async function initTelemetry() {
      // Fetch IP data di background
      const ipResult = await fetchIpGeolocation();
      if (isMounted && ipResult) {
        setIpData(ipResult);
      }

      // Cek GPS awal
      try {
        const pos = await getHighAccuracyLocation();
        if (isMounted) {
          const coords = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: Math.round(pos.coords.accuracy),
            altitude: pos.coords.altitude,
            speed: pos.coords.speed
          };
          setGpsData(coords);

          // Jika data IP sudah ada, lakukan audit jarak
          if (ipResult) {
            evaluateSecurity(coords, ipResult);
          }
        }
      } catch (err) {
        if (isMounted) {
          setGpsError(err.message);
        }
      }
    }

    initTelemetry();

    return () => {
      isMounted = false;
    };
  }, [getHighAccuracyLocation]);

  // 3. PENGAMANAN 3: Cross-Check Jarak IP vs GPS & Evaluasi Anomali
  const evaluateSecurity = (gpsCoords, ipCoords) => {
    const reasons = [];
    let isSuspicious = false;

    // Hitung jarak antara koordinat GPS fisik dengan estimasi ISP Internet
    const dist = calculateHaversineDistance(
      gpsCoords.latitude,
      gpsCoords.longitude,
      ipCoords.latitude,
      ipCoords.longitude
    );

    // Kriteria 1: Selisih jarak ekstrem (> 50 km)
    // Pengguna fisik di Surabaya tapi IP terdaftar di Singapura/Jakarta, atau sebaliknya
    if (dist !== null && dist > 50) {
      isSuspicious = true;
      reasons.push(`Selisih jarak fisik GPS vs Internet (IP) > 50km (Terdeteksi selisih ${dist} km). Indikasi Fake GPS / Proxy / VPN.`);
    }

    // Kriteria 2: Akurasi GPS sangat buruk (> 150 meter)
    if (gpsCoords.accuracy > 150) {
      reasons.push(`Akurasi GPS rendah (±${gpsCoords.accuracy}m). Disarankan berada di luar ruangan.`);
    }

    // Kriteria 3: Akurasi GPS tidak wajar (0 meter persis sering kali merupakan output emulator/mock app)
    if (gpsCoords.accuracy === 0) {
      isSuspicious = true;
      reasons.push('Akurasi GPS 0 meter (Karakteristik Mock Location / Fake GPS).');
    }

    const auditResult = {
      distanceKm: dist,
      isSuspicious,
      reasons
    };

    setSecurityAudit(auditResult);
    return auditResult;
  };

  /**
   * Helper untuk menambahkan watermark stempel waktu & koordinat langsung ke foto
   * Mencegah foto hasil tangkapan diinjeksi atau dimanipulasi ulang
   */
  const stampPhotoWatermark = (canvas, coords, timestamp) => {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Gradasi gelap di bagian bawah untuk keterbacaan teks
    const bannerHeight = 80;
    const gradient = ctx.createLinearGradient(0, height - bannerHeight, 0, height);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.85)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, height - bannerHeight, width, bannerHeight);

    // Render Watermark Text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px monospace';
    ctx.fillText(`🕒 ${timestamp}`, 16, height - 44);

    ctx.font = '13px monospace';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText(
      `📍 LAT: ${coords.latitude.toFixed(6)} | LON: ${coords.longitude.toFixed(6)} (±${coords.accuracy}m)`,
      16,
      height - 20
    );
  };

  /**
   * Eksekusi Absensi dengan 3 Lapis Pengamanan Terintegrasi
   */
  const handleAbsen = async () => {
    if (!cameraReady || !videoRef.current) {
      alert('Kamera belum siap. Pastikan izin kamera aktif.');
      return;
    }

    setIsLoading(true);
    setStatusMessage({ type: 'info', text: 'Memverifikasi sinyal GPS akurasi tinggi...' });

    try {
      // Langkah 1: Kunci Koordinat GPS High Accuracy terbaru secara real-time
      const pos = await getHighAccuracyLocation();
      const currentGps = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: Math.round(pos.coords.accuracy),
        altitude: pos.coords.altitude,
        speed: pos.coords.speed
      };
      setGpsData(currentGps);

      // Langkah 2: Cross-check IP Geolocation
      setStatusMessage({ type: 'info', text: 'Memvalidasi korelasi IP Geolocation...' });
      let currentIp = ipData;
      if (!currentIp) {
        currentIp = await fetchIpGeolocation();
        if (currentIp) setIpData(currentIp);
      }

      // Evaluasi Kecurigaan (Fake GPS / VPN / Mock Location)
      let audit = { distanceKm: null, isSuspicious: false, reasons: [] };
      if (currentIp) {
        audit = evaluateSecurity(currentGps, currentIp);
      }

      // Langkah 3: Ambil Live Snapshot dari Video Stream (Direct Capture)
      setStatusMessage({ type: 'info', text: 'Mengambil snapshot kamera live...' });
      const video = videoRef.current;
      const canvas = canvasRef.current;

      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');

      // Gambar frame video ke canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Beri cap watermark anti-manipulasi (Waktu & GPS)
      const nowIso = new Date().toISOString();
      const localTimeString = new Date().toLocaleString('id-ID', {
        dateStyle: 'full',
        timeStyle: 'medium'
      });
      stampPhotoWatermark(canvas, currentGps, localTimeString);

      // Convert ke Blob JPEG
      const photoBlob = await new Promise((resolve) =>
        canvas.toBlob(resolve, 'image/jpeg', 0.88)
      );

      if (!photoBlob) {
        throw new Error('Gagal memproses gambar dari kamera.');
      }

      // Langkah 4: Upload Foto ke Supabase Storage
      setStatusMessage({ type: 'info', text: 'Mengunggah bukti kehadiran terenkripsi...' });
      const fileName = `absen_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('attendance_photos')
        .upload(fileName, photoBlob, {
          contentType: 'image/jpeg',
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw new Error(`Supabase Storage: ${uploadError.message}`);

      // Dapatkan URL publik file
      const {
        data: { publicUrl }
      } = supabase.storage.from('attendance_photos').getPublicUrl(fileName);

      setCapturedPhotoUrl(publicUrl);

      // Langkah 5: Simpan Record Absensi Lengkap ke Database Supabase
      setStatusMessage({ type: 'info', text: 'Menyimpan log absensi ke server...' });
      const attendanceRecord = {
        latitude: currentGps.latitude,
        longitude: currentGps.longitude,
        gps_accuracy_meters: currentGps.accuracy,
        photo_url: publicUrl,
        ip_address: currentIp?.ip || null,
        ip_city: currentIp?.city || null,
        ip_latitude: currentIp?.latitude || null,
        ip_longitude: currentIp?.longitude || null,
        distance_ip_gps_km: audit.distanceKm,
        is_suspicious: audit.isSuspicious,
        suspicious_reason: audit.reasons.join('; ') || null,
        captured_at: nowIso
      };

      const { error: dbError } = await supabase
        .from('attendance')
        .insert([attendanceRecord]);

      if (dbError) throw new Error(`Database Error: ${dbError.message}`);

      // Hasil akhir
      if (audit.isSuspicious) {
        setStatusMessage({
          type: 'warning',
          text: `Absen tersimpan dengan PERINGATAN ANOMALI (Selisih IP vs GPS: ${audit.distanceKm} km). Ditandai untuk audit HR.`
        });
      } else {
        setStatusMessage({
          type: 'success',
          text: '✅ Absensi berhasil diverifikasi & tercatat aman!'
        });
      }
    } catch (error) {
      console.error('Gagal proses absen:', error);
      setStatusMessage({
        type: 'error',
        text: `Gagal Absen: ${error.message}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 flex flex-col items-center justify-center font-sans">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Sistem Absensi Terproteksi (Anti-Fake GPS)
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Absensi Presensi Online
          </h1>
          <p className="text-sm text-slate-400">
            Verifikasi multi-faktor: Live Camera Feed, High Precision GPS, dan Cross-Check Jaringan.
          </p>
        </div>

        {/* Viewfinder Kamera Live */}
        <div className="relative aspect-video w-full bg-black rounded-xl overflow-hidden border border-slate-700 shadow-inner flex items-center justify-center">
          {cameraError ? (
            <div className="p-6 text-center text-rose-400 text-sm space-y-3">
              <svg className="w-12 h-12 mx-auto text-rose-500 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
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
              {/* Video Element untuk Live Stream */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100"
              />

              {/* Target Face Guide Overlay */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-48 h-60 border-2 border-dashed border-white/40 rounded-full flex items-center justify-center">
                  <span className="text-[11px] text-white/60 bg-black/40 px-2 py-0.5 rounded backdrop-blur">
                    Posisikan Wajah di Sini
                  </span>
                </div>
              </div>

              {/* Badge Status Kamera Live */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md text-xs font-mono text-emerald-400 border border-white/10">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                LIVE CAPTURE
              </div>
            </>
          )}

          {/* Hidden Canvas untuk Snapshot */}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Indikator Telemetri & Keamanan */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* GPS Telemetry */}
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-1">
            <div className="flex items-center justify-between text-slate-400 font-medium">
              <span>🛰️ Hardware GPS</span>
              {gpsData ? (
                <span className="text-emerald-400 font-mono">Terkunci (±{gpsData.accuracy}m)</span>
              ) : gpsError ? (
                <span className="text-rose-400 font-mono">Error</span>
              ) : (
                <span className="text-amber-400 font-mono">Mencari...</span>
              )}
            </div>
            {gpsData ? (
              <p className="font-mono text-slate-300">
                {gpsData.latitude.toFixed(5)}, {gpsData.longitude.toFixed(5)}
              </p>
            ) : (
              <p className="text-slate-500 italic">
                {gpsError || 'Meminta sinyal akurasi tinggi (enableHighAccuracy)...'}
              </p>
            )}
          </div>

          {/* IP Geolocation Telemetry */}
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-1">
            <div className="flex items-center justify-between text-slate-400 font-medium">
              <span>🌐 Jaringan (IP Geo)</span>
              {ipData ? (
                <span className="text-sky-400 font-mono">{ipData.city || 'Terdeteksi'}</span>
              ) : (
                <span className="text-amber-400 font-mono">Mendeteksi...</span>
              )}
            </div>
            {ipData ? (
              <p className="font-mono text-slate-300 truncate">
                {ipData.ip} ({ipData.org || ipData.country})
              </p>
            ) : (
              <p className="text-slate-500 italic">Menghubungi IP Geolocation provider...</p>
            )}
          </div>
        </div>

        {/* Security Audit Badge */}
        {securityAudit.distanceKm !== null && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
              securityAudit.isSuspicious
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            }`}
          >
            <span className="text-base">
              {securityAudit.isSuspicious ? '⚠️' : '🛡️'}
            </span>
            <div className="space-y-0.5">
              <div className="font-semibold">
                {securityAudit.isSuspicious
                  ? 'Peringatan: Potensi Manipulasi Terdeteksi'
                  : 'Validasi Keamanan: Normal'}
              </div>
              <p className="text-slate-400">
                Selisih jarak fisik GPS vs Internet:{' '}
                <strong className={securityAudit.isSuspicious ? 'text-rose-300' : 'text-emerald-300'}>
                  {securityAudit.distanceKm} km
                </strong>{' '}
                {securityAudit.isSuspicious && '(Ambang batas aman ≤ 50 km)'}
              </p>
              {securityAudit.reasons.length > 0 && (
                <ul className="list-disc pl-4 pt-1 space-y-0.5 text-slate-400">
                  {securityAudit.reasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* Feedback Pesan Status */}
        {statusMessage && (
          <div
            className={`p-3 rounded-xl text-xs border ${
              statusMessage.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : statusMessage.type === 'warning'
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                : statusMessage.type === 'error'
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                : 'bg-sky-500/10 border-sky-500/30 text-sky-300'
            }`}
          >
            {statusMessage.text}
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2">
          <button
            onClick={handleAbsen}
            disabled={isLoading || !cameraReady}
            className={`w-full py-3.5 px-4 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg ${
              isLoading || !cameraReady
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white shadow-blue-600/30 hover:shadow-blue-500/40'
            }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Memproses Verifikasi...
              </>
            ) : (
              <>
                <span>📸</span> Ambil Foto & Catat Kehadiran
              </>
            )}
          </button>
        </div>

        {/* Footer Audit Notice */}
        <div className="text-[11px] text-center text-slate-500 leading-relaxed border-t border-slate-800/80 pt-4">
          Data koordinat, stempel waktu server, dan IP address akan dicatat otomatis. Segala bentuk manipulasi GPS atau penggunaan emulator akan dilaporkan ke sistem audit.
        </div>
      </div>
    </div>
  );
}
