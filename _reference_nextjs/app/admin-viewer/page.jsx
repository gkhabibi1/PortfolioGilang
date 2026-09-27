'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminViewer() {
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL'); // 'ALL' | 'VALID' | 'SUSPICIOUS'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isRealtimeActive, setIsRealtimeActive] = useState(true);

  // 1. Fetch Data Absensi dari Supabase
  const fetchAttendances = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .order('captured_at', { ascending: false });

      if (error) throw error;
      setAttendances(data || []);
    } catch (error) {
      console.error('Gagal mengambil data absensi:', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // 2. Realtime Listener untuk Notifikasi Absensi Baru
  useEffect(() => {
    fetchAttendances();

    if (!isRealtimeActive) return;

    const channel = supabase
      .channel('attendance_realtime_channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'attendance' },
        (payload) => {
          setAttendances((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAttendances, isRealtimeActive]);

  // 3. Ringkasan Statistik Audit
  const stats = useMemo(() => {
    const total = attendances.length;
    const suspicious = attendances.filter((a) => a.is_suspicious).length;
    const valid = total - suspicious;
    const integrityRate = total > 0 ? Math.round((valid / total) * 100) : 100;

    return { total, suspicious, valid, integrityRate };
  }, [attendances]);

  // 4. Data Filter & Search
  const filteredAttendances = useMemo(() => {
    return attendances.filter((record) => {
      // Filter status integritas
      if (filterStatus === 'VALID' && record.is_suspicious) return false;
      if (filterStatus === 'SUSPICIOUS' && !record.is_suspicious) return false;

      // Filter pencarian
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      const city = record.ip_city?.toLowerCase() || '';
      const ip = record.ip_address?.toLowerCase() || '';
      const reason = record.suspicious_reason?.toLowerCase() || '';
      const coords = `${record.latitude},${record.longitude}`;

      return (
        city.includes(query) ||
        ip.includes(query) ||
        reason.includes(query) ||
        coords.includes(query)
      );
    });
  }, [attendances, filterStatus, searchQuery]);

  // 5. Fungsi Export CSV Laporan Audit
  const exportToCSV = () => {
    if (attendances.length === 0) {
      alert('Tidak ada data untuk diekspor.');
      return;
    }

    const headers = [
      'ID',
      'Waktu Presensi',
      'Latitude',
      'Longitude',
      'Akurasi GPS (meter)',
      'IP Address',
      'Kota IP',
      'Selisih Jarak IP-GPS (km)',
      'Status Integritas',
      'Alasan Anomali',
      'URL Foto'
    ];

    const rows = attendances.map((rec) => [
      rec.id,
      new Date(rec.captured_at || rec.created_at).toISOString(),
      rec.latitude,
      rec.longitude,
      rec.gps_accuracy_meters || 'N/A',
      rec.ip_address || 'N/A',
      `"${rec.ip_city || 'N/A'}"`,
      rec.distance_ip_gps_km ?? 'N/A',
      rec.is_suspicious ? 'MENCURIGAKAN' : 'VALID',
      `"${(rec.suspicious_reason || '').replace(/"/g, '""')}"`,
      rec.photo_url
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `laporan_absensi_audit_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-slate-900 text-slate-100 gap-3">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-400">Menghubungkan ke Supabase Audit Service...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Navigation */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-2">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              Sistem Audit Presensi & Anti-Spoof
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              Dashboard Admin Viewer
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Monitoring bukti live snapshot, verifikasi GPS akurasi tinggi, dan korelasi IP Geolocation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Realtime Live Indicator */}
            <button
              onClick={() => setIsRealtimeActive(!isRealtimeActive)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium border transition ${
                isRealtimeActive
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
              }`}
              title="Toggle Live Update"
            >
              <span className={`w-2 h-2 rounded-full ${isRealtimeActive ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
              {isRealtimeActive ? 'Realtime Aktif' : 'Realtime Nonaktif'}
            </button>

            {/* Refresh Button */}
            <button
              onClick={() => fetchAttendances(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition"
            >
              <svg
                className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>

            {/* Export CSV Button */}
            <button
              onClick={exportToCSV}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition shadow-lg shadow-blue-600/20"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Ekspor CSV
            </button>
          </div>
        </div>

        {/* 4 Statistik Ringkas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Absensi</span>
            <div className="text-3xl font-black text-white mt-1">{stats.total}</div>
            <p className="text-xs text-slate-500 mt-1">Data terekam di sistem</p>
          </div>

          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Valid & Terverifikasi</span>
            <div className="text-3xl font-black text-emerald-400 mt-1">{stats.valid}</div>
            <p className="text-xs text-slate-500 mt-1">GPS & Jaringan Sinkron</p>
          </div>

          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-400">Indikasi Mencurigakan</span>
            <div className="text-3xl font-black text-rose-400 mt-1">{stats.suspicious}</div>
            <p className="text-xs text-slate-500 mt-1">Selisih &gt; 50km / Anomali Mock</p>
          </div>

          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">Integritas Keamanan</span>
            <div className="text-3xl font-black text-blue-400 mt-1">{stats.integrityRate}%</div>
            <p className="text-xs text-slate-500 mt-1">Tingkat absensi bersih</p>
          </div>
        </div>

        {/* Filter & Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterStatus('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterStatus === 'ALL'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Semua ({stats.total})
            </button>
            <button
              onClick={() => setFilterStatus('VALID')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterStatus === 'VALID'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-800'
              }`}
            >
              Valid Saja ({stats.valid})
            </button>
            <button
              onClick={() => setFilterStatus('SUSPICIOUS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterStatus === 'SUSPICIOUS'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-rose-400 hover:bg-slate-800'
              }`}
            >
              Mencurigakan ({stats.suspicious})
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Cari IP, Kota, Koordinat, Alasan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-72 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1.5 text-slate-500 hover:text-slate-300 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Tabel Data Presensi */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs">
              <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-4">Waktu Presensi</th>
                  <th className="px-5 py-4">Bukti Kamera (Live)</th>
                  <th className="px-5 py-4">Koordinat GPS Fisik</th>
                  <th className="px-5 py-4">IP Geolocation (ISP)</th>
                  <th className="px-5 py-4">Delta Jarak</th>
                  <th className="px-5 py-4">Integritas Keamanan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredAttendances.map((record) => {
                  const timestamp = new Date(record.captured_at || record.created_at);
                  const isFar = record.distance_ip_gps_km !== null && record.distance_ip_gps_km > 50;

                  return (
                    <tr
                      key={record.id}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        record.is_suspicious ? 'bg-rose-500/[0.03]' : ''
                      }`}
                    >
                      {/* Waktu */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-200">
                          {timestamp.toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          })}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {timestamp.toLocaleDateString('id-ID', {
                            dateStyle: 'medium'
                          })}
                        </div>
                      </td>

                      {/* Foto */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setSelectedPhoto(record)}
                          className="relative group rounded-lg overflow-hidden border border-slate-700 block focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <img
                            src={record.photo_url}
                            alt="Bukti Kehadiran"
                            className="h-14 w-14 object-cover group-hover:scale-110 transition duration-200"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                            <span className="text-[10px] text-white font-medium">Lihat</span>
                          </div>
                        </button>
                      </td>

                      {/* GPS Titik Lokasi */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <a
                            href={`https://maps.google.com/maps?q=${record.latitude},${record.longitude}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 font-semibold hover:underline"
                          >
                            <span>Buka di Google Maps</span>
                            <span className="text-[10px]">↗</span>
                          </a>
                          <div className="font-mono text-slate-400 text-[11px]">
                            {record.latitude?.toFixed(5)}, {record.longitude?.toFixed(5)}
                          </div>
                          {record.gps_accuracy_meters !== null && (
                            <span className="inline-block text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                              Akurasi: ±{record.gps_accuracy_meters}m
                            </span>
                          )}
                        </div>
                      </td>

                      {/* IP Geolocation */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <div className="font-medium text-slate-300">
                            {record.ip_city || 'Kota Tidak Diketahui'}
                          </div>
                          <div className="font-mono text-slate-500 text-[11px]">
                            {record.ip_address || 'IP Pribadi/Proxy'}
                          </div>
                        </div>
                      </td>

                      {/* Delta Jarak IP vs GPS */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        {record.distance_ip_gps_km !== null ? (
                          <span
                            className={`font-mono font-semibold px-2 py-1 rounded text-xs ${
                              isFar
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {record.distance_ip_gps_km} km
                          </span>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>

                      {/* Status Integritas */}
                      <td className="px-5 py-4">
                        {record.is_suspicious ? (
                          <div className="space-y-1 max-w-xs">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                              Mencurigakan
                            </span>
                            {record.suspicious_reason && (
                              <p className="text-[11px] text-rose-400/90 leading-tight">
                                {record.suspicious_reason}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Valid & Aman
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {filteredAttendances.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <svg className="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-sm font-medium">Tidak ada data absensi yang sesuai filter.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Lightbox Bukti Snapshot & Telemetri Lengkap */}
      {selectedPhoto && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl space-y-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="font-bold text-lg text-white">Detail Bukti Presensi Live</h2>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg text-sm"
              >
                ✕
              </button>
            </div>

            <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-slate-800">
              <img
                src={selectedPhoto.photo_url}
                alt="Detail Foto Absensi"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Audit Details */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div>
                <span className="text-slate-500">Waktu Capture:</span>
                <p className="font-semibold text-slate-200 mt-0.5">
                  {new Date(selectedPhoto.captured_at || selectedPhoto.created_at).toLocaleString('id-ID')}
                </p>
              </div>
              <div>
                <span className="text-slate-500">Status Integritas:</span>
                <p className={`font-semibold mt-0.5 ${selectedPhoto.is_suspicious ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {selectedPhoto.is_suspicious ? '⚠️ Terindikasi Anomali' : '✅ Terverifikasi Aman'}
                </p>
              </div>
              <div>
                <span className="text-slate-500">GPS Hardware:</span>
                <p className="font-mono text-slate-200 mt-0.5">
                  {selectedPhoto.latitude}, {selectedPhoto.longitude} (±{selectedPhoto.gps_accuracy_meters}m)
                </p>
              </div>
              <div>
                <span className="text-slate-500">IP Geolocation & ISP:</span>
                <p className="font-mono text-slate-200 mt-0.5">
                  {selectedPhoto.ip_city || 'N/A'} ({selectedPhoto.ip_address})
                </p>
              </div>
            </div>

            {selectedPhoto.suspicious_reason && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
                <strong>Catatan Audit:</strong> {selectedPhoto.suspicious_reason}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <a
                href={selectedPhoto.photo_url}
                target="_blank"
                rel="noreferrer"
                download
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-xl text-slate-200 transition"
              >
                Unduh Foto Asli
              </a>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-xs font-semibold rounded-xl text-white transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
