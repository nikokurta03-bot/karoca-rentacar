'use client'

import { useState } from 'react'
import { Phone, Menu, X } from 'lucide-react'

export default function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    return (
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
                    <a href="#vozila" onClick={() => setMobileMenuOpen(false)}>Vozila</a>
                    <a href="#usluge" onClick={() => setMobileMenuOpen(false)}>Usluge</a>
                    <a href="#o-nama" onClick={() => setMobileMenuOpen(false)}>O nama</a>
                    <a href="#kontakt" onClick={() => setMobileMenuOpen(false)}>Kontakt</a>
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
                    aria-label="Izbornik"
                >
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>
        </nav>
    )
}
