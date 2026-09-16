import { createClient } from '@supabase/supabase-js'

// Never import this module from a client component. The key is server-only.
export function serverDb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Database service is not configured')
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}
export async function isAdmin(request: Request) {
  const token = request.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1]
  if (!token) return false
  try {
    const { data, error } = await serverDb().auth.getUser(token)
    return !error && data.user?.app_metadata?.role === 'admin'
  } catch { return false }
}
