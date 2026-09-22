-- ========================================================
-- SKEMA DATABASE SUPABASE UNTUK LIVE POLLING REALTIME
-- Jalankan skrip ini di menu SQL Editor pada Supabase Dashboard
-- ========================================================

-- 1. Hapus tabel jika sudah ada (opsional / reset)
-- DROP TABLE IF EXISTS poll_votes CASCADE;
-- DROP TABLE IF EXISTS poll_options CASCADE;
-- DROP TABLE IF EXISTS polls CASCADE;

-- 2. Tabel Sesi Poll
CREATE TABLE IF NOT EXISTS polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  question TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabel Pilihan Jawaban
CREATE TABLE IF NOT EXISTS poll_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  order_index INT DEFAULT 0
);

-- 4. Tabel Suara (Votes)
CREATE TABLE IF NOT EXISTS poll_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
  option_id UUID REFERENCES poll_options(id) ON DELETE CASCADE,
  voter_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Aktifkan Row Level Security (RLS)
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;

-- 6. Hapus policy lama jika ada untuk mencegah duplikasi nama policy
DROP POLICY IF EXISTS "Public read polls" ON polls;
DROP POLICY IF EXISTS "Public insert polls" ON polls;
DROP POLICY IF EXISTS "Public read poll_options" ON poll_options;
DROP POLICY IF EXISTS "Public insert poll_options" ON poll_options;
DROP POLICY IF EXISTS "Public read poll_votes" ON poll_votes;
DROP POLICY IF EXISTS "Public insert poll_votes" ON poll_votes;

-- 7. Policy agar semua orang (tamu / anon) bisa membaca data
CREATE POLICY "Public read polls" ON polls FOR SELECT TO anon USING (true);
CREATE POLICY "Public insert polls" ON polls FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Public read poll_options" ON poll_options FOR SELECT TO anon USING (true);
CREATE POLICY "Public insert poll_options" ON poll_options FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Public read poll_votes" ON poll_votes FOR SELECT TO anon USING (true);
CREATE POLICY "Public insert poll_votes" ON poll_votes FOR INSERT TO anon WITH CHECK (true);

-- 8. Wajib: Aktifkan Realtime untuk tabel poll_votes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'poll_votes'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE poll_votes;
  END IF;
END $$;

-- 9. (Opsional) Data Contoh Awal untuk Testing Cepat
-- Catatan: UUID statis di bawah ini memudahkan pengujian awal tanpa buat manual
INSERT INTO polls (id, title, question, is_active)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Polling Kuliah Web Development',
  'Framework frontend apa yang paling ingin Anda kuasai di tahun 2025?',
  true
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO poll_options (poll_id, text, order_index)
VALUES 
  ('a0000000-0000-0000-0000-000000000001', 'React.js / Next.js', 1),
  ('a0000000-0000-0000-0000-000000000001', 'Vue.js / Nuxt', 2),
  ('a0000000-0000-0000-0000-000000000001', 'Svelte / SvelteKit', 3),
  ('a0000000-0000-0000-0000-000000000001', 'Vanilla JS & Web Standards', 4)
ON CONFLICT DO NOTHING;
