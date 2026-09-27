import { NextResponse } from 'next/server';

/**
 * Next.js Middleware untuk memproteksi route /admin-viewer
 * Memastikan hanya request dengan sesi autentikasi Supabase atau cookie admin yang diizinkan masuk.
 */
export function middleware(req) {
  const { pathname } = req.nextUrl;

  // Hanya proteksi route yang berawalan /admin-viewer
  if (pathname.startsWith('/admin-viewer')) {
    // 1. Cek Token Autentikasi Supabase standard di Cookie
    // Supabase menyimpan token sesi di cookie dengan pola 'sb-<project-id>-auth-token' atau 'sb-access-token'
    const cookies = req.cookies;
    const hasSbAccessToken = cookies.get('sb-access-token');
    
    // Atau token auth berbasis cookie Supabase SSR (sb-*-auth-token)
    let hasSupabaseAuthCookie = false;
    for (const [key] of cookies) {
      if (key.startsWith('sb-') && key.endsWith('-auth-token')) {
        hasSupabaseAuthCookie = true;
        break;
      }
    }

    // 2. Alternatif: Admin Secret Key via query param atau header khusus (opsional untuk audit darurat)
    const adminSecretKey = req.nextUrl.searchParams.get('admin_key');
    const isValidSecret = process.env.ADMIN_SECRET_KEY && adminSecretKey === process.env.ADMIN_SECRET_KEY;

    // Jika tidak ada session Supabase dan bukan secret key yang valid
    if (!hasSbAccessToken && !hasSupabaseAuthCookie && !isValidSecret) {
      // Simpan URL yang dituju untuk redirect balik setelah login
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

// Konfigurasi Matcher agar middleware hanya berjalan pada route admin
export const config = {
  matcher: ['/admin-viewer/:path*'],
};
