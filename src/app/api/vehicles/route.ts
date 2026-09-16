import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { rentalDays } from '@/lib/booking'
import { bookingOpensOn } from '@/lib/business'
export const dynamic = 'force-dynamic'
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams
  const from = params.get('from'), to = params.get('to')
  try { if (from || to) { rentalDays(from || '', to || ''); if (from! < bookingOpensOn) throw new Error() } } catch {
    return NextResponse.json({ error: 'Odaberite valjane datume najma.' }, { status: 400 })
  }
  const { data, error } = await supabase.rpc('public_vehicle_catalog', { start_on: from || null, end_on: to || null })
  if (error) return NextResponse.json({ error: 'Ponudu trenutačno nije moguće učitati.' }, { status: 503 })
  const category = params.get('category')
  return NextResponse.json(category && category !== 'Svi' ? data.filter((v: { category: string }) => v.category === category) : data)
}
