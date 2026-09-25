'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

// 10 Slot Karakter Bebek dengan tema warna yang sesuai dengan layar proyektor
export const DUCK_OPTIONS = [
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

export default function PlayerScreen() {
  const [roomCode] = useState('BEBEK-SERU');
  const [name, setName] = useState('');
  const [selectedDuck, setSelectedDuck] = useState(1);
  const [joined, setJoined] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [playerId] = useState(() => 'player_' + Math.random().toString(36).substring(2, 9));
  const [feedback, setFeedback] = useState(null); // 'SLOWED' | 'BOOSTED'
  const [gameOverLoser, setGameOverLoser] = useState(null);

  const channelRef = useRef(null);

  useEffect(() => {
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, []);

  const joinGame = () => {
    if (!name.trim() || isJoining) return;
    setIsJoining(true);

    const channel = supabase.channel(`game_${roomCode}`, {
      config: { presence: { key: playerId } },
    });

    channel
      .on('broadcast', { event: 'START_GAME' }, ({ payload }) => {
        setCurrentQuestion(payload.question);
        setHasAnswered(false);
        setSelectedOption(null);
        setFeedback(null);
        setGameOverLoser(null);
      })
      .on('broadcast', { event: 'NEXT_QUESTION' }, ({ payload }) => {
        setCurrentQuestion(payload.question);
        setHasAnswered(false);
        setSelectedOption(null);
        setFeedback(null);
      })
      .on('broadcast', { event: 'GAME_OVER' }, ({ payload }) => {
        setCurrentQuestion(null);
        setGameOverLoser(payload?.loser || true);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          try {
            await channel.track({
              id: playerId,
              name: name.trim(),
              duckId: selectedDuck,
            });
            setJoined(true);
          } catch (err) {
            console.error('Error tracking presence:', err);
            setJoined(true);
          } finally {
            setIsJoining(false);
          }
        }
      });

    channelRef.current = channel;
  };

  const handleAnswer = (optionIndex) => {
    if (hasAnswered || !currentQuestion) return;
    setHasAnswered(true);
    setSelectedOption(optionIndex);

    const isCorrect = optionIndex === currentQuestion.correct;
    setFeedback(isCorrect ? 'SLOWED' : 'BOOSTED');

    // Kirim sinyal ke host via broadcast
    channelRef.current?.send({
      type: 'broadcast',
      event: 'SUBMIT_ANSWER',
      payload: {
        playerId,
        isCorrect,
      },
    });
  };

  const currentDuckMeta = DUCK_OPTIONS.find((d) => d.id === selectedDuck) || DUCK_OPTIONS[0];

  // 1. Tampilan Sebelum Join (Form Nama & Pilih Karakter Bebek)
  if (!joined) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center p-4 sm:p-6 max-w-md mx-auto font-sans">
        {/* Header Logo */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-yellow-400/20 border-2 border-yellow-400/50 rounded-2xl mx-auto flex items-center justify-center text-4xl mb-3 shadow-lg shadow-yellow-500/10">
            🦆
          </div>
          <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500">
            DUCK RUSH
          </h1>
          <p className="text-xs text-slate-400 mt-1">Layar Pemain HP - Bertahanlah dari Presentasi!</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-col gap-5 shadow-2xl">
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
              Nama Lengkap / Panggilan
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Budi Santoso"
              maxLength={20}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Pilih Karakter Bebek
              </label>
              <span className="text-xs font-bold text-yellow-400">
                #{selectedDuck} {currentDuckMeta.name}
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {DUCK_OPTIONS.map((duck) => {
                const isSelected = selectedDuck === duck.id;
                return (
                  <button
                    key={duck.id}
                    type="button"
                    onClick={() => setSelectedDuck(duck.id)}
                    className={`h-16 rounded-xl flex flex-col items-center justify-center border-2 transition transform active:scale-95 ${
                      isSelected
                        ? 'border-yellow-400 bg-yellow-400/20 shadow-md shadow-yellow-400/20 scale-105'
                        : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-xl">{duck.emoji}</span>
                    <span className="text-[10px] font-bold text-slate-300 mt-0.5">#{duck.id}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={joinGame}
            disabled={!name.trim() || isJoining}
            className="w-full mt-2 py-4 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 font-black text-base rounded-2xl transition shadow-lg shadow-yellow-500/10 disabled:opacity-40 disabled:cursor-not-allowed transform active:scale-[0.98]"
          >
            {isJoining ? 'MENGHUBUNGKAN...' : 'GABUNG KE LOBBY 🚀'}
          </button>
        </div>
      </div>
    );
  }

  // 2. Tampilan Setelah Join (Di Lobby / Menunggu Host / Sesi Selesai)
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col p-4 max-w-md mx-auto font-sans">
      {/* Top Bar Status Pemain */}
      <div className="flex justify-between items-center py-3 px-4 bg-slate-900 border border-slate-800 rounded-2xl mb-4 shadow-md">
        <div className="flex items-center gap-2 overflow-hidden">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-lg border"
            style={{ backgroundColor: `${currentDuckMeta.color}33`, borderColor: currentDuckMeta.border }}
          >
            {currentDuckMeta.emoji}
          </div>
          <div className="overflow-hidden">
            <span className="text-xs text-slate-400 block">Pemain</span>
            <p className="text-sm font-bold text-white truncate">{name}</p>
          </div>
        </div>

        <span className="text-xs bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 font-bold px-2.5 py-1 rounded-lg">
          Bebek #{selectedDuck}
        </span>
      </div>

      {/* Konten Utama */}
      {!currentQuestion ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-slate-900/60 border border-slate-800/80 rounded-3xl">
          {gameOverLoser ? (
            <div className="animate-in fade-in zoom-in-95 duration-200">
              <div className="text-6xl mb-4">🏁 🦆</div>
              <h2 className="text-2xl font-black text-yellow-400 mb-2">BALAPAN SELESAI!</h2>
              <p className="text-sm text-slate-300 mb-4">
                Lihat layar proyektor untuk melihat siapa yang harus maju presentasi!
              </p>
              <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 text-xs text-slate-400">
                Host sedang mempersiapkan ronde selanjutnya...
              </div>
            </div>
          ) : (
            <div>
              <div className="text-6xl animate-bounce mb-4">🦆</div>
              <h2 className="text-xl font-black text-white mb-2">Kamu Sudah Terdaftar!</h2>
              <p className="text-sm text-slate-400 mb-6">
                Menunggu Host memulai balapan di layar proyektor...
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold animate-pulse">
                ● Terhubung ke Room {roomCode}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Soal Balapan & Pilihan Ganda */
        <div className="flex-1 flex flex-col justify-between py-2">
          {/* Header Soal & Feedback */}
          <div className="text-center bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-lg mb-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">
              Jawab Cepat:
            </span>
            <h2 className="text-xl font-black text-yellow-400 leading-snug mb-3">
              {currentQuestion.q}
            </h2>

            {feedback === 'SLOWED' && (
              <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs px-3.5 py-1.5 rounded-full font-bold animate-bounce shadow">
                <span>🛑</span> JAWABAN BENAR! Bebek Melambat Selamat!
              </div>
            )}
            {feedback === 'BOOSTED' && (
              <div className="inline-flex items-center gap-1.5 bg-rose-500/20 border border-rose-500/50 text-rose-300 text-xs px-3.5 py-1.5 rounded-full font-bold animate-pulse shadow">
                <span>🔥</span> JAWABAN SALAH! Bebek Meluncur Cepat!
              </div>
            )}
          </div>

          {/* 4 Pilihan Jawaban Warna-Warni */}
          <div className="grid grid-cols-2 gap-3.5 my-auto">
            {currentQuestion.options.map((opt, idx) => {
              const optionStyles = [
                'bg-rose-600 hover:bg-rose-500 active:bg-rose-700 border-rose-400/40',
                'bg-blue-600 hover:bg-blue-500 active:bg-blue-700 border-blue-400/40',
                'bg-amber-600 hover:bg-amber-500 active:bg-amber-700 border-amber-400/40',
                'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 border-emerald-400/40',
              ];

              const isThisChosen = selectedOption === idx;

              return (
                <button
                  key={idx}
                  disabled={hasAnswered}
                  onClick={() => handleAnswer(idx)}
                  className={`${optionStyles[idx % 4]} min-h-[105px] rounded-2xl font-black text-lg p-3 flex flex-col items-center justify-center text-center shadow-lg transition-all duration-150 transform active:scale-95 disabled:cursor-not-allowed border-2 ${
                    isThisChosen
                      ? 'ring-4 ring-white scale-95 brightness-110'
                      : hasAnswered
                      ? 'opacity-40'
                      : 'hover:scale-[1.02]'
                  }`}
                >
                  <span className="text-white drop-shadow">{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Footer Status */}
          <div className="text-center text-xs text-slate-400 pt-3">
            {hasAnswered ? (
              <span className="text-cyan-400 font-bold">
                ✓ Jawaban terkirim! Menunggu soal berikutnya...
              </span>
            ) : (
              <span>⚠️ Hati-hati: Salah jawab bikin bebekmu makin dekat ke finish presentasi!</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
