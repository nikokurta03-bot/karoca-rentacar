import { readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
const root = process.env.PGLITE_ROOT
const { PGlite } = await import(root ? pathToFileURL(`${root}/dist/index.js`) : '@electric-sql/pglite')
const { btree_gist } = await import(root ? pathToFileURL(`${root}/dist/contrib/btree_gist.js`) : '@electric-sql/pglite/contrib/btree_gist')
const db = new PGlite({ extensions: { btree_gist } })
await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;
CREATE SCHEMA auth;
CREATE FUNCTION auth.role() RETURNS text LANGUAGE sql AS $$ SELECT current_user::text $$;
CREATE FUNCTION auth.jwt() RETURNS jsonb LANGUAGE sql AS $$ SELECT COALESCE(nullif(current_setting('test.jwt',true),''),'{}')::jsonb $$;
GRANT USAGE ON SCHEMA auth TO anon,authenticated;
`)
for (const path of ['supabase-schema.sql','create-promo-codes.sql','create-api-keys.sql']) {
  const sql = readFileSync(path, 'utf8').replace('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";', '').replaceAll('uuid_generate_v4()', 'gen_random_uuid()')
  await db.exec(sql)
}
// Include the additional private tables discovered in the live schema.
await db.exec(`CREATE TABLE customers (id integer); CREATE TABLE invoices (id integer);
INSERT INTO customers VALUES (1); INSERT INTO invoices VALUES (1);
GRANT ALL ON customers,invoices,api_keys,promo_codes,bookings TO anon,authenticated;
CREATE POLICY old_customer_access ON customers TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY old_invoice_access ON invoices TO authenticated USING (true) WITH CHECK (true);`)
await db.exec(readFileSync('migrations/20260916_access_containment.sql', 'utf8'))
await db.exec('SET ROLE anon')
for (const table of ['api_keys','promo_codes','bookings','customers','invoices']) {
  await assert.rejects(db.query(`SELECT * FROM ${table}`))
}
await db.exec('RESET ROLE; SET ROLE authenticated')
for (const table of ['api_keys','promo_codes','bookings','customers','invoices']) {
  assert.equal((await db.query(`SELECT * FROM ${table}`)).rows.length, 0)
  await assert.rejects(db.query(`TRUNCATE ${table}`))
}
await db.exec('RESET ROLE')
await db.exec(readFileSync('migrations/20260916_secure_booking.sql', 'utf8'))
const { rows: vehicles } = await db.query('SELECT id, price_per_day FROM vehicles ORDER BY price_per_day')
const vehicle = vehicles[0]
const base = { request_id: randomUUID(), vehicle_id: vehicle.id, customer_name: 'Test User', customer_email: 'test@example.invalid', customer_phone: '+385000000', pickup_location: 'Zadar - Centar', pickup_date: '2027-06-01', return_date: '2027-06-04', selected_extras: ['gps'], deposit_confirmed: true, total_price: 0.01 }
const submit = async payload => (await db.query('SELECT submit_booking($1::jsonb) AS result', [JSON.stringify(payload)])).rows[0].result
await assert.rejects(submit({ ...base, request_id: randomUUID(), selected_extras: ['border_eu','border_noneu'] }))
const first = await submit(base)
assert.equal(first.total_price, (Number(vehicle.price_per_day) + 5) * 3, 'client price ignored')
const replay = await submit(base)
assert.equal(replay.id, first.id)
assert.equal(replay.replayed, true)
await assert.rejects(submit({ ...base, request_id: randomUUID(), return_date: base.pickup_date }))
await assert.rejects(submit({ ...base, request_id: randomUUID(), pickup_date: '2027-03-30', return_date: '2027-04-03' }))
await assert.rejects(submit({ ...base, customer_name: 'Changed name' }))
await assert.rejects(submit({ ...base, request_id: randomUUID(), selected_extras: ['gps','gps'] }))
await assert.rejects(submit({ ...base, request_id: randomUUID(), selected_extras: ['constructor'] }))
await db.query("UPDATE bookings SET status='confirmed' WHERE id=$1", [first.id])
await assert.rejects(submit({ ...base, request_id: randomUUID() }), 'confirmed vehicle blocked')
const adjacent = await submit({ ...base, request_id: randomUUID(), pickup_date: '2027-06-04', return_date: '2027-06-06', promo_code: 'KAROCA10' })
assert.equal(adjacent.total_price, (Number(vehicle.price_per_day) + 5) * 2 * .9)
await db.query("UPDATE promo_codes SET valid_until='2020-01-01' WHERE code='KAROCA10'")
await assert.rejects(submit({ ...base, request_id: randomUUID(), pickup_date: '2027-08-01', return_date: '2027-08-03', promo_code: 'KAROCA10' }))
await db.query("UPDATE promo_codes SET uses_remaining=1 WHERE code='SUMMER20'")
const discounted = { ...base, request_id: randomUUID(), pickup_date: '2027-08-01', return_date: '2027-08-03', promo_code: 'SUMMER20' }
await submit(discounted)
await submit(discounted) // retry must not consume twice
await assert.rejects(submit({ ...discounted, request_id: randomUUID() }))
// Pending requests may overlap, but both cannot become confirmed.
const overlap = await submit({ ...base, request_id: randomUUID(), pickup_date: '2027-06-04', return_date: '2027-06-05' })
await db.query("UPDATE bookings SET status='confirmed' WHERE id=$1", [adjacent.id])
await assert.rejects(db.query("UPDATE bookings SET status='confirmed' WHERE id=$1", [overlap.id]))
await db.query("UPDATE vehicles SET vehicle_status='Servis' WHERE id=$1",[vehicle.id])
await assert.rejects(submit({ ...base, request_id: randomUUID(), pickup_date: '2027-09-01', return_date: '2027-09-02' }))
await db.exec('SET ROLE anon')
await assert.rejects(db.query('SELECT * FROM karoca_backup_20260916.bookings'))
await assert.rejects(db.query('SELECT * FROM bookings'))
await assert.rejects(db.query('SELECT * FROM api_keys'))
await assert.rejects(submit({ ...base, request_id: randomUUID() }))
const catalog = (await db.query("SELECT public_vehicle_catalog('2027-06-01','2027-06-02') AS data")).rows[0].data
assert(!catalog.some(v => v.id === vehicle.id))
assert(catalog.every(v => !('license_plate' in v) && !('mileage' in v)))
await db.exec('RESET ROLE; SET ROLE authenticated')
for (const table of ['bookings','customers','invoices']) assert.equal((await db.query(`SELECT * FROM ${table}`)).rows.length, 0, 'ordinary users cannot read private records')
await db.exec(`SET test.jwt = '{"app_metadata":{"role":"admin"}}'`)
assert((await db.query('SELECT * FROM bookings')).rows.length > 0, 'trusted admin can read')
await db.close()
console.log('PASS: SQL migration, server pricing, dates, extras, retries, availability, promo expiry/usage, overlap constraint, public privacy and staff RLS.')
