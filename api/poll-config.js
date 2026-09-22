/**
 * Vercel Serverless Endpoint untuk membaca Environment Variables Supabase
 * Memungkinkan frontend statis di laptop dan smartphone mahasiswa mendapatkan kredensial Supabase Cloud secara aman.
 */
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const url = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

  return res.status(200).json({
    supabaseUrl: url.trim(),
    supabaseAnonKey: key.trim(),
    isConfigured: Boolean(url && key && url.startsWith('https://') && key.length > 25)
  });
};
