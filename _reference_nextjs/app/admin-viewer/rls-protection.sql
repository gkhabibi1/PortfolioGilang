-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) UNTUK MEMPROTEKSI TABEL ATTENDANCE
-- ==============================================================================

-- 1. Pastikan Row Level Security Aktif pada tabel attendance
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- 2. Hapus policy lama jika ada untuk mencegah konflik
DROP POLICY IF EXISTS "Public Read All Attendances" ON public.attendance;
DROP POLICY IF EXISTS "Users can view own attendance" ON public.attendance;
DROP POLICY IF EXISTS "Admins can view all attendances" ON public.attendance;
DROP POLICY IF EXISTS "Users can insert attendance" ON public.attendance;

-- 3. Policy: User Biasa hanya dapat melihat data absensi miliknya sendiri
CREATE POLICY "Users can view own attendance"
    ON public.attendance
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- 4. Policy: Admin dapat melihat SELURUH data absensi
-- Opsi A: Berdasarkan metadata pengguna auth (misal: raw_user_meta_data->>'role' = 'admin')
CREATE POLICY "Admins can view all attendances"
    ON public.attendance
    FOR SELECT
    TO authenticated
    USING (
        (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
        OR (auth.jwt() ->> 'email') IN ('admin@perusahaan.com', 'hrd@perusahaan.com')
    );

-- 5. Policy: User Terautentikasi dapat melakukan Insert Absensi Baru
CREATE POLICY "Users can insert attendance"
    ON public.attendance
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- 6. Policy: Nonaktifkan izin UPDATE dan DELETE untuk semua orang (Immutability Bukti Presensi)
-- Bukti presensi tidak boleh diubah atau dihapus oleh siapapun (kecuali Service Role / Super Admin)
-- Tidak membuat policy UPDATE/DELETE otomatis menolak operasi tersebut.

-- ==============================================================================
-- PENGATURAN STORAGE BUCKET (FOTO ABSENSI)
-- ==============================================================================
-- Pastikan hanya admin & pemilik foto yang bisa melihat foto jika bucket bersifat private:
-- (Jika bucket public, foto dapat diakses via URL acak dengan UUID unik)
