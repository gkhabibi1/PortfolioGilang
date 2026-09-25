'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

// Daftar 10 slot karakter bebek dengan warna & aksen unik
export const DUCK_ASSETS = [
  { id: 1, name: 'Bebek Kuning', color: '#FACC15', border: '#CA8A04', emoji: '🦆' },
  { id: 2, name: 'Bebek Oranye', color: '#FB923C', border: '#EA580C', emoji: '🦆' },
  { id: 3, name: 'Bebek Merah', color: '#F87171', border: '#DC2626', emoji: '🦆' },
  { id: 4, name: 'Bebek Ungu', color: '#C084FC', border: '#9333EA', emoji: '🦆' },
  { id: 5, name: 'Bebek Biru', color: '#60A5FA', border: '#2563EB', emoji: '🦆' },
  { id: 6, name: 'Bebek Toska', color: '#2DD4BF', border: '#0D9488', emoji: '🦆' },
  { id: 7, name: 'Bebek Hijau', color: '#4ADE80', border: '#16A34A', emoji: '🦆' },
  { id: 8, name: 'Bebek Pink', color: '#F472B6', border: '#DB2777', emoji: '🦆' },
  { id: 9, name: 'Bebek Emas', color: '#FDE047', border: '#EAB308', emoji: '👑' },
  { id: 10, name: 'Bebek Pelangi', color: '#A78BFA', border: '#7C3AED', emoji: '⭐' },
];

export const QUESTIONS = [
  { q: '2 + 5 x 2 = ?', options: ['14', '12', '10', '16'], correct: 1 },
  { q: 'Ibukota Indonesia sekarang?', options: ['Jakarta', 'IKN', 'Surabaya', 'Bandung'], correct: 1 },
  { q: 'Target audience B2B adalah?', options: ['Konsumen Akhir', 'Perusahaan', 'Anak-anak', 'Komunitas'], correct: 1 },
  { q: '1 Byte terdiri dari berapa Bit?', options: ['4 Bit', '8 Bit', '16 Bit', '32 Bit'], correct: 1 },
  { q: 'Singkatan dari AI adalah?', options: ['Auto Internet', 'Artificial Intelligence', 'Apple Intelligence', 'Action Info'], correct: 1 },
];

export default function HostScreen() {
  const [roomCode] = useState('BEBEK-SERU');
  const [players, setPlayers] = useState({}); // { [playerId]: { id, name, duckId, progress, speedFactor } }
  const [gameState, setGameState] = useState('LOBBY'); // LOBBY, RACING, FINISHED
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(5);
  const [loser, setLoser] = useState(null);
  const [playUrl, setPlayUrl] = useState('/icebreaking/play');

  const channelRef = useRef(null);
  const stateRef = useRef({ gameState, currentQIndex, players });

  useEffect(() => {
    stateRef.current = { gameState, currentQIndex, players };
  }, [gameState, currentQIndex, players]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const fullUrl = `${window.location.origin}/icebreaking/play`;
      setPlayUrl(fullUrl);
    }
  }, []);

  // Setup Supabase Realtime Channel
  useEffect(() => {
    const channel = supabase.channel(`game_${roomCode}`, {
      config: { presence: { key: 'host' } },
    });

    // Deteksi pemain join lewat Presence
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      setPlayers((prev) => {
        const updated = { ...prev };
        Object.values(state).flat().forEach((p) => {
          if (p && p.id && !updated[p.id]) {
            updated[p.id] = {
              id: p.id,
              name: p.name || `Pemain #${p.duckId || 1}`,
              duckId: p.duckId || 1,
              progress: 0,
              speedFactor: 1, // 1 = normal, 0.1 = rem mendadak, 2.5 = ngebut
            };
          }
        });
        return updated;
      });
    });

    // Terima jawaban dari HP Mahasiswa
    channel.on('broadcast', { event: 'SUBMIT_ANSWER' }, ({ payload }) => {
      const { playerId, isCorrect } = payload;
      setPlayers((prev) => {
        if (!prev[playerId]) return prev;
        return {
          ...prev,
          [playerId]: {
            ...prev[playerId],
            // Jika benar: rem mendadak (kecepatan 0.1). Jika salah: ngebut ke garis finish (kecepatan 2.5)
            speedFactor: isCorrect ? 0.1 : 2.5,
          },
        };
      });

      // Kembalikan ke kecepatan normal setelah 2.2 detik
      setTimeout(() => {
        setPlayers((prev) => {
          if (!prev[playerId]) return prev;
          return {
            ...prev,
            [playerId]: { ...prev[playerId], speedFactor: 1 },
          };
        });
      }, 2200);
    });

    channel.subscribe();
    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomCode]);

  // Game Loop: Menggerakkan bebek di sungai
  useEffect(() => {
    if (gameState !== 'RACING') return;

    const interval = setInterval(() => {
      setPlayers((prev) => {
        let firstFinished = null;
        const updated = { ...prev };
        const ids = Object.keys(updated);

        if (ids.length === 0) return prev;

        ids.forEach((id) => {
          const current = updated[id];
          const increment = 0.35 * (current.speedFactor || 1); // Kecepatan arus dasar sungai
          const newProgress = Math.min(100, (current.progress || 0) + increment);

          updated[id] = { ...current, progress: newProgress };

          if (newProgress >= 100 && !firstFinished) {
            firstFinished = updated[id];
          }
        });

        if (firstFinished) {
          setGameState('FINISHED');
          setLoser(firstFinished);
          channelRef.current?.send({
            type: 'broadcast',
            event: 'GAME_OVER',
            payload: { loser: firstFinished },
          });
        }

        return updated;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [gameState]);

  // Timer Soal (5 detik per soal)
  useEffect(() => {
    if (gameState !== 'RACING') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Ganti ke soal berikutnya
          const nextIndex = (currentQIndex + 1) % QUESTIONS.length;
          setCurrentQIndex(nextIndex);
          channelRef.current?.send({
            type: 'broadcast',
            event: 'NEXT_QUESTION',
            payload: { question: QUESTIONS[nextIndex], index: nextIndex },
          });
          return 5;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, currentQIndex]);

  const startGame = () => {
    setGameState('RACING');
    setTimeLeft(5);
    setCurrentQIndex(0);
    channelRef.current?.send({
      type: 'broadcast',
      event: 'START_GAME',
      payload: { question: QUESTIONS[0], index: 0 },
    });
  };

  const resetGame = () => {
    setGameState('LOBBY');
    setLoser(null);
    setCurrentQIndex(0);
    setTimeLeft(5);
    // Reset progress bebek pemain tanpa menghapus pemain dari lobby
    setPlayers((prev) => {
      const reset = {};
      Object.keys(prev).forEach((id) => {
        reset[id] = { ...prev[id], progress: 0, speedFactor: 1 };
      });
      return reset;
    });
  };

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(playUrl)}&color=0-0-0&bgcolor=255-255-255&margin=6`;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center p-4 sm:p-6 font-sans">
      {/* Header Info Banner */}
      <div className="w-full max-w-6xl flex flex-wrap justify-between items-center bg-slate-900/90 backdrop-blur p-4 sm:p-5 rounded-2xl shadow-xl border border-slate-800 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-yellow-400/20 border border-yellow-400/40 rounded-xl flex items-center justify-center text-3xl shadow-inner">
            🦆
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500">
              DUCK RUSH - PANIC RACE
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              ⚠️ <span className="text-rose-400 font-bold">PERINGATAN:</span> Bebek yang sampai finish duluan (Juara 1) HARUS PRESENTASI!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">KODE ROOM</span>
            <span className="text-xl sm:text-2xl font-black text-cyan-400 font-mono tracking-widest">{roomCode}</span>
          </div>
          <div className="h-8 w-px bg-slate-700" />
          <div className="text-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">PESERTA</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
              {Object.keys(players).length}
            </span>
          </div>
        </div>
      </div>

      {/* LOBBY SCREEN DENGAN QR CODE */}
      {gameState === 'LOBBY' && (
        <div className="flex flex-col lg:flex-row items-stretch gap-6 mt-8 max-w-5xl w-full">
          {/* Kolom Kiri: QR Code & Petunjuk Scan HP */}
          <div className="flex-1 bg-slate-900/80 border border-slate-800 p-6 sm:p-8 rounded-3xl flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden">
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <span className="text-xs font-bold text-cyan-400 tracking-wider uppercase mb-2">Scan Lewat Kamera HP</span>
            <h2 className="text-2xl font-black mb-4">Gabung Balapan Sekarang!</h2>

            <div className="p-3 bg-white rounded-2xl shadow-2xl border-4 border-cyan-400/40 mb-4 transition transform hover:scale-105 duration-200">
              <img
                src={qrImageUrl}
                alt="QR Code Masuk Balapan Bebek"
                className="w-48 h-48 sm:w-56 sm:h-56 rounded-lg object-contain"
              />
            </div>

            <p className="text-xs text-slate-400 mb-2">Atau buka link ini di browser HP:</p>
            <a
              href="/icebreaking/play"
              target="_blank"
              rel="noreferrer"
              className="text-sm font-mono text-yellow-400 hover:text-yellow-300 font-bold bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 break-all"
            >
              /icebreaking/play
            </a>
          </div>

          {/* Kolom Kanan: Daftar Peserta & Tombol Start */}
          <div className="flex-1 bg-slate-900/80 border border-slate-800 p-6 sm:p-8 rounded-3xl flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-200">
                  Lobby Peserta ({Object.keys(players).length})
                </h3>
                <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold animate-pulse">
                  ● Siap Bertanding
                </span>
              </div>

              {Object.keys(players).length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-500">
                  <div className="text-5xl animate-bounce mb-3">🦆</div>
                  <p className="text-sm font-medium">Menunggu peserta scan QR code...</p>
                  <p className="text-xs text-slate-600 mt-1">Gunakan HP untuk masuk ke lobby balapan</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-64 overflow-y-auto p-1 pr-2 mb-6">
                  {Object.values(players).map((p) => {
                    const duckMeta = DUCK_ASSETS.find((d) => d.id === p.duckId) || DUCK_ASSETS[0];
                    return (
                      <div
                        key={p.id}
                        className="bg-slate-800/90 border border-slate-700/80 p-2.5 rounded-xl flex items-center gap-2 shadow-sm"
                      >
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-lg border"
                          style={{ backgroundColor: `${duckMeta.color}33`, borderColor: duckMeta.border }}
                        >
                          {duckMeta.emoji}
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-xs font-bold text-white truncate">{p.name}</p>
                          <p className="text-[10px] text-slate-400">#{p.duckId}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-800">
              <button
                onClick={startGame}
                disabled={Object.keys(players).length === 0}
                className="w-full py-4 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 font-black text-lg tracking-wider rounded-2xl shadow-xl hover:shadow-yellow-500/20 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed transform active:scale-[0.98]"
              >
                MULAI BALAPAN 🏁
              </button>
              <p className="text-center text-[11px] text-slate-500 mt-2">
                Minimal 1 pemain untuk memulai sesi game
              </p>
            </div>
          </div>
        </div>
      )}

      {/* RACING SCREEN: LINTASAN SUNGAI & PERTANYAAN */}
      {gameState === 'RACING' && (
        <div className="w-full max-w-6xl mt-4 flex flex-col gap-4">
          {/* Box Soal di Atas Sungai */}
          <div className="bg-slate-900 border-2 border-slate-800 p-4 sm:p-5 rounded-2xl flex flex-wrap justify-between items-center shadow-xl gap-4">
            <div className="flex-1 min-w-[240px]">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded border border-yellow-400/30">
                  PERTANYAAN #{currentQIndex + 1}
                </span>
                <span className="text-xs text-slate-400">Jawab BENAR agar melambat, jawab SALAH auto ngebut!</span>
              </div>
              <h3 className="text-lg sm:text-2xl font-black text-white">
                {QUESTIONS[currentQIndex]?.q}
              </h3>
            </div>

            {/* Countdown Lingkaran */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Ganti Soal</span>
                <span className="text-xs text-yellow-400 font-mono font-bold">Detik</span>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-yellow-400/10 border-2 border-yellow-400 flex items-center justify-center text-2xl font-black text-yellow-400 shadow-lg shadow-yellow-500/10">
                {timeLeft}
              </div>
            </div>
          </div>

          {/* LINTASAN SUNGAI (HORIZONTAL TRACK) */}
          <div className="relative w-full min-h-[500px] h-[calc(70px_*_10)] max-h-[620px] bg-gradient-to-r from-blue-900 via-cyan-800 to-blue-950 rounded-3xl overflow-hidden border-4 border-blue-950 shadow-2xl flex flex-col justify-around p-3">
            {/* Arus Air Animasi */}
            <div className="absolute inset-0 opacity-25 pointer-events-none bg-[radial-gradient(#67e8f9_1.5px,transparent_1.5px)] [background-size:24px_24px] animate-pulse" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent pointer-events-none" />

            {/* GARIS FINISH (Bendera Catur) */}
            <div className="absolute right-10 top-0 bottom-0 w-12 bg-[repeating-conic-gradient(#0f172a_0%_25%,#ffffff_0%_50%)] [background-size:20px_20px] border-l-4 border-yellow-400 z-20 flex items-center justify-center shadow-2xl">
              <span className="[writing-mode:vertical-lr] font-black text-slate-950 bg-yellow-400 px-1 py-3 text-xs tracking-widest rounded shadow uppercase border border-yellow-500">
                FINISH (PRESENTASI) 🎤
              </span>
            </div>

            {/* Jalur masing-masing Bebek */}
            <div className="relative z-10 w-full h-full flex flex-col justify-around">
              {Object.values(players).map((p, idx) => {
                const duckMeta = DUCK_ASSETS.find((d) => d.id === p.duckId) || DUCK_ASSETS[idx % 10];
                return (
                  <div
                    key={p.id}
                    className="relative w-full h-11 flex items-center border-b border-cyan-400/15"
                  >
                    {/* Bebek Berenang Mengikuti Progress */}
                    <div
                      className="absolute transition-all duration-100 ease-linear flex items-center gap-2"
                      style={{
                        left: `calc(${p.progress}% * 0.82)`,
                      }}
                    >
                      {/* Avatar Bebek */}
                      <div
                        className="relative w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-lg border-2 overflow-hidden select-none"
                        style={{
                          backgroundColor: duckMeta.color,
                          borderColor: duckMeta.border,
                        }}
                      >
                        <span>{duckMeta.emoji}</span>
                        <span className="absolute bottom-0 right-0 text-[8px] bg-black/70 text-white font-black px-1 rounded-tl">
                          #{p.duckId}
                        </span>
                      </div>

                      {/* Tag Nama Pemain */}
                      <div className="bg-slate-900/90 text-white px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap shadow-md border border-slate-700">
                        {p.name}
                      </div>

                      {/* Efek Indikator: Rem Aktif vs Ngebut */}
                      {p.speedFactor < 1 && (
                        <span className="text-[10px] font-black text-emerald-300 bg-emerald-950/90 px-2 py-0.5 rounded-full border border-emerald-500 animate-bounce shadow">
                          🛑 REM AKTIF!
                        </span>
                      )}
                      {p.speedFactor > 1 && (
                        <span className="text-[10px] font-black text-rose-300 bg-rose-950/90 px-2 py-0.5 rounded-full border border-rose-500 animate-pulse shadow">
                          🔥 NGEBUT!
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL PENGUMUMAN JUARA 1 (YANG KALAH KARENA HARUS PRESENTASI) */}
      {gameState === 'FINISHED' && loser && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-slate-900 border-2 border-yellow-400 p-8 rounded-3xl max-w-md w-full text-center shadow-2xl relative overflow-hidden">
            <div className="absolute -top-16 -right-16 w-36 h-36 bg-yellow-400/20 rounded-full blur-2xl pointer-events-none" />

            <div className="inline-block p-3 bg-yellow-400/10 border border-yellow-400/30 rounded-2xl mb-4">
              <span className="text-4xl">🏆 🦆</span>
            </div>

            <h2 className="text-3xl font-black text-yellow-400 mb-1">JUARA 1 TERCEPAT!</h2>
            <p className="text-slate-300 text-xs sm:text-sm mb-6">
              Bebek pertama yang berhasil menembus arus dan melewati garis finish adalah:
            </p>

            <div className="bg-slate-800/90 p-5 rounded-2xl border border-slate-700 mb-6 shadow-inner">
              <div className="text-5xl mb-2">🦆</div>
              <h3 className="text-2xl font-black text-white">{loser.name}</h3>
              <p className="text-xs text-yellow-400 font-bold mt-1">Bebek #{loser.duckId}</p>
            </div>

            <div className="bg-rose-500/10 border border-rose-500/40 p-3.5 rounded-xl mb-6">
              <p className="text-rose-400 font-extrabold text-sm">
                🎤 Silakan maju ke depan kelas dan mulai presentasi materi!
              </p>
            </div>

            <button
              onClick={resetGame}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-sm font-bold transition border border-slate-700"
            >
              🔄 Kembali ke Lobby (Main Lagi)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
