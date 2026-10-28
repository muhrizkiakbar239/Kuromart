import 'dotenv/config';

export const env = {
  port: Number(process.env.PORT) || 3000,
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  productBucket: process.env.SUPABASE_PRODUCT_BUCKET || 'product-images',
  maxImageBytes: 2 * 1024 * 1024
};

export function assertEnv() {
  const missing = ['supabaseUrl', 'supabaseAnonKey', 'supabaseServiceKey'].filter((key) => !env[key]);
  if (missing.length) {
    throw new Error(`Variabel lingkungan belum diisi di .env: ${missing.join(', ')}`);
  }
}
