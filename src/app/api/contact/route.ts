import { readFormJson } from '@/lib/request'
import { NextResponse } from 'next/server'
import { serverDb } from '@/lib/server-db'
export async function POST(request: Request) {
  let body: Record<string, any>
  try {
    body = await readFormJson(request)
    if (!body || ['name', 'email', 'message'].some(k => typeof body[k] !== 'string' || !body[k].trim())) throw new Error()
    if (body.name.length > 255 || body.email.length > 255 || body.message.length > 4000 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) throw new Error()
  } catch { return NextResponse.json({ error: 'Provjerite ime, email i poruku.' }, { status: 400 }) }
  try {
    const { error } = await serverDb().from('contact_messages').insert({ name: body.name.trim(), email: body.email.trim(), message: body.message.trim() })
    if (error) throw error
    return NextResponse.json({ success: true }, { status: 201 })
  } catch { return NextResponse.json({ error: 'Poruka nije spremljena. Molimo pokušajte kasnije.' }, { status: 503 }) }
}
