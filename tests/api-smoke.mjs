import assert from 'node:assert/strict'
// Invalid / unauthorized requests only: never creates records or sends email.
const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:3000'
const json = body => ({ method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
const cases = [
 ['/api/bookings', {}, 401],
 ['/api/test-email?email=test@example.invalid', {}, 404],
 ['/api/vehicles?from=2027-03-31&to=2027-04-05', {}, 400],
 ['/api/vehicles?from=2027-04-05&to=2027-04-04', {}, 400],
 ['/api/bookings', json({ total_price: .01 }), 400],
 ['/api/contact', json({ name: 'x', email: 'invalid', message: 'test' }), 400],
 ['/api/contact', json({ name: 'x', email: 'test@example.invalid', message: 'x'.repeat(20000) }), 400],
]
for (const [path, options, status] of cases) {
 const result = await fetch(base + path, options)
 assert.equal(result.status, status, path)
 console.log('PASS', status, path)
}
