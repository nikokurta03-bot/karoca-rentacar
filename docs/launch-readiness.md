# Karoca — priprema za sezonu

Potvrđeno od vlasnika 16. rujna 2026.:
- Početak najma: **1. travnja 2027.** (naknadna ispravka ranije navedenog datuma 2026.).
- Flota: **5 Suzuki Vitara, godište 2026.**
- Dnevne/sezonske cijene i registracije još nisu potvrđene.

## Projekt i opseg

Aktivna radna kopija: `/Users/nikokurta/Documents/ChatGPT/Karoca Rent A Car`.
Izvor: `/Users/nikokurta/.gemini/antigravity/html`; izvorna mapa nije promijenjena.
Kopije `scratch/rent-a-car` nemaju izvorni kod sučelja.
Nema objave ni slanja emailova tijekom razvoja. Na živoj bazi primijenjena je zasebna zaštita pristupa uz korisničku potvrdu; puna migracija rezervacija još nije primijenjena.

## Pripremljeno

- Dorada naslovnice, mobilnog obrasca, kontrasta i logotipa; uklonjeni ogledni brojači, recenzije i lažna newsletter potvrda.
- Datumi od 1.4.2027., ne prije današnjeg dana, povrat nakon preuzimanja.
- Upit ne predstavlja potvrđeni najam; konačna cijena vraća se iz baze.
- Administracija: raspored, pretraga, statusi na hrvatskom, prikaz grešaka i pristup uz trusted app_metadata.role=admin.
- API validacija, server-only ključ, ograničena javna projekcija vozila.
- SQL migracija: staff RLS, kontrolirani javni katalog, autoritativne cijene, validacija popusta, ponovljeni zahtjevi i zabrana preklapanja potvrđenih rezervacija.
- Lokalni SQL testovi koriste PGlite s pravim PostgreSQL pravilima, ali simuliranim auth.jwt() kontekstom. To ne zamjenjuje provjeru na Supabase staging projektu.

## Prije objave — nužni koraci

1. Napraviti backup i staging kopiju stvarne baze te usporediti shemu s lokalnim SQL datotekama. Lokalni SQL nije dokaz trenutnih pravila produkcijske baze.
2. Dodijeliti vlasničkom računu `app_metadata.role: admin` kroz pouzdan administratorski pristup. Korisnički `user_metadata` i email nisu ovlast.
3. Primijeniti `migrations/20260916_secure_booking.sql` na staging. Migracija zamjenjuje postojeće politike za sedam navedenih tablica (kupci i računi ako postoje); provjeriti postojeće integracije. Namjerno se prekida ako postoje konfliktne potvrđene rezervacije. Nije predviđena za ponavljanje nakon uspješne primjene.
4. Postaviti `SUPABASE_SERVICE_ROLE_KEY` samo u serversku okolinu. Javni URL i anon ključ već postoje u lokalnoj kopiji; serverski ključ nije pronađen niti izmišljen. Bez njega slanje upita i poruka vraća jasnu nedostupnost. Katalog traži novu SQL funkciju i bez migracije pokazuje stanje pogreške.
5. Unijeti 5 stvarnih Vitara, godište 2026., s internim identifikatorima/registracijama i potvrđenim cijenama. Ne aktivirati testne automobile iz početne sheme. `src/lib/business.ts` bilježi potvrđeni plan flote, nije zamjena za stvarne zapise u bazi.
6. Potvrditi dodatke: postojeći cjenik sve računa po danu, uključujući čišćenje i granicu. Dnevni/jednokratni obračun mora potvrditi vlasnik prije aktivacije. Trenutno zadržana postojeća logika; iznosi su isti na klijentu i u SQL funkciji.
7. Potvrditi polog (u starom kodu 700 €), police osiguranja, dob i vozački staž, gorivo, kašnjenje i prekogranični najam. Uskladiti generirani ugovor i sve javne tvrdnje.
8. Potvrditi telefon, email, adresu, stvarnu pravnu osobu, OIB i lokacije preuzimanja. Objaviti stvarne uvjete najma i obavijest o privatnosti; kontaktni linkovi nisu zamjena za te dokumente.
9. Postaviti verificirani `RESEND_FROM_EMAIL` i `RESEND_API_KEY`. Testirati dostavu samo na odobreni testni pretinac; do tada bez tvrdnje da je email poslan.
10. Dodati produkcijsko ograničavanje javnih zahtjeva (WAF/rate limiting ili provjeren CAPTCHA mehanizam) za kontakt/rezervacije; ograničiti javnu registraciju u Supabase Auth.
11. Na stagingu provjeriti anon pristup, običnog korisnika, admina, dva istodobna potvrđivanja, rezervaciju i email od početka do kraja, otkazivanje i održavanje vozila te mobilni prikaz administracije s realnim duljinama podataka.
12. Tek potom objaviti. Izgled i uspješan build sami po sebi nisu spremnost za rad.

## Lokalne provjere

`npm test` — datumi, cijena, SQL migracija, popusti, preklapanja i prava pristupa.
`npm run build` — produkcijska kompilacija.
`npm run dev -- --hostname 127.0.0.1` — lokalni pregled.

## Rezultati provjera 16.9.2026.

- Next.js 16.3.5 / React 19.3.0: produkcijska kompilacija i TypeScript prolaze.
- `npm audit`: 0 prijavljenih ranjivosti nakon nadogradnje.
- Oba lokalna testna paketa prolaze (datum početka, kalendarski dani/DST, cijene, SQL/RLS, idempotentnost, preklapanja i promo kodovi).
- HTTP testovi odbijaju javni pristup rezervacijama, isključenu email-test rutu, datume prije početka sezone, nevaljane obrasce i prevelike poruke.
- Vizualno pregledana naslovnica, mobilni prikaz 390 px, otvaranje/zatvaranje navigacije i administratorska prijava.
- Puna prijavljena administracija i uspješno slanje upita nisu testirani na stvarnom Supabase računu: nedostaju administratorski pristup i serverski ključ. SQL migracija nije primijenjena na Supabase.
- Za ponavljanje HTTP provjera uz pokrenutu lokalnu stranicu: `node tests/api-smoke.mjs`.

Dokumentacija nadogradnje: https://nextjs.org/docs/app/guides/upgrading/version-16

Administracija sada omogućuje dodavanje vozila (naziv, godište, mjenjač, gorivo, sjedala, cijena i ostali postojeći podaci). Nova vozila ostaju nedostupna javnosti do ručnog uključivanja. Vozila sa statusom Servis izostavljaju se iz javnog kataloga i ne mogu primati upite kroz novu SQL funkciju. Partnerski ključevi generiraju se kriptografski sigurnim generatorom; postojeći ključevi nisu rotirani niti mijenjani.

## Povezivanje stvarnog projekta

Potvrđeno da lokalni javni URL pokazuje na projekt `vyngksvfnavyzuywtzks`. Korisnik je obnovio projekt i dashboard sada prikazuje Healthy. Automatsko praćenje obnove je pauzirano.

Read-only pregled 16.9.2026. potvrdio je sedam tablica: vehicles, bookings, contact_messages, promo_codes, api_keys, customers i invoices. API ključevi i promo kodovi nemaju aktivan RLS, a anon i authenticated imaju široke tablične ovlasti. Pravila rezervacija, kupaca i računa dopuštaju pristup svim authenticated korisnicima. To potvrđuje izloženost kroz dozvole, ne dokazuje da je netko podatke preuzeo.

Pripremljena i lokalno testirana zasebna zaštita `migrations/20260916_access_containment.sql`: uključuje RLS, uklanja anon/PUBLIC ovlasti privatnih tablica, uklanja TRUNCATE/REFERENCES/TRIGGER za authenticated te dodaje restriktivni uvjet trusted admin. Ne mijenja zapise ni korisničke uloge. Ključevi nakon uključivanja RLS ostaju nedostupni klijentu jer nemaju postojeću dopuštajuću politiku. Puna migracija kasnije dodaje kontrolirani administratorski pristup.

**Status zaštite: PRIMIJENJENA i provjerena 16.9.2026., nakon korisničke potvrde.** SQL editor je prikazao uspjeh. Naknadni read-only pregled potvrdio je RLS=true, odsutnost anon/PUBLIC tabličnih ovlasti i RESTRICTIVE pravilo require_trusted_admin s uvjetom app_metadata.role=admin za čitanje i pisanje na svih pet tablica. Za authenticated uklonjene su ovlasti TRUNCATE/REFERENCES/TRIGGER; ostale postojeće ovlasti ograničava RLS. Podaci i korisničke uloge nisu mijenjani. Javni izravni upis rezervacija sada je blokiran do povezivanja nove serverske rute. Nova ruta još zahtijeva serverski ključ i punu migraciju. Nema objave stranice niti slanja emailova.

## Nastavak povezivanja

Preflight stvarne baze: 3 rezervacije, 6 vozila, 0 preklapanja potvrđenih rezervacija, 0 neispravnih redoslijeda datuma/nenaplatnih rezervacija. Puna migracija sada prije izmjena sprema privatnu kopiju sedam tablica i postojećih pravila/dozvola u `karoca_backup_20260916`, u istoj transakciji. Kopija je unutar iste baze (nije vanjski disaster-recovery backup); anon i authenticated nemaju pristup. Lokalni SQL testovi prolaze uključujući zaštitu kopije. Migracija još NIJE primijenjena.

U dashboardu postoji već izdan serverski secret ključ. Nije spremljen u lokalnu okolinu: čeka završnu potvrdu privilegiranog pristupa zatraženu kroz pitanje u razgovoru. `scripts/local-supabase-setup.mjs` priprema privremeni loopback obrazac za unos bez ispisa ključa u razgovoru; servis je trenutačno zaustavljen. Nakon povezivanja treba ponovno pokrenuti aplikaciju, provjeriti RPC i cijeli tok upita. Vanjsko slanje emaila ostaje isključeno bez potvrđene konfiguracije.

## Čišćenje i optimizacija 16.9.2026.

Uz izričitu potvrdu vlasnika obrisana su samo tri lažna upita (dsa, niko, fdafa; 15.–22.3.2026.). Naknadni SQL pregled po sva tri UUID-a vraća 0 preostalih zapisa.

DNS MX domene karoca-rentacar.hr: mx1.larksuite.com (1), mx2.larksuite.com (5), mx3.larksuite.com (10). Pošta je usmjerena na Lark. Prijava: https://www.larksuite.com/mail; administracija: https://www.larksuite.com/admin. Izvorni kod navodi niko.kurta03@karoca-rentacar.hr kao ranijeg administratora; postojanje pretinca i stvarna Lark uloga nisu provjereni prijavom. Javna adresa info@karoca-rentacar.hr zamijenila je netočnu info@karoca.hr u sučelju, metapodacima, predlošku emaila i PDF-u.

Optimizacija: sizes za hero i kartice vozila, PDF biblioteka učitava se na zahtjev uz obradu pogreške, zaštita od zastarjelih odgovora pri pretrazi vozila, latin-ext i font-display swap, robots.txt, sitemap bez fragmenata, dijeljenje koristi postojeću sliku umjesto nepostojeće og-image.jpg, uklonjeni zastarjeli preconnect i nepotvrđena strukturirana adresa/društveni profili. PDF je označen kao nacrt i uklonjen je lažni OIB. Produkcijski build i testovi prolaze. Nova lokalna verzija radi na http://127.0.0.1:3001.

Ovo nije dovršena produkcijska objava: serverski ključ i puna migracija još čekaju prethodno zatraženu potvrdu povezivanja; cijene, poslovni podaci i uvjeti još trebaju vlasničku potvrdu. Prijava u Lark zahtijeva korisnika; nije slana pošta ni prihvaćen ugovor u njegovo ime.

## Otvoreni zadatak: email

Pristup Lark Mailu NIJE riješen. Vlasnik je ispravio korisničko ime na **niko.kurta@karoca-rentacar.hr** (bez 03). Ne izjednačavati ga s ranijom hardkodiranom admin adresom web-stranice. Oporavak prijave i provjera pristupa pretincu info@karoca-rentacar.hr ostaju za odraditi.

## Rezervacijski dodaci prema Avia primjeru

Pregledan https://www.avia-rentacar.hr/en/avia/reservation_accessories: odvojeno osiguranje, dodaci, cijene i nastavak na podatke. Taj javno indeksirani prikaz sadrži stare HRK iznose; nisu korišteni kao Karocin cjenik.

Karoca obrazac sada ima grupe Osiguranje, Dječje sjedalice, Prelazak granice i Ostali dodaci, vidljive checkbox/radio kontrole i pregled pojedinačnih iznosa u oba koraka. EU i kombinirani/izvan-EU izbor međusobno su isključivi; API, kalkulator i pripremljena SQL migracija odbijaju dvostruki izbor. Iznesene tvrdnje o pokriću i pologu od 700 € zamijenjene su zahtjevom za potvrdu u ponudi. Stari iznosi i dnevni način obračuna privremeno su zadržani i označeni okvirnima, do potvrde vlasnika.

Lokalni razvojni pregled komponenti: http://127.0.0.1:3002/preview/booking (ogledna cijena, ne šalje upite). Putanja vraća 404 u produkciji. Ovaj pregled ne zamjenjuje test stvarnog spremanja nakon povezivanja Supabasea.
