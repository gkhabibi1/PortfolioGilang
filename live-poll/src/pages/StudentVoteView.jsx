import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import confetti from 'canvas-confetti';
import { 
  UserCheck, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  Radio, 
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Eye
} from 'lucide-react';

export default function StudentVoteView({ pollId, onNavigate }) {
  const [userName, setUserName] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [options, setOptions] = useState([]);
  const [poll, setPoll] = useState(null);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const channelRef = useRef(null);

  // Ambil data cache browser
  useEffect(() => {
    const savedName = localStorage.getItem('poll_guest_name');
    if (savedName) setUserName(savedName);

    const alreadyVotedOption = localStorage.getItem(`poll_voted_${pollId}`);
    if (alreadyVotedOption) {
      setHasVoted(true);
      setSelectedOptionId(alreadyVotedOption);
    }

    async function loadPoll() {
      try {
        const { data: pollData, error: pErr } = await supabase
          .from('polls')
          .select('*')
          .eq('id', pollId)
          .single();

        const { data: optData, error: optErr } = await supabase
          .from('poll_options')
          .select('*')
          .eq('poll_id', pollId)
          .order('order_index');

        if (pollData) {
          setPoll(pollData);
        } else {
          // Jika poll dengan ID spesifik tidak ditemukan, coba ambil poll aktif terbaru
          const { data: fallbackPolls } = await supabase
            .from('polls')
            .select('*')
            .order('created_at', { ascending: false });

          if (fallbackPolls && fallbackPolls.length > 0) {
            const latest = fallbackPolls[0];
            setPoll(latest);
            const { data: latestOpts } = await supabase
              .from('poll_options')
              .select('*')
              .eq('poll_id', latest.id)
              .order('order_index');
            setOptions(latestOpts || []);
            return;
          }

          setPoll({
            id: pollId,
            question: 'Polling Sesi Interaktif',
            title: 'Live Session'
          });
        }

        setOptions(optData || []);
      } catch (err) {
        console.error('Error loading poll:', err);
      }
    }

    loadPoll();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [pollId]);

  // Trigger perayaan confetti saat berhasil vote
  const fireCelebration = () => {
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }
  };

  // Saat mahasiswa submit nama & bergabung
  const handleJoin = async (e) => {
    e?.preventDefault();
    const cleanName = userName.trim();
    if (!cleanName) {
      setErrorMsg('Silakan masukkan nama atau inisial Anda');
      return;
    }

    setErrorMsg('');
    localStorage.setItem('poll_guest_name', cleanName);
    setIsJoined(true);

    // Kirim info Presence ke Supabase agar nama muncul live di layar Host
    const ch = supabase.channel(`poll_room_${pollId}`);
    ch.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await ch.track({ name: cleanName });
      }
    });
    channelRef.current = ch;
  };

  // Saat mahasiswa memilih opsi jawaban
  const handleVote = async (optionId) => {
    if (hasVoted || submitting) return;

    setSubmitting(true);
    setErrorMsg('');

    try {
      const { error } = await supabase.from('poll_votes').insert({
        poll_id: pollId,
        option_id: optionId,
        voter_name: userName || 'Anonim',
      });

      if (error) {
        console.error('Error inserting vote:', error);
        setErrorMsg('Gagal mengirim suara. Silakan coba lagi.');
        setSubmitting(false);
        return;
      }

      // Tandai sudah vote di browser ini
      localStorage.setItem(`poll_voted_${pollId}`, optionId);
      setSelectedOptionId(optionId);
      setHasVoted(true);
      fireCelebration();
    } catch (err) {
      console.error(err);
      setErrorMsg('Terjadi kendala saat voting.');
    } finally {
      setSubmitting(false);
    }
  };

  // 1. STATE BELUM JOIN (INPUT NAMA)
  if (!isJoined && !hasVoted) {
    return (
      <div 
        style={{
          minHeight: '100vh',
          backgroundColor: '#090d16',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          position: 'relative'
        }}
      >
        <div className="ambient-bg">
          <div className="ambient-orb ambient-orb-1" />
          <div className="ambient-orb ambient-orb-2" />
        </div>

        <div 
          className="glass-panel animate-fade-in"
          style={{
            maxWidth: '420px',
            width: '100%',
            padding: '2.25rem 2rem',
            textAlign: 'center',
            position: 'relative',
            zIndex: 10,
            border: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          <div 
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem auto'
            }}
          >
            <Radio size={28} color="#818cf8" style={{ animation: 'pulse 1.5s infinite' }} />
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
            Selamat Datang!
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
            Masukkan nama Anda untuk bergabung ke sesi polling interaktif di layar depan.
          </p>

          <form onSubmit={handleJoin}>
            <div style={{ marginBottom: '1rem', textAlign: 'left' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                Nama Mahasiswa / Peserta
              </label>
              <input
                type="text"
                placeholder="Contoh: Budi Santoso"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="input-field"
                autoFocus
              />
            </div>

            {errorMsg && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#f87171', fontSize: '0.85rem', marginBottom: '1rem', justifyContent: 'center' }}>
                <AlertCircle size={15} /> {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={!userName.trim()}
              className="btn-primary"
              style={{ width: '100%', padding: '0.9rem' }}
            >
              Masuk Sesi Polling <ArrowRight size={18} />
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Nama Anda akan langsung tampil di bubble peserta layar proyektor
            </span>
          </div>
        </div>
      </div>
    );
  }

  // 2. STATE SUDAH VOTING (TERIMA KASIH & CELEBRATION)
  if (hasVoted) {
    const selectedOption = options.find(o => o.id === selectedOptionId);

    return (
      <div 
        style={{
          minHeight: '100vh',
          backgroundColor: '#090d16',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          position: 'relative'
        }}
      >
        <div className="ambient-bg">
          <div className="ambient-orb ambient-orb-1" />
          <div className="ambient-orb ambient-orb-2" />
        </div>

        <div 
          className="glass-panel animate-fade-in"
          style={{
            maxWidth: '440px',
            width: '100%',
            padding: '2.5rem 2rem',
            textAlign: 'center',
            position: 'relative',
            zIndex: 10,
            border: '1px solid rgba(16, 185, 129, 0.3)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
          }}
        >
          <div 
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              border: '2px solid rgba(16, 185, 129, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto'
            }}
          >
            <CheckCircle2 size={40} color="#10b981" />
          </div>

          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
            Terima Kasih, {userName || 'Mahasiswa'}!
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
            Suara Anda telah berhasil dikirim dan dihitung secara realtime di layar proyektor.
          </p>

          {selectedOption && (
            <div 
              style={{
                backgroundColor: 'rgba(30, 41, 59, 0.8)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                padding: '1rem',
                borderRadius: '0.85rem',
                marginBottom: '1.5rem',
                textAlign: 'left'
              }}
            >
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#818cf8', fontWeight: 700 }}>
                Pilihan Anda:
              </span>
              <p style={{ color: '#f1f5f9', fontWeight: 600, marginTop: '0.25rem', fontSize: '1.05rem' }}>
                {selectedOption.text}
              </p>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button 
              onClick={() => onNavigate && onNavigate('presentation', pollId)}
              className="btn-primary"
              style={{ width: '100%', padding: '0.85rem' }}
            >
              <Eye size={18} /> Lihat Layar Hasil Proyektor
            </button>
            <button 
              onClick={() => {
                localStorage.removeItem(`poll_voted_${pollId}`);
                setHasVoted(false);
                setSelectedOptionId(null);
              }}
              className="btn-secondary"
              style={{ width: '100%', fontSize: '0.85rem', color: '#94a3b8' }}
            >
              Ubah Jawaban Saya (Uji Coba)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. STATE MEMILIH JAWABAN (VOTING SELECTION)
  return (
    <div 
      style={{
        minHeight: '100vh',
        backgroundColor: '#090d16',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '1.5rem 1rem',
        position: 'relative'
      }}
    >
      <div className="ambient-bg">
        <div className="ambient-orb ambient-orb-1" />
        <div className="ambient-orb ambient-orb-2" />
      </div>

      <div style={{ maxWidth: '480px', width: '100%', position: 'relative', zIndex: 10 }}>
        {/* User Badge Top */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(30,41,59,0.7)', padding: '0.4rem 0.85rem', borderRadius: '2rem', border: '1px solid rgba(255,255,255,0.08)' }}>
            <UserCheck size={14} color="#34d399" />
            <span style={{ fontSize: '0.85rem', color: '#e2e8f0', fontWeight: 600 }}>{userName}</span>
          </div>

          <span style={{ fontSize: '0.75rem', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#38bdf8', animation: 'ping 1.5s infinite' }} />
            Tersambung Realtime
          </span>
        </div>

        {/* Question Header Card */}
        <div 
          className="glass-panel" 
          style={{ 
            padding: '1.5rem', 
            borderRadius: '1.25rem', 
            marginBottom: '1.25rem',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.3)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#818cf8', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
            <HelpCircle size={14} /> Pertanyaan Polling
          </div>
          <h2 style={{ fontSize: 'clamp(1.2rem, 3vw, 1.5rem)', fontWeight: 800, color: '#ffffff', lineHeight: 1.35 }}>
            {poll?.question}
          </h2>
        </div>

        {errorMsg && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#fca5a5', padding: '0.75rem', borderRadius: '0.75rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
            {errorMsg}
          </div>
        )}

        {/* Options List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {options.length === 0 ? (
            <div className="glass-panel" style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem 1.5rem', borderRadius: '1rem' }}>
              <p style={{ marginBottom: '0.75rem', fontSize: '0.95rem', color: '#f1f5f9' }}>Pilihan jawaban belum dimuat atau sesi belum disinkronkan.</p>
              <button 
                onClick={() => window.location.reload()}
                className="btn-secondary"
                style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
              >
                Muat Ulang Halaman
              </button>
            </div>
          ) : (
            options.map((opt, idx) => (
              <button
                key={opt.id}
                onClick={() => handleVote(opt.id)}
                disabled={submitting}
                className="glass-card-interactive"
                style={{
                  width: '100%',
                  background: 'rgba(30, 41, 59, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '1rem',
                  padding: '1.15rem 1.25rem',
                  textAlign: 'left',
                  cursor: submitting ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  color: '#ffffff'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <span 
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(99, 102, 241, 0.2)',
                      border: '1px solid rgba(99, 102, 241, 0.4)',
                      color: '#a5b4fc',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      flexShrink: 0
                    }}
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span style={{ fontSize: '1rem', fontWeight: 600, color: '#f8fafc' }}>
                    {opt.text}
                  </span>
                </div>

                <div 
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Send size={14} color="#818cf8" />
                </div>
              </button>
            ))
          )}
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#64748b', marginTop: '1.5rem' }}>
          Sentuh salah satu pilihan di atas untuk langsung mengirim suara Anda.
        </p>
      </div>
    </div>
  );
}
