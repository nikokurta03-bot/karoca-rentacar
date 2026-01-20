import { supabase } from '@/lib/supabase'
import {
  MapPin,
  Calendar,
  ChevronRight,
  Shield,
  Clock,
  Phone,
  Mail,
  Sparkles,
  Star
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import VehicleFleet from '@/components/VehicleFleet'
import ContactForm from '@/components/ContactForm'

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

export default async function Home() {
  // Fetch vehicles directly on the server
  const { data: vehicles } = await supabase
    .from('vehicles')
    .select('*')
    .eq('available', true)
    .order('price_per_day', { ascending: true })

  return (
    <div className="page">
      <Navbar />

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

      {/* Vehicles Section (Client Island) */}
      <VehicleFleet initialVehicles={vehicles || []} />

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
                    <span>info@karoca-rentacar.hr</span>
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

            <ContactForm />
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
    </div>
  )
}
