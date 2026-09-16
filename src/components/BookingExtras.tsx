'use client'

import { extraRates } from '@/lib/booking'

export const bookingExtras = [
  { id: 'cdw', group: 'Osiguranje', name: 'Dodatno osiguranje vozila', description: 'Zatražite ponudu proširenog pokrića. Opseg zaštite i učešće potvrđujemo u ponudi.' },
  { id: 'glass', group: 'Osiguranje', name: 'Zaštita stakala i guma', description: 'Zatražite dodatno pokriće za stakla i gume. Uvjete potvrđujemo prije najma.' },
  { id: 'infant', group: 'Dječje sjedalice', name: 'Sjedalica za bebu', description: 'U napomenu upišite dob, visinu i težinu djeteta radi odabira odgovarajuće sjedalice.' },
  { id: 'child', group: 'Dječje sjedalice', name: 'Dječja sjedalica', description: 'Odabir uključuje upit za jednu sjedalicu. Dostupnost i odgovarajući model potvrđujemo.' },
  { id: 'booster', group: 'Dječje sjedalice', name: 'Booster / podloška', description: 'Za dodatnu sjedalicu navedite broj djece i njihove podatke u napomeni.' },
  { id: 'border_eu', group: 'Prelazak granice', name: 'Putovanje u zemlje EU', description: 'Navedite planirane države. Odabir je zahtjev za odobrenje izlaska iz Hrvatske.' },
  { id: 'border_noneu', group: 'Prelazak granice', name: 'Putovanje izvan EU ili kombinirano', description: 'Navedite sve države putovanja, uključujući tranzit. Potrebna je prethodna potvrda.' },
  { id: 'gps', group: 'Ostali dodaci', name: 'GPS navigacija', description: 'Zatražite uređaj za navigaciju za vrijeme najma.' },
  { id: 'cleaning', group: 'Ostali dodaci', name: 'Dodatno čišćenje', description: 'Zatražite ponudu usluge čišćenja pri povratu vozila.' },
] as const
const groups = ['Osiguranje', 'Dječje sjedalice', 'Prelazak granice', 'Ostali dodaci']
const money = (value: number) => value.toLocaleString('hr-HR', { style: 'currency', currency: 'EUR' })

type Props = { selected: string[]; onChange: (ids: string[]) => void; days: number }
export default function BookingExtras({ selected, onChange, days }: Props) {
  function toggle(id: string, checked: boolean) {
    const remaining = selected.filter(value => value !== id && !(checked && id.startsWith('border_') && value.startsWith('border_')))
    onChange(checked ? [...remaining, id] : remaining)
  }
  return <div className="booking-options">
    <p className="options-note">Dodaci su opcionalni. Prikazani obračun je okviran; cijenu, raspoloživost opreme, osiguranje i polog potvrđujemo u ponudi prije prihvaćanja najma.</p>
    {groups.map((group, index) => <fieldset className="option-group" key={group}>
      <legend><span>{String(index + 1).padStart(2, '0')}</span> {group}</legend>
      {group === 'Prelazak granice' && <label className={`option-card ${!selected.some(id => id.startsWith('border_')) ? 'is-selected' : ''}`}>
        <input type="radio" name="border-option" checked={!selected.some(id => id.startsWith('border_'))} onChange={() => onChange(selected.filter(id => !id.startsWith('border_')))} />
        <span className="option-copy"><strong>Ostajem u Hrvatskoj</strong><small>Bez zahtjeva za prekogranični najam.</small></span><span className="option-cost">Bez doplate</span>
      </label>}
      {bookingExtras.filter(option => option.group === group).map(option => <label key={option.id} className={`option-card ${selected.includes(option.id) ? 'is-selected' : ''}`}>
        <input type={group === 'Prelazak granice' ? 'radio' : 'checkbox'} name={group === 'Prelazak granice' ? 'border-option' : option.id} checked={selected.includes(option.id)} onChange={event => toggle(option.id, event.target.checked)} />
        <span className="option-copy"><strong>{option.name}</strong><small>{option.description}</small></span>
        <span className="option-cost">{money(extraRates[option.id])}<small>/ dan · {money(extraRates[option.id] * days)} za najam</small><em>{selected.includes(option.id) ? 'Odabrano' : 'Dodaj u upit'}</em></span>
      </label>)}
    </fieldset>)}
  </div>
}

export function BookingPriceBreakdown({ selected, days, dailyRate }: { selected: string[]; days: number; dailyRate: number }) {
  return <div className="booking-breakdown" aria-live="polite" aria-atomic="true">
    <h3>Pregled odabira</h3>
    <dl><div><dt>Najam vozila · {days} dana × {money(dailyRate)}</dt><dd>{money(days * dailyRate)}</dd></div>
      {bookingExtras.filter(option => selected.includes(option.id)).map(option => <div key={option.id}><dt>{option.name} · {days} dana</dt><dd>{money(extraRates[option.id] * days)}</dd></div>)}
    </dl>
    {!selected.length && <p>Bez odabranih dodataka.</p>}
    <small>Postojeći okvirni obračun dodataka je po danu. Konačnu ponudu šaljemo prije potvrde najma.</small>
  </div>
}
