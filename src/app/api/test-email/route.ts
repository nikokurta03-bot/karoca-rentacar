import { NextResponse } from 'next/server'
// Test delivery belongs in the provider console, never an unauthenticated public endpoint.
export async function GET() {
  return NextResponse.json({ error: 'Ova ruta nije dostupna.' }, { status: 404 })
}
