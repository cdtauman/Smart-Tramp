export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

if (!SUPABASE_URL) throw new Error('VITE_SUPABASE_URL is missing')
if (!SUPABASE_ANON_KEY) throw new Error('VITE_SUPABASE_ANON_KEY is missing')
if (!GOOGLE_MAPS_API_KEY) throw new Error('VITE_GOOGLE_MAPS_API_KEY is missing')