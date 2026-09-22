import React, { useEffect, useState, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import QRCode from 'qrcode';
import { 
  Users, 
  Vote, 
  Maximize2, 
  Minimize2, 
  QrCode, 
  ExternalLink, 
  Copy, 
  Check, 
  ChevronLeft,
  Sparkles,
  RefreshCw,
  Radio
} from 'lucide-react';

export default function PresentationView({ pollId, onNavigate }) {
  const [poll, setPoll] = useState(null);
  const [options, setOptions] = useState([]);
  const [votes, setVotes] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null);

  // Gunakan domain website portofolio utama pengguna
  const publicDomain = (import.meta.env?.VITE_PUBLIC_DOMAIN || 'https://www.portfoliogilang.my.id').replace(/\/+$/, '');
  const voteUrl = `${publicDomain}/vote?id=${pollId}`;

  // Generate QR Code untuk link vote
  useEffect(() => {
    QRCode.toDataURL(voteUrl, {
      width: 320,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    }).then(setQrDataUrl).catch(console.error);
  }, [voteUrl]);

  // Fetch Data & Subscribe Realtime
  useEffect(() => {
    let channel = null;

    async function fetchData() {
      try {
        setLoading(true);
        // 1. Ambil data awal Poll & Opsi
        const { data: pollData, error: pollErr } = await supabase
          .from('polls')
          .select('*')
          .eq('id', pollId)
          .single();

        if (pollErr && !pollData) {
          console.warn('Poll not found, using fallback demo', pollErr);
        }

        const { data: optionsData } = await supabase
          .from('poll_options')
          .select('*')
          .eq('poll_id', pollId)
          .order('order_index');

        const { data: votesData } = await supabase
          .from('poll_votes')
          .select('*')
          .eq('poll_id', pollId);

        setPoll(pollData || {
          id: pollId,
          question: 'Polling Sesi Interaktif',
          title: 'Live Session'
        });
        setOptions(optionsData || []);
        setVotes(votesData || []);
      } catch (err) {
        console.error('Error fetching poll data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();

    // 2. Realtime Channel: Suara Baru & Kehadiran Mahasiswa
    channel = supabase.channel(`poll_room_${pollId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'poll_votes', filter: `poll_id=eq.${pollId}` },
        (payload) => {
          if (payload?.new) {
            setVotes((prev) => {
              // Hindari duplikasi jika id sudah ada
              if (prev.some(v => v.id === payload.new.id)) return prev;
              return [...prev, payload.new];
            });
          }
        }
      )
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users = Object.values(state).flat().map((user) => user.name).filter(Boolean);
        setParticipants(users);
      })
      .subscribe();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [pollId]);

  const copyVoteLink = () => {
    navigator.clipboard.writeText(voteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  const totalVotes = votes.length;

  // Temukan opsi pemenang / suara terbanyak saat ini
  const maxVotes = options.reduce((max, opt) => {
    const count = votes.filter(v => v.option_id === opt.id).length;
    return count > max ? count : max;
  }, 0);

  // Palet gradasi warna untuk setiap bar
  const barGradients = [
    'linear-gradient(to top, #6366f1, #38bdf8)',
    'linear-gradient(to top, #8b5cf6, #ec4899)',
    'linear-gradient(to top, #06b6d4, #10b981)',
    'linear-gradient(to top, #f59e0b, #ef4444)',
    'linear-gradient(to top, #3b82f6, #6366f1)'
  ];

  if (loading && !poll) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
        <RefreshCw style={{ animation: 'spin 1.5s linear infinite', color: '#6366f1' }} size={36} />
        <p style={{ color: '#94a3b8' }}>Menghubungkan ke sesi polling realtime...</p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      style={{
        minHeight: '100vh',
        backgroundColor: '#090d16',
        color: '#f8fafc',
        padding: '1.5rem 2rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative'
      }}
    >
      {/* Background Ambience */}
      <div className="ambient-bg">
        <div className="ambient-orb ambient-orb-1" />
        <div className="ambient-orb ambient-orb-2" />
      </div>

      {/* Top Navbar & Action Controls */}
      <header style={{ position: 'relative', zIndex: 10, maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button 
              onClick={() => onNavigate && onNavigate('dashboard')} 
              className="btn-secondary"
              style={{ padding: '0.5rem 0.85rem', fontSize: '0.85rem' }}
              title="Kembali ke Dashboard"
            >
              <ChevronLeft size={16} /> Dashboard
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(99,102,241,0.15)', padding: '0.35rem 0.85rem', borderRadius: '2rem', border: '1px solid rgba(99,102,241,0.3)' }}>
              <Radio size={14} color="#38bdf8" style={{ animation: 'pulse 1.5s infinite' }} />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em', color: '#a5b4fc', textTransform: 'uppercase' }}>
                Mode Layar Proyektor (Live Host)
              </span>
            </div>
            {isSupabaseConfigured ? (
              <span style={{ fontSize: '0.75rem', background: 'rgba(16,185,129,0.15)', color: '#34d399', padding: '0.25rem 0.6rem', borderRadius: '1rem', border: '1px solid rgba(16,185,129,0.3)' }}>
                ● Cloud Supabase
              </span>
            ) : (
              <span style={{ fontSize: '0.75rem', background: 'rgba(245,158,11,0.15)', color: '#fbbf24', padding: '0.25rem 0.6rem', borderRadius: '1rem', border: '1px solid rgba(245,158,11,0.3)' }} title="Uji coba lokal realtime aktif. Untuk produksi, isi Supabase URL di .env">
                ● Live Broadcast Sync
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button 
              onClick={() => setShowQRModal(true)} 
              className="btn-secondary"
              style={{ padding: '0.5rem 0.85rem', fontSize: '0.85rem' }}
            >
              <QrCode size={16} /> QR Code Peserta
            </button>
            <button 
              onClick={copyVoteLink} 
              className="btn-secondary"
              style={{ padding: '0.5rem 0.85rem', fontSize: '0.85rem' }}
            >
              {copied ? <Check size={16} color="#34d399" /> : <Copy size={16} />}
              {copied ? 'Tersalin!' : 'Salin Link'}
            </button>
            <a 
              href={voteUrl} 
              target="_blank" 
              rel="noreferrer" 
              className="btn-secondary"
              style={{ padding: '0.5rem 0.85rem', fontSize: '0.85rem' }}
            >
              <ExternalLink size={16} /> Buka Tab Voting
            </a>
            <button 
              onClick={toggleFullscreen} 
              className="btn-secondary"
              style={{ padding: '0.5rem 0.85rem', fontSize: '0.85rem' }}
              title="Toggle Layar Penuh"
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
          </div>
        </div>

        {/* Question Header */}
        <div style={{ textAlign: 'center', marginTop: '2rem', marginBottom: '1.5rem' }}>
          <span style={{ color: '#818cf8', fontWeight: 700, fontSize: '0.9rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Pertanyaan Live Polling
          </span>
          <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 800, margin: '0.5rem 0', lineHeight: 1.25, color: '#ffffff' }}>
            {poll?.question}
          </h1>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(30,41,59,0.6)', padding: '0.4rem 1rem', borderRadius: '2rem', border: '1px solid rgba(255,255,255,0.08)', marginTop: '0.5rem' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Mahasiswa join di:</span>
            <span style={{ color: '#38bdf8', fontFamily: 'monospace', fontWeight: 700, fontSize: '0.95rem' }}>
              {voteUrl}
            </span>
          </div>
        </div>
      </header>

      {/* Main Bar Chart Container */}
      <main style={{ position: 'relative', zIndex: 10, maxWidth: '1100px', width: '100%', margin: '1rem auto', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div 
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            gap: 'clamp(1rem, 3vw, 2.5rem)',
            height: 'clamp(280px, 45vh, 420px)',
            padding: '1.5rem 1.5rem 0 1.5rem',
            background: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(12px)',
            borderRadius: '1.5rem',
            border: '1px solid rgba(255, 255, 255, 0.06)'
          }}
        >
          {options.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#64748b', padding: '2rem', width: '100%' }}>
              Belum ada pilihan jawaban untuk polling ini.
            </div>
          ) : (
            options.map((opt, idx) => {
              const count = votes.filter((v) => v.option_id === opt.id).length;
              const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
              const isLeading = count > 0 && count === maxVotes;
              const gradient = barGradients[idx % barGradients.length];

              return (
                <div 
                  key={opt.id} 
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    height: '100%',
                    justifyContent: 'flex-end',
                    maxWidth: '220px',
                    position: 'relative'
                  }}
                >
                  {/* Top Stats Label */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '0.75rem' }}>
                    {isLeading && (
                      <span style={{ fontSize: '0.7rem', background: '#f59e0b', color: '#000', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '1rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Sparkles size={11} /> Tertinggi
                      </span>
                    )}
                    <span style={{ fontSize: 'clamp(1.1rem, 2vw, 1.5rem)', fontWeight: 800, color: isLeading ? '#38bdf8' : '#e2e8f0' }}>
                      {percentage}%
                    </span>
                    <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>
                      {count} suara
                    </span>
                  </div>

                  {/* Vertical Animated Bar Tube */}
                  <div 
                    style={{
                      width: '100%',
                      background: 'rgba(30, 41, 59, 0.6)',
                      borderRadius: '1rem 1rem 0.5rem 0.5rem',
                      overflow: 'hidden',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'flex-end',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      position: 'relative',
                      boxShadow: isLeading ? '0 0 20px rgba(99, 102, 241, 0.25)' : 'none'
                    }}
                  >
                    <div 
                      style={{
                        width: '100%',
                        height: `${percentage}%`,
                        minHeight: count > 0 ? '12px' : '0px',
                        background: gradient,
                        borderRadius: '0.85rem 0.85rem 0 0',
                        transition: 'height 0.8s cubic-bezier(0.34, 1.3, 0.64, 1)',
                        position: 'relative',
                        boxShadow: '0 -4px 16px rgba(0,0,0,0.3)'
                      }}
                    >
                      {/* Subtle Glass Highlight */}
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'rgba(255,255,255,0.4)', borderRadius: '0.85rem 0.85rem 0 0' }} />
                    </div>
                  </div>

                  {/* Option Text Label */}
                  <div 
                    style={{
                      marginTop: '0.85rem',
                      paddingBottom: '0.5rem',
                      textAlign: 'center',
                      fontWeight: 600,
                      color: isLeading ? '#ffffff' : '#cbd5e1',
                      fontSize: 'clamp(0.85rem, 1.2vw, 1rem)',
                      lineHeight: 1.3,
                      minHeight: '2.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {opt.text}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* Footer Presence / Realtime Online Participants */}
      <footer style={{ position: 'relative', zIndex: 10, maxWidth: '1100px', width: '100%', margin: '1rem auto 0 auto' }}>
        <div className="glass-panel" style={{ padding: '1rem 1.25rem', borderRadius: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.65rem', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Vote size={18} color="#818cf8" />
                <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                  Total Suara Masuk: <b style={{ color: '#ffffff', fontSize: '1.05rem' }}>{totalVotes}</b>
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={18} color="#34d399" />
                <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                  Mahasiswa Online: <b style={{ color: '#34d399', fontSize: '1.05rem' }}>{participants.length}</b>
                </span>
              </div>
            </div>

            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              ● Live Realtime Sync via Supabase Presence
            </span>
          </div>

          {/* List Mahasiswa yang sedang bergabung */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', maxHeight: '5.5rem', overflowY: 'auto', alignItems: 'center' }}>
            {participants.length === 0 ? (
              <span style={{ color: '#64748b', fontSize: '0.85rem', fontStyle: 'italic' }}>
                Menunggu mahasiswa bergabung ke sesi voting...
              </span>
            ) : (
              participants.map((name, index) => (
                <span
                  key={index}
                  className="animate-fade-in"
                  style={{
                    backgroundColor: 'rgba(99, 102, 241, 0.15)',
                    color: '#c7d2fe',
                    border: '1px solid rgba(99, 102, 241, 0.35)',
                    fontSize: '0.8rem',
                    padding: '0.3rem 0.75rem',
                    borderRadius: '2rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontWeight: 500
                  }}
                >
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                  {name}
                </span>
              ))
            )}
          </div>
        </div>
      </footer>

      {/* QR Code Modal Popup */}
      {showQRModal && (
        <div 
          onClick={() => setShowQRModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1rem'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="glass-panel animate-fade-in"
            style={{
              padding: '2rem',
              maxWidth: '380px',
              width: '100%',
              textAlign: 'center',
              backgroundColor: '#0f172a',
              border: '1px solid rgba(99, 102, 241, 0.4)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
            }}
          >
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: '#fff' }}>
              Scan untuk Memilih
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
              Arahkan kamera smartphone untuk langsung membuka halaman voting
            </p>

            {qrDataUrl && (
              <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '1rem', display: 'inline-block', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
                <img src={qrDataUrl} alt="QR Code Voting" style={{ width: '220px', height: '220px', display: 'block' }} />
              </div>
            )}

            <div style={{ marginTop: '1.25rem' }}>
              <button 
                onClick={() => setShowQRModal(false)}
                className="btn-primary"
                style={{ width: '100%' }}
              >
                Tutup Layar QR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
