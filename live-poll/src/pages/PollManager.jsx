import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured, getActiveCredentials, updateSupabaseConfig } from '../lib/supabaseClient';
import { 
  Plus, 
  BarChart3, 
  Vote, 
  Copy, 
  Check, 
  ExternalLink, 
  Database, 
  Trash2, 
  Radio, 
  Sparkles,
  Info,
  ChevronRight,
  Settings,
  AlertCircle,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

export default function PollManager({ onNavigate }) {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSqlGuide, setShowSqlGuide] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Form State Polling
  const [title, setTitle] = useState('');
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State Kredensial Supabase
  const initialCreds = getActiveCredentials();
  const [configUrl, setConfigUrl] = useState(initialCreds.url || '');
  const [configKey, setConfigKey] = useState(initialCreds.key || '');
  const [configTesting, setConfigTesting] = useState(false);
  const [configMsg, setConfigMsg] = useState('');
  const [isConnected, setIsConnected] = useState(isSupabaseConfigured);

  useEffect(() => {
    loadPolls();

    const handleReady = (e) => {
      if (e?.detail?.isConfigured !== undefined) {
        setIsConnected(e.detail.isConfigured);
      }
      loadPolls();
    };

    window.addEventListener('supabase_client_ready', handleReady);
    return () => window.removeEventListener('supabase_client_ready', handleReady);
  }, []);

  async function loadPolls() {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('polls').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        setPolls(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleAddOptionField = () => {
    if (options.length < 6) {
      setOptions([...options, '']);
    }
  };

  const handleRemoveOptionField = (idx) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== idx));
    }
  };

  const handleOptionChange = (idx, val) => {
    const updated = [...options];
    updated[idx] = val;
    setOptions(updated);
  };

  const handleCreatePoll = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    const validOptions = options.map(o => o.trim()).filter(Boolean);
    if (validOptions.length < 2) {
      alert('Mohon masukkan minimal 2 pilihan jawaban.');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Buat UUID di client agar ID selalu pasti dan tidak undefined
      const pollId = (typeof crypto !== 'undefined' && crypto.randomUUID) 
        ? crypto.randomUUID() 
        : 'poll-' + Math.random().toString(36).substring(2, 9);

      // 1. Insert Poll
      const { error: pErr } = await supabase.from('polls').insert({
        id: pollId,
        title: title.trim() || 'Sesi Polling Baru',
        question: question.trim(),
        is_active: true
      });

      if (pErr) {
        console.error('Error creating poll:', pErr);
        throw new Error(pErr.message || 'Gagal menyimpan pertanyaan polling ke Supabase');
      }

      // 2. Batch Insert Options dengan poll_id yang sama
      const optionRows = validOptions.map((optText, idx) => ({
        id: (typeof crypto !== 'undefined' && crypto.randomUUID) 
          ? crypto.randomUUID() 
          : 'opt-' + Math.random().toString(36).substring(2, 9),
        poll_id: pollId,
        text: optText,
        order_index: idx + 1
      }));

      const { error: optErr } = await supabase.from('poll_options').insert(optionRows);

      if (optErr) {
        console.error('Error inserting poll options:', optErr);
        throw new Error(optErr.message || 'Gagal menyimpan pilihan jawaban ke Supabase');
      }

      setShowCreateModal(false);
      setTitle('');
      setQuestion('');
      setOptions(['', '', '']);
      await loadPolls();

      onNavigate('presentation', pollId);
    } catch (err) {
      console.error('Error creating poll:', err);
      alert(`Gagal membuat poll: ${err.message || 'Periksa koneksi Supabase & pastikan skrip SQL sudah dijalankan di Supabase'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyVoteLink = (pollId) => {
    const publicDomain = (import.meta.env?.VITE_PUBLIC_DOMAIN || 'https://www.portfoliogilang.my.id').replace(/\/+$/, '');
    const link = `${publicDomain}/vote?id=${pollId}`;
    navigator.clipboard.writeText(link);
    setCopiedId(pollId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setConfigTesting(true);
    setConfigMsg('');

    try {
      const valid = updateSupabaseConfig(configUrl, configKey);
      if (!valid) {
        setConfigMsg('Format URL atau Anon Key tidak valid. URL harus berawalan https:// dan Anon Key minimal 25 karakter.');
        setConfigTesting(false);
        return;
      }

      // Uji query langsung ke database Supabase
      const { data, error } = await supabase.from('polls').select('*').limit(1);
      if (error) {
        throw new Error(error.message || 'Database merespons dengan kesalahan RLS / tabel belum dibuat');
      }

      setIsConnected(true);
      setConfigMsg('✅ Sukses! Kredensial valid dan tersambung ke Supabase Cloud.');
      await loadPolls();

      setTimeout(() => {
        setShowConfigModal(false);
        setConfigMsg('');
      }, 1500);
    } catch (err) {
      console.error('Test Supabase Error:', err);
      setConfigMsg(`❌ Koneksi gagal: ${err.message}. Pastikan tabel di schema.sql sudah dibuat di Supabase SQL Editor.`);
    } finally {
      setConfigTesting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#090d16', color: '#f1f5f9', padding: '2rem 1.5rem', position: 'relative' }}>
      <div className="ambient-bg">
        <div className="ambient-orb ambient-orb-1" />
        <div className="ambient-orb ambient-orb-2" />
      </div>

      <div style={{ maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
        {/* Top Header */}
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '0.6rem', backgroundColor: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Radio size={18} color="#fff" />
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#818cf8' }}>
                Realtime Polling Platform
              </span>
            </div>
            <h1 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.25rem)', fontWeight: 800, color: '#ffffff' }}>
              Dashboard Sesi Polling
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
              Kelola pertanyaan interaktif, buka layar proyektor untuk audiens, dan bagikan tautan voting.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button 
              onClick={() => setShowConfigModal(true)}
              className="btn-secondary"
              style={{ borderColor: isConnected ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.5)' }}
            >
              <Settings size={16} color={isConnected ? '#34d399' : '#fbbf24'} />
              <span>{isConnected ? 'Koneksi: Supabase Cloud' : 'Atur Kredensial Supabase'}</span>
            </button>
            <button 
              onClick={() => setShowSqlGuide(!showSqlGuide)}
              className="btn-secondary"
            >
              <Database size={16} /> Panduan SQL
            </button>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              <Plus size={18} /> Buat Polling Baru
            </button>
          </div>
        </header>

        {/* Database Status Alert Banner */}
        <div 
          className="glass-panel" 
          style={{ 
            padding: '1rem 1.25rem', 
            borderRadius: '1rem', 
            marginBottom: '2rem',
            border: isConnected ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(245, 158, 11, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: isConnected ? '#10b981' : '#f59e0b', boxShadow: isConnected ? '0 0 10px #10b981' : '0 0 10px #f59e0b' }} />
            <div>
              <p style={{ fontWeight: 600, fontSize: '0.9rem', color: '#ffffff' }}>
                Status Database: {isConnected ? '🟢 Terhubung ke Supabase Cloud' : '🟡 Mode Demo Offline (Browser LocalStorage)'}
              </p>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                {isConnected 
                  ? 'Data soal & suara tersimpan di database Supabase Cloud. Mahasiswa di mana pun (HP/laptop) dapat melihat soal secara live.'
                  : 'Soal tersimpan di laptop ini saja. Agar mahasiswa di HP bisa melihat soal, klik tombol di kanan untuk memasukkan Supabase URL & Anon Key.'}
              </p>
            </div>
          </div>

          <button 
            onClick={() => setShowConfigModal(true)}
            className="btn-secondary"
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem', color: isConnected ? '#94a3b8' : '#fbbf24' }}
          >
            {isConnected ? 'Ubah Kredensial' : 'Hubungkan Supabase Sekarang'} <ChevronRight size={14} />
          </button>
        </div>

        {/* SQL Guide Dropdown / Card */}
        {showSqlGuide && (
          <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem', borderRadius: '1rem', marginBottom: '2rem', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Database size={18} color="#818cf8" /> Langkah Menyiapkan Database Supabase
              </h3>
              <button onClick={() => setShowSqlGuide(false)} className="btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>Tutup</button>
            </div>

            <ol style={{ paddingLeft: '1.25rem', color: '#cbd5e1', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <li>Buka dashboard proyek Anda di <b>https://supabase.com</b></li>
              <li>Masuk ke menu <b>SQL Editor</b> lalu paste seluruh kode dari file <code style={{ color: '#38bdf8' }}>live-poll/supabase/schema.sql</code> dan klik <b>RUN</b>.</li>
              <li>Buka menu <b>Project Settings &gt; Data API</b>, salin <b>Project URL</b> dan <b>anon public key</b>.</li>
              <li>Klik tombol <b>"Atur Kredensial Supabase"</b> di atas dan masukkan URL serta Anon Key Anda. Sistem akan menguji koneksi langsung secara instan!</li>
            </ol>
          </div>
        )}

        {/* Active Polls List */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>
              Daftar Sesi Polling ({polls.length})
            </h2>
            <button 
              onClick={loadPolls} 
              className="btn-secondary"
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
              title="Refresh Data"
            >
              <RefreshCw size={13} /> Refresh
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
              Memuat data polling...
            </div>
          ) : polls.length === 0 ? (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '3.5rem 2rem', borderRadius: '1.25rem' }}>
              <BarChart3 size={44} color="#64748b" style={{ margin: '0 auto 1rem auto' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Belum ada sesi polling</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto 1.5rem auto' }}>
                Buat sesi polling pertama Anda untuk memulai presentasi interaktif bersama mahasiswa atau audiens.
              </p>
              <button onClick={() => setShowCreateModal(true)} className="btn-primary">
                <Plus size={18} /> Buat Polling Sekarang
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {polls.map((poll) => (
                <div 
                  key={poll.id} 
                  className="glass-panel glass-card-interactive"
                  style={{
                    padding: '1.5rem',
                    borderRadius: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    border: '1px solid rgba(255,255,255,0.08)'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {poll.title || 'Sesi Polling'}
                      </span>
                      <span style={{ fontSize: '0.7rem', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '0.2rem 0.5rem', borderRadius: '1rem', fontWeight: 600 }}>
                        Aktif
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', lineHeight: 1.4, marginBottom: '1.25rem' }}>
                      {poll.question}
                    </h3>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      <button 
                        onClick={() => onNavigate('presentation', poll.id)}
                        className="btn-primary"
                        style={{ padding: '0.65rem 0.75rem', fontSize: '0.85rem' }}
                      >
                        <BarChart3 size={15} /> Layar Host
                      </button>

                      <button 
                        onClick={() => onNavigate('vote', poll.id)}
                        className="btn-secondary"
                        style={{ padding: '0.65rem 0.75rem', fontSize: '0.85rem' }}
                      >
                        <Vote size={15} /> Vote Peserta
                      </button>
                    </div>

                    <button 
                      onClick={() => copyVoteLink(poll.id)}
                      className="btn-secondary"
                      style={{ width: '100%', padding: '0.55rem', fontSize: '0.8rem', color: '#94a3b8' }}
                    >
                      {copiedId === poll.id ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
                      {copiedId === poll.id ? 'Tautan Voting Tersalin!' : 'Salin Tautan Voting'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Modal Pengaturan Kredensial Supabase */}
        {showConfigModal && (
          <div 
            onClick={() => setShowConfigModal(false)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.85)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 110,
              padding: '1.5rem'
            }}
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              className="glass-panel animate-fade-in"
              style={{
                maxWidth: '540px',
                width: '100%',
                backgroundColor: '#0f172a',
                padding: '2rem',
                borderRadius: '1.5rem',
                border: '1px solid rgba(99, 102, 241, 0.4)',
                boxShadow: '0 25px 50px rgba(0,0,0,0.7)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                <Settings size={22} color="#818cf8" />
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff' }}>
                  Pengaturan Koneksi Supabase Cloud
                </h2>
              </div>
              <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                Masukkan <b>Project URL</b> dan <b>Anon Key</b> dari akun Supabase Anda agar soal tersimpan di database cloud dan langsung muncul di smartphone mahasiswa saat scan QR code.
              </p>

              <form onSubmit={handleSaveConfig}>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                    Project URL (Supabase URL) *
                  </label>
                  <input 
                    type="url" 
                    placeholder="https://xyzcompany.supabase.co"
                    value={configUrl}
                    onChange={(e) => setConfigUrl(e.target.value)}
                    className="input-field"
                    required
                  />
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Ditemukan di: Supabase Dashboard &gt; Project Settings &gt; Data API &gt; Project URL
                  </span>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                    Project API Keys (Anon Public Key) *
                  </label>
                  <textarea 
                    rows={3}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={configKey}
                    onChange={(e) => setConfigKey(e.target.value)}
                    className="input-field"
                    style={{ fontSize: '0.85rem', fontFamily: 'monospace' }}
                    required
                  />
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Ditemukan di: Supabase Dashboard &gt; Project Settings &gt; Data API &gt; anon public
                  </span>
                </div>

                {configMsg && (
                  <div style={{ 
                    padding: '0.85rem 1rem', 
                    borderRadius: '0.75rem', 
                    marginBottom: '1.25rem', 
                    fontSize: '0.85rem',
                    backgroundColor: configMsg.startsWith('✅') ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    border: configMsg.startsWith('✅') ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)',
                    color: configMsg.startsWith('✅') ? '#34d399' : '#fca5a5'
                  }}>
                    {configMsg}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button 
                    type="button" 
                    onClick={() => setShowConfigModal(false)}
                    className="btn-secondary"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    disabled={configTesting || !configUrl.trim() || !configKey.trim()}
                    className="btn-primary"
                  >
                    {configTesting ? 'Menguji Koneksi...' : 'Uji & Simpan Koneksi'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Buat Polling Baru */}
        {showCreateModal && (
          <div 
            onClick={() => setShowCreateModal(false)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.85)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 100,
              padding: '1.5rem'
            }}
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              className="glass-panel animate-fade-in"
              style={{
                maxWidth: '520px',
                width: '100%',
                backgroundColor: '#0f172a',
                padding: '2rem',
                borderRadius: '1.5rem',
                border: '1px solid rgba(99, 102, 241, 0.4)',
                boxShadow: '0 25px 50px rgba(0,0,0,0.6)'
              }}
            >
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
                Buat Sesi Polling Baru
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                Tuliskan pertanyaan dan opsi pilihan yang akan dijawab oleh mahasiswa secara live.
              </p>

              <form onSubmit={handleCreatePoll}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                    Judul Sesi / Mata Kuliah (Opsional)
                  </label>
                  <input 
                    type="text" 
                    placeholder="Contoh: Kuliah Pemrograman Web - Minggu 4"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                    Pertanyaan Polling *
                  </label>
                  <textarea 
                    rows={2}
                    placeholder="Contoh: Apa topik yang paling ingin Anda perdalam hari ini?"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.5rem' }}>
                    Pilihan Jawaban (Minimal 2 opsi)
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {options.map((opt, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#818cf8', width: '20px', textAlign: 'center' }}>
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <input 
                          type="text" 
                          placeholder={`Pilihan ${String.fromCharCode(65 + idx)}`}
                          value={opt}
                          onChange={(e) => handleOptionChange(idx, e.target.value)}
                          className="input-field"
                          style={{ padding: '0.65rem 0.85rem' }}
                          required={idx < 2}
                        />
                        {options.length > 2 && (
                          <button 
                            type="button" 
                            onClick={() => handleRemoveOptionField(idx)}
                            style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: '0.3rem' }}
                            title="Hapus opsi"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {options.length < 6 && (
                    <button 
                      type="button" 
                      onClick={handleAddOptionField}
                      style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '0.85rem', cursor: 'pointer', marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}
                    >
                      <Plus size={15} /> Tambah Pilihan Jawaban
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button 
                    type="button" 
                    onClick={() => setShowCreateModal(false)}
                    className="btn-secondary"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting || !question.trim()}
                    className="btn-primary"
                  >
                    {isSubmitting ? 'Membuat...' : 'Buat & Luncurkan Poll'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
