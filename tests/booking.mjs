import assert from 'node:assert/strict'
import ts from 'typescript'
import { readFileSync } from 'node:fs'
const js = ts.transpileModule(readFileSync('src/lib/booking.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 } }).outputText
const { rentalDays, rentalTotal } = await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`)
assert.equal(rentalDays('2027-03-27', '2027-03-29'), 2) // DST must not change charged days
assert.equal(rentalDays('2028-02-28', '2028-03-01'), 2)
for (const [a,b] of [['2027-02-29','2027-03-02'],['2027-04-01','2027-04-01'],['2027-04-02','2027-04-01'],['','2027-04-01']]) assert.throws(() => rentalDays(a,b))
assert.equal(rentalTotal(45,3,['gps'],10),135)
assert.throws(() => rentalTotal(45,3,['gps','gps']))
assert.throws(() => rentalTotal(45,3,['border_eu','border_noneu']))
assert.throws(() => rentalTotal(45,3,['constructor']))
assert.throws(() => rentalTotal(-1,3,[]))
assert.throws(() => rentalTotal(45,3,[],101))
console.log('PASS: calendar dates, DST, leap years, invalid ranges, quote math and invalid extras.')
