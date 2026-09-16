/** Calendar dates are UTC day boundaries; return day is not charged. */
export function rentalDays(from: string, to: string): number {
  const parse = (value: string) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error('Neispravan datum.')
    const time = Date.parse(`${value}T00:00:00Z`)
    if (!Number.isFinite(time) || new Date(time).toISOString().slice(0, 10) !== value) throw new Error('Neispravan datum.')
    return time
  }
  const days = (parse(to) - parse(from)) / 86400000
  if (days < 1 || days > 365) throw new Error('Najam mora trajati između 1 i 365 dana.')
  return days
}
export const extraRates: Record<string, number> = { cdw: 15, glass: 8, infant: 10, child: 10, booster: 5, border_eu: 50, border_noneu: 100, cleaning: 15, gps: 5 }
export function rentalTotal(rate: number, days: number, extras: string[], discount = 0) {
  if (!Number.isFinite(rate) || rate <= 0 || !Number.isInteger(days) || days < 1 || days > 365 || !Number.isFinite(discount) || discount < 0 || discount > 100) throw new Error('Neispravna cijena.')
  if (extras.includes('border_eu') && extras.includes('border_noneu')) throw new Error('Odaberite jednu opciju prelaska granice.')
  if (new Set(extras).size !== extras.length || extras.some(id => !Object.hasOwn(extraRates, id))) throw new Error('Neispravni dodaci.')
  return Math.round((rate + extras.reduce((sum, id) => sum + extraRates[id], 0)) * days * (1 - discount / 100) * 100) / 100
}
export const publicVehicleFields = 'id,name,category,image_url,price_per_day,seats,transmission,fuel_type,features,rating,available'
