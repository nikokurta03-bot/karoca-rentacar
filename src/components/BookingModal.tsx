'use client'

import { X, Calendar, MapPin, ShieldCheck, ChevronRight, Loader2 } from 'lucide-react'
import Image from 'next/image'

interface Vehicle {
    id: string
    name: string
    image_url: string
    price_per_day: number
}

interface InsuranceOption {
    id: string
    name: string
    price: number
    description: string
}

interface BookingModalProps {
    selectedVehicle: Vehicle
    bookingStep: number
    setBookingStep: (step: number) => void
    selectedExtras: string[]
    setSelectedExtras: (extras: string[]) => void
    bookingDates: { from: string; to: string; location: string }
    customerInfo: { name: string; email: string; phone: string }
    setCustomerInfo: (info: { name: string; email: string; phone: string }) => void
    extraNotes: string
    setExtraNotes: (notes: string) => void
    depositConfirmed: boolean
    setDepositConfirmed: (confirmed: boolean) => void
    bookingLoading: boolean
    onClose: () => void
    onSubmit: () => void
    insuranceOptions: InsuranceOption[]
    promoCode: string
    setPromoCode: (code: string) => void
    promoDiscount: number
    promoValidating: boolean
    promoError: string
    onValidatePromo: () => void
}

export default function BookingModal({
    selectedVehicle,
    bookingStep,
    setBookingStep,
    selectedExtras,
    setSelectedExtras,
    bookingDates,
    customerInfo,
    setCustomerInfo,
    extraNotes,
    setExtraNotes,
    depositConfirmed,
    setDepositConfirmed,
    bookingLoading,
    onClose,
    onSubmit,
    insuranceOptions,
    promoCode,
    setPromoCode,
    promoDiscount,
    promoValidating,
    promoError,
    onValidatePromo,
}: BookingModalProps) {
    const extrasPrice = selectedExtras.reduce((sum, id) => {
        const option = insuranceOptions.find(o => o.id === id)
        return sum + (option?.price || 0)
    }, 0)

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}><X size={24} /></button>

                <div className="modal-header">
                    <h2>Rezervacija: {selectedVehicle.name}</h2>
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
                                    <p style={{ fontSize: '0.85rem', margin: 0 }}>Standardni sigurnosni polog za ovo vozilo iznosi <strong>700,00 €</strong>. Polog se autorizira na kartici ili ostavlja u gotovini prilikom preuzimanja.</p>
                                </div>
                            </div>
                        </div>

                        <h3 style={{ marginTop: '2rem' }}>Odaberite dodatke i osiguranje</h3>
                        <div className="extras-grid">
                            {insuranceOptions.map(option => (
                                <label key={option.id} className={`extra-card ${selectedExtras.includes(option.id) ? 'selected' : ''}`}>
                                    <input
                                        type="checkbox"
                                        checked={selectedExtras.includes(option.id)}
                                        onChange={e => {
                                            if (e.target.checked) {
                                                setSelectedExtras([...selectedExtras, option.id])
                                            } else {
                                                setSelectedExtras(selectedExtras.filter(id => id !== option.id))
                                            }
                                        }}
                                    />
                                    <div className="extra-info">
                                        <strong>{option.name}</strong>
                                        <small>{option.description}</small>
                                    </div>
                                    <span className="extra-price">+€{option.price}/dan</span>
                                </label>
                            ))}
                        </div>

                        <div className="modal-footer">
                            <div className="price-total">
                                <span>Ukupno po danu:</span>
                                <strong>€{selectedVehicle.price_per_day + extrasPrice}</strong>
                            </div>
                            <button className="btn btn-primary" onClick={() => setBookingStep(2)}>
                                Nastavi <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}

                {bookingStep === 2 && (
                    <div className="modal-body">
                        <h3>Vaši podaci</h3>
                        <div className="customer-form">
                            <div className="form-group">
                                <label>Ime i prezime *</label>
                                <input
                                    type="text"
                                    placeholder="Ivan Horvat"
                                    value={customerInfo.name}
                                    onChange={e => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Email *</label>
                                <input
                                    type="email"
                                    placeholder="ivan@email.com"
                                    value={customerInfo.email}
                                    onChange={e => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Telefon *</label>
                                <input
                                    type="tel"
                                    placeholder="+385 91 234 5678"
                                    value={customerInfo.phone}
                                    onChange={e => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Napomena (slobodno navedite zahtjeve za dječje sjedalice, tip osiguranja, granice putovanja...)</label>
                                <textarea
                                    placeholder="Npr. Trebam dječju sjedalicu za dijete od 12kg, planiram put u Sloveniju..."
                                    value={extraNotes}
                                    onChange={e => setExtraNotes(e.target.value)}
                                    rows={3}
                                />
                            </div>
                            <div className="form-group">
                                <label>Promo kod (opciono)</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input
                                        type="text"
                                        placeholder="PROMO2024"
                                        value={promoCode}
                                        onChange={e => setPromoCode(e.target.value.toUpperCase())}
                                        style={{ flex: 1 }}
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={onValidatePromo}
                                        disabled={promoValidating || !promoCode}
                                        style={{ minWidth: '100px' }}
                                    >
                                        {promoValidating ? <Loader2 className="spinner" size={16} /> : 'Primijeni'}
                                    </button>
                                </div>
                                {promoError && <small style={{ color: '#ef4444' }}>{promoError}</small>}
                                {promoDiscount > 0 && <small style={{ color: '#22c55e' }}>✓ Popust od {promoDiscount}% primjenjen!</small>}
                            </div>
                            <label className="deposit-checkbox">
                                <input
                                    type="checkbox"
                                    checked={depositConfirmed}
                                    onChange={e => setDepositConfirmed(e.target.checked)}
                                />
                                <span>Upoznat/a sam s uvjetima o sigurnosnom pologu od 700,00 € *</span>
                            </label>
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setBookingStep(1)}>
                                Natrag
                            </button>
                            <button
                                className="btn btn-primary"
                                disabled={!customerInfo.name || !customerInfo.email || !customerInfo.phone || !depositConfirmed || bookingLoading}
                                onClick={onSubmit}
                            >
                                {bookingLoading ? <><Loader2 className="spinner" size={18} /> Slanje...</> : 'Pošalji rezervaciju'}
                            </button>
                        </div>
                    </div>
                )}

                {bookingStep === 3 && (
                    <div className="modal-body">
                        <div className="confirmation-icon">✅</div>
                        <h3>Rezervacija zaprimljena!</h3>
                        <p>Kontaktirat ćemo vas uskoro na:</p>
                        <p><strong>{customerInfo.email}</strong></p>
                        <p><strong>{customerInfo.phone}</strong></p>
                        <div className="modal-footer">
                            <button className="btn btn-primary" onClick={onClose}>
                                Zatvori
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
