'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
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
  Menu,
  X,
  Check,
  Sparkles,
  Loader2
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
    title: 'Potpuno osigurano',
    description: 'Sva vozila su u potpunosti osigurana za vašu sigurnost i mir.',
  },
  {
    icon: Clock,
    title: '24/7 Podrška',
    description: 'Naš tim je dostupan non-stop za sve vaše potrebe i pitanja.',
  },
  {
    icon: MapPin,
    title: 'Besplatna dostava',
    description: 'Besplatna dostava vozila na aerodrom ili željenu lokaciju.',
  },
  {
    icon: Star,
    title: 'Premium vozila',
    description: 'Samo vozila vrhunske kvalitete u našoj floti.',
  },
]

const testimonials = [
  {
    name: 'Marko Horvat',
    role: 'Poslovni korisnik',
    content: 'Izuzetna usluga! Vozilo je bilo besprijekorno čisto i dostavljeno na vrijeme. Definitivno preporučujem.',
    rating: 5,
  },
  {
    name: 'Ana Kovačević',
    role: 'Turistkinja',
    content: 'Karoca nam je omogućila savršen odmor. Profesionalna usluga od rezervacije do vraćanja vozila.',
    rating: 5,
  },
  {
    name: 'Ivan Jurić',
    role: 'Česti najmoprimac',
    content: 'Koristim Karoca već 2 godine za sve svoje poslovne potrebe. Najbolji u poslu!',
    rating: 5,
  },
]

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('Svi')
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' })
  const [contactLoading, setContactLoading] = useState(false)
  const [contactSuccess, setContactSuccess] = useState(false)

  const categories = ['Svi', 'Economy', 'Business', 'Premium', 'SUV', 'Electric', 'Luxury']

  // Fetch vehicles from Supabase
  useEffect(() => {
    async function fetchVehicles() {
      setLoading(true)
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('available', true)
        .order('price_per_day', { ascending: true })

      if (error) {
        console.error('Error fetching vehicles:', error)
      } else {
        setVehicles(data || [])
      }
      setLoading(false)
    }

    fetchVehicles()
  }, [])

  const filteredVehicles = selectedCategory === 'Svi'
    ? vehicles
    : vehicles.filter((v: Vehicle) => v.category === selectedCategory)

  // Handle contact form submission
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setContactLoading(true)

    const { error } = await supabase
      .from('contact_messages')
      .insert([contactForm])

    if (error) {
      console.error('Error sending message:', error)
      alert('Greška pri slanju poruke. Molimo pokušajte ponovo.')
    } else {
      setContactSuccess(true)
      setContactForm({ name: '', email: '', message: '' })
      setTimeout(() => setContactSuccess(false), 5000)
    }
    setContactLoading(false)
  }


  return (
    <div className="page">
      {/* Navigation */}
      <nav className="nav">
        <div className="container nav-container">
          <a href="/" className="logo">
            <span className="logo-icon">🚗</span>
            <span className="logo-text">
              <span className="logo-karoca">Karoca</span>
              <span className="logo-subtitle">Rent A Car</span>
            </span>
          </a>

          <div className={`nav-links ${mobileMenuOpen ? 'active' : ''}`}>
            <a href="#vozila">Vozila</a>
            <a href="#usluge">Usluge</a>
            <a href="#o-nama">O nama</a>
            <a href="#kontakt">Kontakt</a>
            <a href="/admin">Admin</a>
          </div>

          <div className="nav-actions">
            <a href="tel:+385991655885" className="nav-phone">
              <Phone size={18} />
              <span>+385 99 165 5885</span>
            </a>
            <button className="btn btn-primary btn-nav">
              Rezerviraj
            </button>
          </div>

          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="bg-grid"></div>
        <div className="bg-glow hero-glow-1"></div>
        <div className="bg-glow hero-glow-2"></div>

        <div className="container hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <Sparkles size={16} />
              <span>Premium Rent A Car usluga</span>
            </div>

            <h1 className="hero-title">
              Vozite stanje.
              <br />
              <span className="gradient-text">Platite manje.</span>
            </h1>

            <p className="hero-description">
              Otkrijte našu kolekciju premium vozila po pristupačnim cijenama.
              Jednostavna rezervacija, transparentne cijene, bez skrivenih troškova.
            </p>

            <div className="hero-stats">
              <div className="stat">
                <span className="stat-number">500+</span>
                <span className="stat-label">Vozila</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat">
                <span className="stat-number">15k+</span>
                <span className="stat-label">Klijenata</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat">
                <span className="stat-number">4.9</span>
                <span className="stat-label">Ocjena</span>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="hero-booking glass">
            <h3 className="booking-title">Brza rezervacija</h3>

            <div className="booking-form">
              <div className="form-group">
                <label>
                  <MapPin size={18} />
                  Preuzimanje
                </label>
                <select>
                  <option>Zadar - Zračna luka</option>
                  <option>Zadar - Centar</option>
                  <option>Zadar - Autobusni kolodvor</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    <Calendar size={18} />
                    Od
                  </label>
                  <input type="date" />
                </div>
                <div className="form-group">
                  <label>
                    <Calendar size={18} />
                    Do
                  </label>
                  <input type="date" />
                </div>
              </div>

              <button className="btn btn-primary btn-book">
                Pretraži vozila
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <div className="features-grid grid grid-4">
            {features.map((feature, index) => (
              <div key={index} className="feature-card card">
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
          <h2 className="section-title">Naša flota vozila</h2>
          <p className="section-subtitle">
            Odaberite savršeno vozilo za vaše potrebe iz naše raznolike kolekcije
          </p>

          {/* Category Filter */}
          <div className="category-filter">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`filter-btn ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Vehicle Grid */}
          <div className="vehicles-grid grid grid-3">
            {loading ? (
              <div className="loading-state">
                <Loader2 className="spinner" size={40} />
                <p>Učitavanje vozila...</p>
              </div>
            ) : filteredVehicles.length === 0 ? (
              <div className="empty-state">
                <p>Nema dostupnih vozila u ovoj kategoriji.</p>
              </div>
            ) : (
              filteredVehicles.map((vehicle) => (
                <div key={vehicle.id} className="vehicle-card card">
                  <div className="vehicle-image">
                    <span className="vehicle-emoji">{vehicle.image_url}</span>
                    <span className="vehicle-category">{vehicle.category}</span>
                  </div>

                  <div className="vehicle-content">
                    <div className="vehicle-header">
                      <h4>{vehicle.name}</h4>
                      <div className="vehicle-rating">
                        <Star size={14} fill="currentColor" />
                        <span>{vehicle.rating}</span>
                      </div>
                    </div>

                    <div className="vehicle-specs">
                      <span><Users size={16} /> {vehicle.seats}</span>
                      <span><Settings size={16} /> {vehicle.transmission}</span>
                      <span><Fuel size={16} /> {vehicle.fuel_type}</span>
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
                      <button className="btn btn-primary btn-sm">
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

      {/* Testimonials Section */}
      <section id="o-nama" className="testimonials">
        <div className="container">
          <h2 className="section-title">Što kažu naši klijenti</h2>
          <p className="section-subtitle">
            Tisuće zadovoljnih klijenata nam vjeruje za svoje putne potrebe
          </p>

          <div className="testimonials-grid grid grid-3">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card card">
                <div className="testimonial-stars">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={18} fill="var(--gold)" color="var(--gold)" />
                  ))}
                </div>
                <p className="testimonial-content">"{testimonial.content}"</p>
                <div className="testimonial-author">
                  <div className="author-avatar">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div className="author-info">
                    <strong>{testimonial.name}</strong>
                    <span>{testimonial.role}</span>
                  </div>
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
              <button className="btn btn-primary btn-lg">
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
              <p>Imate pitanja? Tu smo za vas 24/7.</p>

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
                    <span>info@karoca.hr</span>
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
                <label>Ime i prezime</label>
                <input
                  type="text"
                  placeholder="Vaše ime"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="vas@email.com"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Poruka</label>
                <textarea
                  placeholder="Vaša poruka..."
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

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-top">
            <div className="footer-brand">
              <a href="/" className="logo">
                <span className="logo-icon">🚗</span>
                <span className="logo-text">
                  <span className="logo-karoca">Karoca</span>
                  <span className="logo-subtitle">Rent A Car</span>
                </span>
              </a>
              <p>Vaš pouzdani partner za najam vozila u Hrvatskoj.</p>
            </div>

            <div className="footer-links">
              <div className="footer-col">
                <h5>Usluge</h5>
                <a href="#">Kratkoročni najam</a>
                <a href="#">Dugoročni najam</a>
                <a href="#">Transfer</a>
                <a href="#">Korporativni najam</a>
              </div>
              <div className="footer-col">
                <h5>Kompanija</h5>
                <a href="#">O nama</a>
                <a href="#">Karijere</a>
                <a href="#">Blog</a>
                <a href="#">Partneri</a>
              </div>
              <div className="footer-col">
                <h5>Podrška</h5>
                <a href="#">FAQ</a>
                <a href="#">Kontakt</a>
                <a href="#">Uvjeti korištenja</a>
                <a href="#">Privatnost</a>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p>&copy; 2024 Karoca Rent A Car. Sva prava pridržana.</p>
          </div>
        </div>
      </footer>

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
          height: 80px;
        }
        
        .logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .logo-icon {
          font-size: 2rem;
        }
        
        .logo-text {
          display: flex;
          flex-direction: column;
        }
        
        .logo-karoca {
          font-size: 1.5rem;
          font-weight: 800;
          background: var(--gradient-accent);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1.1;
        }
        
        .logo-subtitle {
          font-size: 0.75rem;
          color: var(--text-muted);
          letter-spacing: 0.1em;
          text-transform: uppercase;
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
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%);
          padding: 2rem;
          text-align: center;
          position: relative;
        }
        
        .vehicle-emoji {
          font-size: 5rem;
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
      `}</style>
    </div>
  )
}
