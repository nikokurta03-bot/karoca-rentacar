'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import BookingExtras, { BookingPriceBreakdown } from '@/components/BookingExtras'
import { rentalDays, rentalTotal } from '@/lib/booking'
import { bookingOpensOn, fleetPlan } from '@/lib/business'
import {
  Car,
  MapPin,
  Calendar,
  Users,
  Fuel,
  Settings,
  Star,
  Shield,
  Clock,
  Phone,
  Mail,
  ChevronRight,
  ChevronDown,
  Menu,
  X,
  Check,
  Sparkles,
  Loader2,
  Briefcase,
  Send,
  MessageCircle,
  Luggage,
  ShieldCheck,
  Sun,
  Moon
} from 'lucide-react'


// Vehicle type from Supabase
interface Vehicle {
  id: string
  name: string
  category: string
  image_url: string
  price_per_day: number
  seats: number
  transmission: string
  fuel_type: string
  features: string[]
  rating: number
  available: boolean
}

const features = [
  {
    icon: Shield,
    title: 'Jasni uvjeti najma',
    description: 'Prije potvrde provjerite cijenu, polog i odabrano osiguranje.',
  },
  {
    icon: Clock,
    title: 'Izravan kontakt',
    description: 'Kontaktirajte nas telefonom ili pošaljite poruku.',
  },
  {
    icon: MapPin,
    title: 'Preuzimanje u Zadru',
    description: 'U upitu odaberite zračnu luku ili lokaciju u gradu.',
  },
  {
    icon: Star,
    title: 'Premium vozila',
    description: 'Usporedite vozila, opremu i prikazane dnevne cijene.',
  },
]

const howItWorks = [
  { step: '01', title: 'Rezervirajte online', description: 'Odaberite datume i vozilo te pošaljite upit. Javit ćemo vam dostupnost i uvjete najma.' },
  { step: '02', title: 'Preuzmite vozilo', description: 'Dođite na lokaciju s vozačkom dozvolom. Pregledamo vozilo zajedno.' },
  { step: '03', title: 'Uživajte u vožnji', description: 'Istražite Zadar i okolicu. Za pitanja nam se obratite izravno.' },
  { step: '04', title: 'Jednostavan povrat', description: 'Vratite vozilo na istu lokaciju. Brza provjera - bez skrivenih troškova.' },
]

const faqItems = [
  { question: 'Koje dokumente trebam za najam?', answer: 'Potrebna vam je važeća vozačka dozvola (min. 2 godine), osobna iskaznica ili putovnica, te kartica za polog.' },
  { question: 'Mogu li preuzeti vozilo na aerodromu?', answer: 'U upitu možete odabrati Zadarsku zračnu luku. Vrijeme i uvjete preuzimanja dogovaramo pri potvrdi.' },
  { question: 'Što ako zakasnim s povratom?', answer: 'Javite nam se čim znate da ćete kasniti kako bismo dogovorili povrat i provjerili eventualnu dodatnu naknadu.' },
  { question: 'Je li gorivo uključeno u cijenu?', answer: 'Vozilo preuzimate puno i vraćate puno. Ako vratite s manje goriva, naplatit ćemo razliku.' },
  { question: 'Koliki je polog?', answer: 'Iznos i uvjete pologa potvrđujemo u ponudi za odabrano vozilo prije rezervacije.' },
  { question: 'Mogu li voziti izvan Hrvatske?', answer: 'Da, uz prethodnu najavu. Vožnja u EU zemlje je dozvoljena uz dodatnu dokumentaciju.' },
]

const longTermBenefits = ['Ponuda prema trajanju najma', 'Odabir vozila prema poslovnim potrebama', 'Dogovor o preuzimanju i povratu']

export default function Home() {

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('Svi')
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [vehicleError, setVehicleError] = useState('')
  const [dateError, setDateError] = useState('')
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' })
  const [contactLoading, setContactLoading] = useState(false)
  const [contactSuccess, setContactSuccess] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  // Theme state (auto by time of day, with manual override)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [themeOverride, setThemeOverride] = useState<boolean>(false)

  // Booking state
  const [bookingModal, setBookingModal] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [bookingDates, setBookingDates] = useState({ from: bookingOpensOn, to: '2027-04-08', location: 'Zadar - Zračna luka' })
  const today = new Date().toLocaleDateString('sv-SE')
  const earliestPickup = today > bookingOpensOn ? today : bookingOpensOn
  const validateDates = () => {
    let valid = false
    try { valid = rentalDays(bookingDates.from, bookingDates.to) > 0 && bookingDates.from >= earliestPickup } catch { valid = false }
    setDateError(valid ? '' : 'Odaberite datum preuzimanja i kasniji datum povrata. Najmovi počinju 1. travnja 2027. Odaberite 1–365 dana, bez datuma u prošlosti.')
    return valid
  }
  const [selectedExtras, setSelectedExtras] = useState<string[]>([])
  const [bookingStep, setBookingStep] = useState(1)
  const [customerInfo, setCustomerInfo] = useState({ name: '', email: '', phone: '' })
  const [extraNotes, setExtraNotes] = useState('')
  const [depositConfirmed, setDepositConfirmed] = useState(false)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [bookingError, setBookingError] = useState('')
  const [confirmedTotal, setConfirmedTotal] = useState<number | null>(null)
  const [requestId, setRequestId] = useState('')
  const dialogRef = useRef<HTMLDivElement>(null)

  // Promo code state
  const [promoCode, setPromoCode] = useState('')


  const categories = ['Svi', 'Economy', 'Business', 'Premium', 'SUV', 'Electric', 'Luxury']

  const vehicleRequest = useRef(0)
  const fetchVehicles = async (from = '', to = '') => {
    const requestNumber = ++vehicleRequest.current
    setLoading(true)
    setVehicleError('')
    try {
      const response = await fetch(`/api/vehicles${from && to ? `?from=${from}&to=${to}` : ''}`)
      const data = await response.json()
      if (requestNumber !== vehicleRequest.current) return
      if (!response.ok) throw new Error(data.error)
      setVehicles(data)
    } catch {
      if (requestNumber !== vehicleRequest.current) return
      setVehicles([])
      setVehicleError('Ponudu vozila trenutačno nije moguće učitati. Pokušajte ponovno ili nas kontaktirajte.')
    } finally { if (requestNumber === vehicleRequest.current) setLoading(false) }
  }
  useEffect(() => { fetchVehicles() }, [])

  useEffect(() => {
    if (!bookingModal) return
    const previous = document.activeElement as HTMLElement | null
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialogRef.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !bookingLoading) setBookingModal(false)
      if (event.key === 'Tab') {
        const nodes = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select, textarea, a[href]') || []).filter(el => el.getClientRects().length)
        if (!nodes.length) { event.preventDefault(); return }
        const first = nodes[0], last = nodes[nodes.length - 1]
        if (event.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) { event.preventDefault(); last.focus() }
        else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialogRef.current)) { event.preventDefault(); first.focus() }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = overflow; document.removeEventListener('keydown', onKey); previous?.focus() }
  }, [bookingModal, bookingLoading])

  // Automatic theme based on time of day
  useEffect(() => {
    // Check localStorage for user preference
    const savedTheme = localStorage.getItem('theme-override')
    if (savedTheme) {
      setTheme(savedTheme as 'dark' | 'light')
      setThemeOverride(true)
    } else {
      // Auto-detect based on time (06:00-18:00 = light, else dark)
      const hour = new Date().getHours()
      const isDay = hour >= 6 && hour < 18
      setTheme(isDay ? 'light' : 'dark')
    }
  }, [])

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // Toggle theme function
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    setThemeOverride(true)
    localStorage.setItem('theme-override', newTheme)
  }

  // Scroll animation observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in')
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )

    const animatedElements = document.querySelectorAll('.scroll-animate, .scroll-animate-left, .scroll-animate-right, .scroll-animate-scale')
    animatedElements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [loading])

  const filteredVehicles = selectedCategory === 'Svi'
    ? vehicles
    : vehicles.filter((v: Vehicle) => v.category === selectedCategory)

  // Handle contact form submission
  const handleBookingSubmit = async () => {
    if (!selectedVehicle || !validateDates()) return
    setBookingLoading(true)

    setBookingError('')
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_id: requestId, vehicle_id: selectedVehicle.id,
          customer_name: customerInfo.name, customer_email: customerInfo.email, customer_phone: customerInfo.phone,
          pickup_location: bookingDates.location, pickup_date: bookingDates.from, return_date: bookingDates.to,
          selected_extras: selectedExtras, extra_notes: extraNotes, deposit_confirmed: depositConfirmed, promo_code: promoCode
        })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      setConfirmedTotal(data.booking.total_price)
      setBookingStep(3)
    } catch (error) {
      setBookingError(error instanceof Error ? error.message : 'Upit nije spremljen. Pokušajte ponovno.')
      console.error(error)
    } finally {
      setBookingLoading(false)
    }
  }

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setContactLoading(true)

    try {
      const response = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(contactForm) })
      if (!response.ok) throw new Error()
      setContactSuccess(true)
      setContactForm({ name: '', email: '', message: '' })
    } catch { alert('Poruka nije spremljena. Pokušajte ponovno ili nas nazovite.') }
    finally { setContactLoading(false) }
  }



  return (
    <div className="page">
      {/* Navigation */}
      <nav className="nav">
        <div className="container nav-container">
          <a href="/" className="logo" aria-label="Karoca Rent A Car - Povratak na naslovnicu">
            <Image src="/karoca-logo-new.png" alt="Karoca Rent A Car logo - Premium najam vozila u Zadru" className="logo-img" width={150} height={50} priority />
          </a>



          <div className={`nav-links ${mobileMenuOpen ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
            <a href="#vozila">Vozila</a>
            <a href="#usluge">Usluge</a>
            <a href="#faq">FAQ</a>
            <a href="/blog">Blog</a>
            <a href="#kontakt">Kontakt</a>

          </div>



          <div className="nav-actions">
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Prebaci na svjetlu temu' : 'Prebaci na tamnu temu'}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <a href="tel:+385991655885" className="nav-phone" aria-label="Nazovite nas na +385 99 165 5885">
              <Phone size={18} aria-hidden="true" />
              <span>+385 99 165 5885</span>
            </a>
            <button className="btn btn-primary btn-nav" aria-label="Rezervirajte vozilo" onClick={() => document.getElementById("pretraga")?.scrollIntoView({ behavior: "smooth" })}>
              Rezerviraj
            </button>
          </div>

          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Zatvori navigacijski izbornik' : 'Otvori navigacijski izbornik'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero" id="pretraga">
        <div className="bg-grid"></div>
        <div className="bg-glow hero-glow-1"></div>
        <div className="bg-glow hero-glow-2"></div>

        <div className="container hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <Sparkles size={16} />
              <span>KAROCA / SEZONA 2027.</span>
            </div>

            <h1 className="hero-title">
              Vaš put kroz Dalmaciju
              <br />
              <span className="gradient-text">počinje ovdje.</span>
            </h1>

            <p className="hero-description">
              Odaberite vozilo za gradske ulice, obalne ceste i dane bez žurbe.
              Pet Suzuki Vitara, godište 2026. Najmovi od 1. travnja 2027. u Zadru.
            </p>

            <div className="hero-car">
              <Image src="/vehicles/suzuki-vitara.png" alt="Suzuki Vitara" width={620} height={350} sizes="(max-width: 768px) 100vw, 620px" priority style={{ width: '100%', height: 'auto', objectFit: 'contain' }} />
            </div>
          </div>

          {/* Booking Form */}
          <div className="hero-booking glass">
            <h3 className="booking-title">Isplanirajte svoj najam</h3>

            <div className="booking-form">
              <div className="form-group">
                <label htmlFor="pickup-location">
                  <MapPin size={18} />
                  Preuzimanje
                </label>
                <select id="pickup-location" value={bookingDates.location} onChange={e => setBookingDates({ ...bookingDates, location: e.target.value })}>
                  <option>Zadar - Zračna luka</option>
                  <option>Zadar - Centar</option>
                  <option>Zadar - Autobusni kolodvor</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="pickup-date">
                    <Calendar size={18} />
                    Preuzimanje
                  </label>
                  <input id="pickup-date" type="date" min={earliestPickup} value={bookingDates.from} onChange={e => setBookingDates({ ...bookingDates, from: e.target.value })} />
                </div>
                <div className="form-group">
                  <label htmlFor="return-date">
                    <Calendar size={18} />
                    Povrat
                  </label>
                  <input id="return-date" type="date" min={bookingDates.from || earliestPickup} value={bookingDates.to} onChange={e => setBookingDates({ ...bookingDates, to: e.target.value })} />
                </div>
              </div>

              <button
                className="btn btn-primary btn-book"
                onClick={() => {
                  if (!validateDates()) return
                  fetchVehicles(bookingDates.from, bookingDates.to)
                  document.getElementById('vozila')?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                Pogledaj vozila
                <ChevronRight size={20} />
              </button>
              {dateError && <p className="date-error" role="alert">{dateError}</p>}
              <p className="booking-note">Dostupnost i konačnu ponudu potvrđujemo nakon vašeg upita.</p>
            </div>


          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="usluge" className="features">

        <div className="container">
          <div className="features-grid grid grid-4">
            {features.map((feature, index) => (
              <div key={index} className="feature-card card scroll-animate" style={{ transitionDelay: `${index * 100}ms` }}>
                <div className="feature-icon">
                  <feature.icon size={28} />
                </div>
                <h4>{feature.title}</h4>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vehicles Section */}
      <section id="vozila" className="vehicles">
        <div className="container">
          <h2 className="section-title scroll-animate">Naša flota vozila</h2>
          <p className="section-subtitle scroll-animate">
            Odaberite savršeno vozilo za vaše potrebe
          </p>

          {/* Vehicle Grid */}
          <div className="vehicles-grid grid grid-3">
            {loading ? (
              <>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="vehicle-card card" style={{ pointerEvents: 'none' }}>
                    <div className="skeleton skeleton-card" style={{ height: '180px', marginBottom: '1rem' }}></div>
                    <div className="vehicle-content">
                      <div className="skeleton skeleton-title"></div>
                      <div className="skeleton skeleton-text"></div>
                      <div className="skeleton skeleton-text short"></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                        <div className="skeleton" style={{ width: '80px', height: '2rem' }}></div>
                        <div className="skeleton" style={{ width: '100px', height: '2.5rem' }}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            ) : vehicles.length === 0 ? (
              <div className="empty-state">
                <h3>{fleetPlan.make} {fleetPlan.model} · {fleetPlan.modelYear}</h3>
                <p>{fleetPlan.quantity} vozila u floti · Najam od 1. travnja 2027. · Cijena na upit</p>
                <p role={vehicleError ? "alert" : "status"}>{vehicleError || "Ponuda vozila trenutačno nije dostupna. Kontaktirajte nas za informacije o najmu."}</p>
                <a href="#kontakt" className="btn btn-secondary">Kontaktirajte nas</a>

              </div>
            ) : (
              vehicles.map((vehicle) => (

                <div key={vehicle.id} className="vehicle-card card">
                  <div className="vehicle-image">
                    {(vehicle.image_url?.startsWith('http') || vehicle.image_url?.startsWith('/')) ? (
                      <Image src={vehicle.image_url} alt={vehicle.name} className="vehicle-img" width={400} height={250} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px" loading="lazy" style={{ width: '100%', height: 'auto', objectFit: 'contain' }} />
                    ) : (
                      <span className="vehicle-emoji">{vehicle.image_url}</span>
                    )}

                    <span className="vehicle-category">{vehicle.category}</span>
                  </div>


                  <div className="vehicle-content">
                    <div className="vehicle-header">
                      <h4>{vehicle.name.replace(/ #\d+$/, '')}</h4>

                      <div className="vehicle-rating">
                        <Star size={14} fill="currentColor" />
                        <span>{vehicle.rating}</span>
                      </div>
                    </div>

                    <div className="vehicle-specs">
                      <div className="spec-item">
                        <Users size={18} />
                        <span>{vehicle.seats} osoba</span>
                      </div>
                      <div className="spec-item">
                        <Settings size={18} />
                        <span>{vehicle.transmission}</span>
                      </div>
                      <div className="spec-item">
                        <Fuel size={18} />
                        <span>{vehicle.fuel_type}</span>
                      </div>
                      <div className="spec-item">
                        <Luggage size={18} />
                        <span>2 kofera</span>
                      </div>
                    </div>

                    <div className="vehicle-features">
                      {vehicle.features?.map((f: string, i: number) => (
                        <span key={i} className="feature-tag">
                          <Check size={12} /> {f}
                        </span>
                      ))}
                    </div>

                    <div className="vehicle-footer">
                      <div className="vehicle-price">
                        <span className="price-amount">€{vehicle.price_per_day}</span>
                        <span className="price-period">/ dan</span>
                      </div>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => {
                          if (!validateDates()) { document.getElementById('pretraga')?.scrollIntoView({ behavior: 'smooth' }); return }
                          setSelectedVehicle(vehicle)
                          setRequestId(crypto.randomUUID())
                          setBookingError('')
                          setPromoCode('')
                          setDepositConfirmed(false)
                          setBookingStep(1)
                          setSelectedExtras([])
                          setBookingModal(true)
                        }}
                        aria-label={`Rezerviraj ${vehicle.name}`}
                      >
                        Rezerviraj
                      </button>
                    </div>

                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="container">
          <h2 className="section-title">Kako funkcionira</h2>
          <p className="section-subtitle">Jednostavan proces u 4 koraka</p>
          <div className="steps-grid grid grid-4">
            {howItWorks.map((item, index) => (
              <div key={index} className="step-card">
                <div className="step-number">{item.step}</div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Long-term Rental Section */}
      <section className="long-term" id="dugorocni-najam">
        <div className="container">
          <div className="long-term-content glass">
            <div className="long-term-text">
              <Briefcase size={40} />
              <h2>Dugoročni najam za firme</h2>
              <p>Idealno rješenje za poslovne klijente. Fleksibilni uvjeti, konkurentne cijene i premium podrška.</p>
              <ul className="benefits-list">
                {longTermBenefits.map((benefit, index) => (
                  <li key={index}><Check size={18} /> {benefit}</li>
                ))}
              </ul>
              <a href="tel:+385991655885" className="btn btn-primary">
                <Phone size={18} /> Zatražite ponudu
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="faq-section">
        <div className="container">
          <h2 className="section-title">Često postavljana pitanja</h2>
          <p className="section-subtitle">Pronađite odgovore na najčešća pitanja o najmu vozila</p>
          <div className="faq-list">
            {faqItems.map((item, index) => (
              <div key={index} className={`faq-item ${openFaq === index ? 'open' : ''}`}>
                <button className="faq-question" aria-expanded={openFaq === index} onClick={() => setOpenFaq(openFaq === index ? null : index)}>
                  <span>{item.question}</span>
                  <ChevronDown size={20} className={`faq-icon ${openFaq === index ? 'rotated' : ''}`} />
                </button>
                <div className="faq-answer" aria-hidden={openFaq !== index}>
                  <p>{item.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <div className="cta-content glass">
            <div className="cta-text">
              <h2>Spremni za vožnju?</h2>
              <p>Rezervirajte svoje vozilo danas i uživajte u slobodi putovanja.</p>
            </div>
            <div className="cta-actions">
              <button className="btn btn-primary btn-lg" onClick={() => document.getElementById("pretraga")?.scrollIntoView({ behavior: "smooth" })}>
                Rezerviraj sada
              </button>
              <a href="tel:+385991655885" className="btn btn-secondary btn-lg">
                <Phone size={20} />
                Nazovite nas
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="kontakt" className="contact">
        <div className="container">
          <div className="contact-grid grid grid-2">
            <div className="contact-info">
              <h2>Kontaktirajte nas</h2>
              <p>Imate pitanja o vozilima ili terminu? Pošaljite nam poruku.</p>

              <div className="contact-items">
                <div className="contact-item">
                  <Phone size={24} />
                  <div>
                    <strong>Telefon</strong>
                    <span>+385 99 165 5885</span>
                  </div>
                </div>
                <div className="contact-item">
                  <Mail size={24} />
                  <div>
                    <strong>Email</strong>
                    <a href="mailto:info@karoca-rentacar.hr">info@karoca-rentacar.hr</a>
                  </div>
                </div>
                <div className="contact-item">
                  <MapPin size={24} />
                  <div>
                    <strong>Adresa</strong>
                    <span>Obala kneza Branimira 1, 23000 Zadar</span>
                  </div>
                </div>
              </div>
            </div>

            <form className="contact-form glass" onSubmit={handleContactSubmit}>
              {contactSuccess && (
                <div className="success-message">
                  <Check size={20} />
                  Poruka je uspješno poslana!
                </div>
              )}
              <div className="form-group">
                <label htmlFor="contact-name">Ime i prezime</label>
                <input
                  type="text"
                  id="contact-name" placeholder="Vaše ime"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="contact-email">Email</label>
                <input
                  type="email"
                  id="contact-email" placeholder="vas@email.com"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="contact-message">Poruka</label>
                <textarea
                  id="contact-message" placeholder="Vaša poruka..."
                  rows={4}
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  required
                ></textarea>
              </div>
              <button type="submit" className="btn btn-primary btn-block" disabled={contactLoading}>
                {contactLoading ? (
                  <>
                    <Loader2 className="spinner" size={18} />
                    Slanje...
                  </>
                ) : (
                  'Pošalji poruku'
                )}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* WhatsApp Floating Button */}
      <a
        href="https://wa.me/385991655885?text=Pozdrav!%20Zanima%20me%20najam%20vozila."
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-float"
        aria-label="Kontaktirajte nas na WhatsApp"
      >
        <MessageCircle size={24} />
        <span>Pišite nam</span>
      </a>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-top">
            <div className="footer-brand">
              <a href="/" className="logo">
                <Image src="/karoca-logo-new.png" alt="Karoca Rent A Car" className="logo-img" width={150} height={50} loading="lazy" />
              </a>


              <p>Vaš pouzdani partner za najam vozila u Hrvatskoj.</p>
            </div>

            <div className="footer-links">
              <div className="footer-col">
                <h5>Usluge</h5>
                <a href="#vozila">Kratkoročni najam</a>
                <a href="#dugorocni-najam">Dugoročni najam</a>
                <a href="#kontakt">Transfer</a>
                <a href="#kontakt">Korporativni najam</a>
              </div>
              <div className="footer-col">
                <h5>Kompanija</h5>
                <a href="#kontakt">O nama</a>

                <a href="/blog">Blog</a>
                <a href="#kontakt">Partneri</a>
              </div>
              <div className="footer-col">
                <h5>Podrška</h5>
                <a href="#faq">FAQ</a>
                <a href="#kontakt">Kontakt</a>
                <a href="#kontakt">Upit o uvjetima najma</a>
                <a href="#kontakt">Upit o osobnim podacima</a>
              </div>
              <div className="footer-col"><h5>Karoca</h5><a href="/admin">Prijava za djelatnike</a><a href="tel:+385991655885">+385 99 165 5885</a></div>
            </div>
          </div>

          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} Karoca Rent A Car. Sva prava pridržana.</p>
          </div>
        </div>
      </footer>

      {/* Booking Modal */}
      {bookingModal && selectedVehicle && (
        <div className="modal-overlay" onClick={() => { if (!bookingLoading) setBookingModal(false) }}>
          <div className="modal-content" ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="booking-title" tabIndex={-1} onClick={e => e.stopPropagation()}>
            <button className="modal-close" aria-label="Zatvori upit za najam" disabled={bookingLoading} onClick={() => { if (!bookingLoading) setBookingModal(false) }}><X size={24} /></button>

            <div className="modal-header">
              <h2 id="booking-title">Upit za najam: {selectedVehicle.name}</h2>
              {bookingError && <p role="alert" className="date-error">{bookingError}</p>}
              <div className="modal-steps">
                <span className={bookingStep >= 1 ? 'active' : ''}>1. Dodaci</span>
                <span className={bookingStep >= 2 ? 'active' : ''}>2. Podaci</span>
                <span className={bookingStep >= 3 ? 'active' : ''}>3. Potvrda</span>
              </div>
            </div>

            {bookingStep === 1 && (
              <div className="modal-body">
                <div className="booking-summary">
                  <div className="summary-vehicle">
                    {selectedVehicle.image_url?.startsWith('http') || selectedVehicle.image_url?.startsWith('/') ? (
                      <Image src={selectedVehicle.image_url} alt={selectedVehicle.name} className="vehicle-img-summary" width={80} height={50} style={{ borderRadius: '8px' }} />
                    ) : (
                      <span className="vehicle-emoji-large">{selectedVehicle.image_url}</span>
                    )}
                    <div>
                      <strong>{selectedVehicle.name}</strong>
                      <p>€{selectedVehicle.price_per_day}/dan</p>
                    </div>
                  </div>
                  <div className="summary-dates">
                    <p><Calendar size={16} /> {bookingDates.from || 'Odaberi datum'} → {bookingDates.to || 'Odaberi datum'}</p>
                    <p><MapPin size={16} /> {bookingDates.location}</p>
                  </div>
                </div>

                <div className="deposit-notice" style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(245, 175, 25, 0.1)', border: '1px solid rgba(245, 175, 25, 0.3)', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <ShieldCheck size={24} style={{ color: '#f5af19' }} />
                    <div>
                      <strong style={{ color: '#f5af19', display: 'block' }}>Informacija o depozitu</strong>
                      <p style={{ fontSize: '0.85rem', margin: 0 }}>Iznos pologa, način plaćanja i uvjete osiguranja navest ćemo u ponudi prije potvrde najma. Odabir dodatka sam po sebi ne znači odobreno pokriće.</p>
                    </div>
                  </div>
                </div>

                <BookingExtras selected={selectedExtras} onChange={setSelectedExtras} days={rentalDays(bookingDates.from, bookingDates.to)} />
                <BookingPriceBreakdown selected={selectedExtras} days={rentalDays(bookingDates.from, bookingDates.to)} dailyRate={Number(selectedVehicle.price_per_day)} />

                <div className="modal-footer">
                  <div className="price-total">
                    <span>Okvirno ukupno, prije promo popusta:</span>
                    <strong>{rentalTotal(Number(selectedVehicle.price_per_day), rentalDays(bookingDates.from, bookingDates.to), selectedExtras).toLocaleString("hr-HR", { style: "currency", currency: "EUR" })}</strong>
                  </div>
                  <button className="btn btn-primary" onClick={() => setBookingStep(2)}>
                    Nastavi <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {bookingStep === 2 && (
              <div className="modal-body">
                <BookingPriceBreakdown selected={selectedExtras} days={rentalDays(bookingDates.from, bookingDates.to)} dailyRate={Number(selectedVehicle.price_per_day)} />
                <h3>Vaši podaci</h3>
                <div className="customer-form">
                  <div className="form-group">
                    <label>Ime i prezime *</label>
                    <input
                      type="text" aria-label="Ime i prezime" maxLength={255}
                      placeholder="Ivan Horvat"
                      value={customerInfo.name}
                      onChange={e => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email" aria-label="Email adresa" maxLength={255}
                      placeholder="ivan@email.com"
                      value={customerInfo.email}
                      onChange={e => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Telefon *</label>
                    <input
                      type="tel" aria-label="Telefon" maxLength={50}
                      placeholder="+385 91 234 5678"
                      value={customerInfo.phone}
                      onChange={e => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="promo-code">Promo kod (opcionalno)</label>
                    <input id="promo-code" maxLength={20} value={promoCode} onChange={e => setPromoCode(e.target.value.toUpperCase())} />
                    <small>Kod provjeravamo pri slanju upita. Popust će biti prikazan u zaprimljenom upitu.</small>
                  </div>
                  {/* Extra Notes */}
                  <div className="form-group" style={{ marginTop: '1.5rem' }}>
                    <label>Napomena (npr. dob djeteta za sjedalicu, broj leta...)</label>
                    <textarea
                      placeholder="Unesite dodatne informacije ovdje..."
                      maxLength={2000}
                      value={extraNotes}
                      onChange={e => setExtraNotes(e.target.value)}
                      rows={3}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: 'white' }}
                    ></textarea>
                  </div>

                  {/* Deposit Confirmation */}
                  <div className="form-group" style={{ marginTop: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <input
                        type="checkbox"
                        checked={depositConfirmed}
                        onChange={e => setDepositConfirmed(e.target.checked)}
                        style={{ width: '20px', height: '20px' }}
                      />
                      <span style={{ fontSize: '0.9rem' }}>Razumijem da je ovo upit i da cijenu, polog i uvjete najma trebam prihvatiti prije potvrde rezervacije. *</span>
                    </label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setBookingStep(1)}>Nazad</button>
                  <button
                    className="btn btn-primary"
                    onClick={handleBookingSubmit}
                    disabled={!customerInfo.name || !customerInfo.email || !customerInfo.phone || !depositConfirmed || bookingLoading}
                  >
                    {bookingLoading ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Loader2 size={18} className="spin" /> Slanje...
                      </span>
                    ) : (
                      <>Pošalji upit <ChevronRight size={18} /></>
                    )}
                  </button>
                </div>
              </div>
            )}

            {bookingStep === 3 && (
              <div className="modal-body">
                <div className="confirmation-icon">✅</div>
                <h3>Upit je zaprimljen!</h3>
                <p>Najam još nije potvrđen. Javit ćemo vam se s potvrdom dostupnosti i uvjeta.</p>
                {confirmedTotal !== null && <p>Ukupno prema upitu: <strong>{confirmedTotal.toLocaleString("hr-HR", { style: "currency", currency: "EUR" })}</strong></p>}
                <p>Kontaktirat ćemo vas uskoro na:</p>
                <p><strong>{customerInfo.email}</strong></p>
                <p><strong>{customerInfo.phone}</strong></p>
                <div className="modal-footer">
                  <button className="btn btn-primary" onClick={() => {
                    setBookingModal(false)
                    setBookingStep(1)
                    setCustomerInfo({ name: '', email: '', phone: '' })
                    setExtraNotes('')
                    setDepositConfirmed(false)
                    setSelectedExtras([])
                  }}>
                    Zatvori
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`

        .page {
          min-height: 100vh;
        }

        /* Navigation */
        .nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: rgba(15, 15, 26, 0.9);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
        }

        .nav-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 120px;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .logo-img {
          height: 100px;
          padding: 10px 0;
          width: auto;

          object-fit: contain;
          transition: transform 0.3s ease;
        }

        .logo:hover .logo-img {
          transform: scale(1.05);
        }


        .nav-links {
          display: flex;
          gap: 2.5rem;
        }

        .nav-links a {
          font-weight: 500;
          color: var(--text-muted);
        }

        .nav-links a:hover {
          color: var(--accent);
        }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .nav-phone {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-muted);
        }

        .nav-phone:hover {
          color: var(--accent);
        }

        .btn-nav {
          padding: 0.75rem 1.5rem;
        }

        .mobile-menu-btn {
          display: none;
          background: none;
          border: none;
          color: white;
          cursor: pointer;
        }

        /* Hero */
        .hero {
          min-height: 100vh;
          display: flex;
          align-items: center;
          padding-top: 80px;
          position: relative;
          overflow: hidden;
        }

        .hero-glow-1 {
          top: -200px;
          right: -200px;
        }

        .hero-glow-2 {
          bottom: -300px;
          left: -200px;
          background: radial-gradient(circle, rgba(102, 126, 234, 0.3) 0%, transparent 70%);
        }

        .hero-container {
          display: grid;
          grid-template-columns: 1fr 450px;
          gap: 4rem;
          align-items: center;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(233, 69, 96, 0.1);
          border: 1px solid rgba(233, 69, 96, 0.3);
          border-radius: 100px;
          color: var(--accent);
          font-size: 0.875rem;
          font-weight: 500;
          margin-bottom: 1.5rem;
        }

        .hero-title {
          font-size: clamp(2.5rem, 6vw, 4rem);
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: 1.5rem;
        }

        .gradient-text {
          background: var(--gradient-accent);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-description {
          font-size: 1.25rem;
          color: var(--text-muted);
          max-width: 500px;
          margin-bottom: 2rem;
        }

        .hero-stats {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .stat {
          display: flex;
          flex-direction: column;
        }

        .stat-number {
          font-size: 2rem;
          font-weight: 800;
          background: var(--gradient-accent);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .stat-label {
          font-size: 0.875rem;
          color: var(--text-muted);
        }

        .stat-divider {
          width: 1px;
          height: 40px;
          background: var(--border);
        }

        /* Booking Form */
        .hero-booking {
          padding: 2rem;
        }

        .booking-title {
          font-size: 1.25rem;
          margin-bottom: 1.5rem;
        }

        .booking-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: var(--text-muted);
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          padding: 0.875rem 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border);
          border-radius: 10px;
          color: white;
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: var(--accent);
          background: rgba(255, 255, 255, 0.08);
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .btn-book {
          margin-top: 0.5rem;
        }

        /* Features */
        .features {
          padding: 4rem 0;
          margin-top: -2rem;
        }

        .feature-card {
          padding: 2rem;
          text-align: center;
        }

        .feature-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 60px;
          height: 60px;
          background: var(--gradient-accent);
          border-radius: 16px;
          margin-bottom: 1rem;
        }

        .feature-card h4 {
          margin-bottom: 0.5rem;
        }

        .feature-card p {
          color: var(--text-muted);
          font-size: 0.9rem;
        }

        /* Vehicles */
        .vehicles {
          background: var(--gradient-dark);
        }

        .category-filter {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 0.75rem;
          margin-bottom: 3rem;
        }

        .filter-btn {
          padding: 0.625rem 1.25rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border);
          border-radius: 100px;
          color: var(--text-muted);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .filter-btn:hover {
          border-color: var(--accent);
          color: white;
        }

        .filter-btn.active {
          background: var(--gradient-accent);
          border-color: transparent;
          color: white;
        }

        /* Loading & Empty States */
        .loading-state,
        .empty-state {
          grid-column: 1 / -1;
          text-align: center;
          padding: 4rem 2rem;
          color: var(--text-muted);
        }

        .loading-state .spinner {
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
          color: var(--accent);
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .success-message {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem;
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.3);
          border-radius: 10px;
          color: #22c55e;
          margin-bottom: 1rem;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn .spinner {
          animation: spin 1s linear infinite;
        }

        .vehicle-card {
          overflow: hidden;
        }

        .vehicle-image {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
          text-align: center;
          position: relative;
          height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .vehicle-emoji {
          font-size: 5rem;
          padding-top: 2rem;
        }
        .vehicle-img {
          width: 100%;
          height: 100%;
          object-fit: contain !important;
        }



        .vehicle-category {
          position: absolute;
          top: 1rem;
          right: 1rem;
          padding: 0.375rem 0.75rem;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(10px);
          border-radius: 100px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .vehicle-content {
          padding: 1.5rem;
        }

        .vehicle-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .vehicle-header h4 {
          font-size: 1.125rem;
        }

        .vehicle-rating {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          color: var(--gold);
          font-size: 0.875rem;
          font-weight: 600;
        }

        .vehicle-specs {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
          color: var(--text-muted);
          font-size: 0.875rem;
        }

        .vehicle-specs span {
          display: flex;
          align-items: center;
          gap: 0.375rem;
        }

        .vehicle-features {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }

        .feature-tag {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.25rem 0.625rem;
          background: rgba(233, 69, 96, 0.1);
          border-radius: 100px;
          font-size: 0.75rem;
          color: var(--accent);
        }

        .vehicle-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1rem;
          border-top: 1px solid var(--border);
        }

        .price-amount {
          font-size: 1.5rem;
          font-weight: 800;
          background: var(--gradient-accent);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .price-period {
          color: var(--text-muted);
          font-size: 0.875rem;
        }

        .btn-sm {
          padding: 0.625rem 1.25rem;
          font-size: 0.875rem;
        }

        /* Testimonials */
        .testimonials {
          background: var(--bg-dark);
        }

        .testimonial-card {
          padding: 2rem;
        }

        .testimonial-stars {
          display: flex;
          gap: 0.25rem;
          margin-bottom: 1rem;
        }

        .testimonial-content {
          font-size: 1rem;
          color: var(--text-muted);
          line-height: 1.7;
          margin-bottom: 1.5rem;
        }

        .testimonial-author {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .author-avatar {
          width: 48px;
          height: 48px;
          background: var(--gradient-accent);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1.25rem;
        }

        .author-info {
          display: flex;
          flex-direction: column;
        }

        .author-info span {
          font-size: 0.875rem;
          color: var(--text-muted);
        }

        /* CTA */
        .cta {
          padding: 4rem 0;
        }

        .cta-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 4rem;
          background: linear-gradient(135deg, rgba(233, 69, 96, 0.1) 0%, rgba(245, 175, 25, 0.1) 100%);
        }

        .cta-text h2 {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }

        .cta-text p {
          color: var(--text-muted);
        }

        .cta-actions {
          display: flex;
          gap: 1rem;
        }

        .btn-lg {
          padding: 1rem 2rem;
          font-size: 1.125rem;
        }

        /* Contact */
        .contact {
          background: var(--gradient-dark);
        }

        .contact-info h2 {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }

        .contact-info > p {
          color: var(--text-muted);
          margin-bottom: 2rem;
        }

        .contact-items {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .contact-item {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .contact-item svg {
          color: var(--accent);
        }

        .contact-item div {
          display: flex;
          flex-direction: column;
        }

        .contact-item span {
          color: var(--text-muted);
        }

        .contact-form {
          padding: 2.5rem;
        }

        .contact-form .form-group {
          margin-bottom: 1.25rem;
        }

        .btn-block {
          width: 100%;
        }

        /* Footer */
        .footer {
          background: var(--primary);
          padding: 4rem 0 0;
        }

        .footer-top {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 4rem;
          padding-bottom: 3rem;
          border-bottom: 1px solid var(--border);
        }

        .footer-brand p {
          color: var(--text-muted);
          margin-top: 1rem;
          max-width: 300px;
        }

        .footer-links {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }

        .footer-col h5 {
          margin-bottom: 1.25rem;
          font-size: 1rem;
        }

        .footer-col a {
          display: block;
          color: var(--text-muted);
          font-size: 0.9rem;
          padding: 0.375rem 0;
        }

        .footer-col a:hover {
          color: var(--accent);
        }

        .footer-bottom {
          padding: 1.5rem 0;
          text-align: center;
          color: var(--text-muted);
          font-size: 0.875rem;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .hero-container {
            grid-template-columns: 1fr;
            text-align: center;
          }

          .hero-description {
            margin: 0 auto 2rem;
          }

          .hero-stats {
            justify-content: center;
          }

          .hero-booking {
            max-width: 500px;
            margin: 0 auto;
          }

          .cta-content {
            flex-direction: column;
            text-align: center;
            gap: 2rem;
          }

          .footer-top {
            grid-template-columns: 1fr;
            text-align: center;
          }

          .footer-brand {
            display: flex;
            flex-direction: column;
            align-items: center;
          }

          .footer-links {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 768px) {
          .nav-links,
          .nav-actions {
            display: none;
          }

          .mobile-menu-btn {
            display: block;
          }

          .nav-links.active {
            display: flex;
            flex-direction: column;
            position: absolute;
            top: 80px;
            left: 0;
            right: 0;
            background: var(--primary);
            padding: 1.5rem;
            gap: 1rem;
            border-bottom: 1px solid var(--border);
          }

          .hero {
            padding-top: 120px;
          }

          .hero-title {
            font-size: 2rem;
          }

          .hero-stats {
            flex-wrap: wrap;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .cta-actions {
            flex-direction: column;
          }

          .contact-grid {
            gap: 3rem;
          }

          .footer-links {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
        }

        /* How It Works Section */
        .how-it-works {
          padding: 6rem 0;
          background: rgba(255, 255, 255, 0.02);
        }
        .grid-4 {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2rem;
        }
        .step-card {
          text-align: center;
          padding: 2rem;
        }
        .step-number {
          width: 60px;
          height: 60px;
          margin: 0 auto 1.5rem;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          font-weight: 700;
          color: white;
        }
        .step-card h3 {
          margin-bottom: 0.75rem;
          font-size: 1.125rem;
        }
        .step-card p {
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.9rem;
          line-height: 1.6;
        }

        /* Long-term Rental Section */
        .long-term {
          padding: 6rem 0;
        }
        .long-term-content {
          padding: 4rem;
          border-radius: 24px;
          background: linear-gradient(135deg, rgba(233, 69, 96, 0.1) 0%, rgba(245, 175, 25, 0.1) 100%);
        }
        .long-term-text {
          max-width: 700px;
        }
        .long-term-text svg {
          color: var(--primary);
          margin-bottom: 1.5rem;
        }
        .long-term-text h2 {
          font-size: 2rem;
          margin-bottom: 1rem;
        }
        .long-term-text > p {
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 2rem;
          font-size: 1.1rem;
        }
        .benefits-list {
          list-style: none;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .benefits-list li {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.95rem;
        }
        .benefits-list li svg {
          color: var(--secondary);
          margin-bottom: 0;
        }

        /* FAQ Section */
        .faq-section {
          padding: 6rem 0;
          background: rgba(255, 255, 255, 0.02);
        }
        .faq-list {
          max-width: 800px;
          margin: 0 auto;
        }
        .faq-item {
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          margin-bottom: 1rem;
          overflow: hidden;
          transition: all 0.3s;
        }
        .faq-item:hover {
          border-color: rgba(255, 255, 255, 0.2);
        }
        .faq-question {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.25rem 1.5rem;
          background: rgba(255, 255, 255, 0.03);
          border: none;
          color: white;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          text-align: left;
        }
        .faq-icon {
          transition: transform 0.3s;
          flex-shrink: 0;
        }
        .faq-icon.rotated {
          transform: rotate(180deg);
        }
        .faq-answer {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s;
        }
        .faq-item.open .faq-answer {
          max-height: 200px;
        }
        .faq-answer p {
          padding: 0 1.5rem 1.25rem;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.7;
        }

        /* Newsletter */
        .newsletter-col p {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 1rem;
        }
        .newsletter-form {
          display: flex;
          gap: 0.5rem;
        }
        .newsletter-form input {
          flex: 1;
          padding: 0.75rem 1rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.05);
          color: white;
          font-size: 0.9rem;
        }
        .newsletter-form input::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }
        .newsletter-form button {
          padding: 0.75rem 1rem;
          border: none;
          border-radius: 8px;
          background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
          color: white;
          cursor: pointer;
          transition: transform 0.2s;
        }
        .newsletter-form button:hover {
          transform: scale(1.05);
        }

        @media (max-width: 1024px) {
          .grid-4 {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 768px) {
          .grid-4 {
            grid-template-columns: 1fr;
          }
          .benefits-list {
            grid-template-columns: 1fr;
          }
          .long-term-content {
            padding: 2rem;
          }
        }

        /* Booking Modal */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          padding: 1rem;
        }
        .modal-content {
          background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%);
          border-radius: 20px;
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .modal-close {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: none;
          border: none;
          color: rgba(255,255,255,0.6);
          cursor: pointer;
          z-index: 10;
        }
        .modal-close:hover { color: white; }
        .modal-header {
          padding: 1.5rem;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .modal-header h2 {
          font-size: 1.25rem;
          margin-bottom: 1rem;
        }
        .modal-steps {
          display: flex;
          gap: 1rem;
        }
        .modal-steps span {
          font-size: 0.85rem;
          color: rgba(255,255,255,0.4);
          padding: 0.5rem 1rem;
          border-radius: 20px;
          background: rgba(255,255,255,0.05);
        }
        .modal-steps span.active {
          background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
          color: white;
        }
        .modal-body {
          padding: 1.5rem;
        }
        .modal-body h3 {
          font-size: 1rem;
          margin-bottom: 1rem;
          color: rgba(255,255,255,0.9);
        }
        .booking-summary {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: rgba(255,255,255,0.03);
          border-radius: 12px;
          margin-bottom: 1.5rem;
        }
        .summary-vehicle {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .vehicle-emoji-large {
          font-size: 2.5rem;
        }
        .summary-vehicle strong { font-size: 1.1rem; }
        .summary-vehicle p {
          color: var(--primary);
          font-weight: 600;
          margin: 0;
        }
        .summary-dates p {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          color: rgba(255,255,255,0.7);
          margin: 0.25rem 0;
        }
        .extras-grid {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }
        .extra-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .extra-card:hover {
          border-color: rgba(255,255,255,0.2);
        }
        .extra-card.selected {
          background: rgba(233, 69, 96, 0.1);
          border-color: var(--primary);
        }
        .extra-card input { display: none; }
        .extra-info { flex: 1; }
        .extra-info strong { display: block; margin-bottom: 0.25rem; }
        .extra-info small { color: rgba(255,255,255,0.5); font-size: 0.8rem; }
        .extra-price {
          font-weight: 600;
          color: var(--secondary);
        }
        .modal-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1rem;
          border-top: 1px solid rgba(255,255,255,0.1);
          margin-top: 1rem;
        }
        .price-total span {
          color: rgba(255,255,255,0.6);
          font-size: 0.9rem;
        }
        .price-total strong {
          font-size: 1.5rem;
          color: var(--secondary);
          margin-left: 0.5rem;
        }
        .customer-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .btn-secondary {
          background: rgba(255,255,255,0.1);
          color: white;
          border: 1px solid rgba(255,255,255,0.2);
        }
        .confirmation-icon {
          font-size: 4rem;
          text-align: center;
          margin-bottom: 1rem;
        }
        .modal-body .confirmation-icon + h3 {
          text-align: center;
          font-size: 1.5rem;
        }
        .modal-body .confirmation-icon ~ p {
          text-align: center;
          margin: 0.5rem 0;
        }
      `}</style>

      {/* Mobile Sticky CTA */}
      <div className="mobile-sticky-cta">
        <div className="cta-text">
          <span>Vaš najam u Zadru</span>
        </div>
        <a href="#pretraga" className="btn btn-primary">Odaberi datume</a>
      </div>

    </div>
  )
}
