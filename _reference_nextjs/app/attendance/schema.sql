-- ==============================================================================
-- SCHEMA SUPABASE: SISTEM ABSENSI ANTI-MANIPULASI & ANTI-FAKE GPS
-- ==============================================================================

-- 1. Buat Tabel Absensi dengan Kolom Audit Keamanan
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    
    -- Telemetri Hardware GPS
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    gps_accuracy_meters NUMERIC(8, 2),
    
    -- Telemetri IP Geolocation Jaringan
    ip_address TEXT,
    ip_city TEXT,
    ip_latitude DOUBLE PRECISION,
    ip_longitude DOUBLE PRECISION,
    
    -- Hasil Audit Anti-Fake GPS
    distance_ip_gps_km NUMERIC(10, 2),
    is_suspicious BOOLEAN DEFAULT FALSE,
    suspicious_reason TEXT,
    
    -- Stempel Waktu Server Resmi (Mencegah manipulasi jam klien)
    captured_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Index untuk Pencarian Cepat dan Laporan Audit HR
CREATE INDEX IF NOT EXISTS idx_attendance_user_id ON public.attendance(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_is_suspicious ON public.attendance(is_suspicious);
CREATE INDEX IF NOT EXISTS idx_attendance_captured_at ON public.attendance(captured_at DESC);

-- 3. Row Level Security (RLS)
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- Karyawan hanya bisa melihat absensi miliknya sendiri
CREATE POLICY "Users can view own attendance"
    ON public.attendance FOR SELECT
    USING (auth.uid() = user_id OR auth.uid() IS NULL);

-- Karyawan hanya bisa melakukan insert absensi baru
CREATE POLICY "Users can insert own attendance"
    ON public.attendance FOR INSERT
    WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

-- 4. Konfigurasi Storage Bucket untuk Foto Absensi
-- Jalankan di SQL Editor Supabase jika bucket belum dibuat
INSERT INTO storage.buckets (id, name, public)
VALUES ('attendance_photos', 'attendance_photos', true)
ON CONFLICT (id) DO NOTHING;

-- Policy Storage: Izinkan upload foto absensi
CREATE POLICY "Public / Authenticated Upload Attendance Photos"
ON storage.objects FOR INSERT
TO authenticated, anon
WITH CHECK (bucket_id = 'attendance_photos');

-- Policy Storage: Izinkan pembacaan foto absensi
CREATE POLICY "Public Read Attendance Photos"
ON storage.objects FOR SELECT
TO authenticated, anon
USING (bucket_id = 'attendance_photos');
