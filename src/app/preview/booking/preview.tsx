'use client'
import { useState } from 'react'
import BookingExtras, { BookingPriceBreakdown } from '@/components/BookingExtras'
import { rentalTotal } from '@/lib/booking'
export default function Preview() {
  const [selected, setSelected] = useState<string[]>([])
  return <main style={{maxWidth:760, margin:'24px auto', padding:24, background:'#fff', color:'#142f52', borderRadius:20}}>
    <h1>Dodaci uz najam</h1><p>Lokalni pregled obrasca · 7 dana · ogledna osnovna cijena 50 €/dan. Ne šalje rezervacije.</p>
    <BookingExtras selected={selected} onChange={setSelected} days={7} />
    <BookingPriceBreakdown selected={selected} days={7} dailyRate={50} />
    <p role="status">Okvirno ukupno: {rentalTotal(50,7,selected).toLocaleString('hr-HR',{style:'currency',currency:'EUR'})}</p>
  </main>
}
