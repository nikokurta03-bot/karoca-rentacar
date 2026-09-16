import { readFormJson } from '@/lib/request'
import { NextResponse } from 'next/server'
import { bookingOpensOn } from '@/lib/business'
import { serverDb, isAdmin } from '@/lib/server-db'
import { rentalDays, extraRates } from '@/lib/booking'
import { sendBookingConfirmation } from '@/lib/email'

export async function POST(request: Request) {
  let body: Record<string, any>
  try {
    body = await readFormJson(request)
    if (!body || typeof body !== 'object') throw new Error()
    const strings = ['vehicle_id', 'customer_name', 'customer_email', 'customer_phone', 'pickup_location', 'pickup_date', 'return_date']
    if (strings.some(k => typeof body[k] !== 'string' || !body[k].trim() || body[k].length > 255)) throw new Error()
    if (!/^[0-9a-f-]{36}$/i.test(body.vehicle_id) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.customer_email)) throw new Error()
    rentalDays(body.pickup_date, body.return_date)
    const today = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Zagreb' }).format(new Date())
    if (body.pickup_date < today || body.pickup_date < bookingOpensOn || body.deposit_confirmed !== true) throw new Error()
    if (!['Zadar - Zračna luka', 'Zadar - Centar', 'Zadar - Autobusni kolodvor'].includes(body.pickup_location)) throw new Error()
    if (!Array.isArray(body.selected_extras) || body.selected_extras.length > 9 || body.selected_extras.some((id: unknown) => typeof id !== 'string' || !Object.hasOwn(extraRates, id)) || new Set(body.selected_extras).size !== body.selected_extras.length) throw new Error()
    if (body.selected_extras.includes('border_eu') && body.selected_extras.includes('border_noneu')) throw new Error()
    if (body.extra_notes !== undefined && (typeof body.extra_notes !== 'string' || body.extra_notes.length > 2000)) throw new Error()
    if (body.promo_code !== undefined && (typeof body.promo_code !== 'string' || body.promo_code.length > 20)) throw new Error()
    if (typeof body.request_id !== 'string' || !/^[0-9a-f-]{36}$/i.test(body.request_id)) throw new Error()
  } catch {
    return NextResponse.json({ error: 'Provjerite datume, kontaktne podatke i odabrane dodatke.' }, { status: 400 })
  }
  try {
    const { data, error } = await serverDb().rpc('submit_booking', { payload: body })
    if (error || !data) return NextResponse.json({ error: 'Upit nije spremljen. Provjerite dostupnost i promo kod ili nas kontaktirajte.' }, { status: 409 })
    let emailSent = false
    if (!data.replayed) {
      const result = await sendBookingConfirmation({ customerName: body.customer_name, customerEmail: body.customer_email, vehicleName: data.vehicle_name, pickupDate: body.pickup_date, returnDate: body.return_date, pickupLocation: body.pickup_location, totalPrice: data.total_price, selectedExtras: body.selected_extras })
      emailSent = result.success
    }
    return NextResponse.json({ booking: { id: data.id, total_price: data.total_price }, emailSent }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Slanje upita trenutačno nije dostupno. Molimo kontaktirajte nas.' }, { status: 503 })
  }
}
export async function GET(request: Request) {
  if (!await isAdmin(request)) return NextResponse.json({ error: 'Nedopušten pristup.' }, { status: 401 })
  const { data, error } = await serverDb().from('bookings').select('*,vehicle:vehicles(name)').order('created_at', { ascending: false }).limit(500)
  if (error) return NextResponse.json({ error: 'Podatke nije moguće učitati.' }, { status: 503 })
  return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } })
}
