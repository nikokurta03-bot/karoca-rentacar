'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import {
    Car,
    MessageSquare,
    CalendarCheck,
    LogOut,
    Eye,
    Trash2,
    Check,
    X,
    Loader2,
    FileText
} from 'lucide-react'
import { jsPDF } from 'jspdf'

const ADMIN_PASSWORD = 'karoca2024'

interface Booking {
    id: string
    vehicle_id: string
    customer_name: string
    customer_email: string
    customer_phone: string
    pickup_location: string
    pickup_date: string
    return_date: string
    total_price: number
    status: string
    created_at: string
    vehicle?: { name: string }
}

interface ContactMessage {
    id: string
    name: string
    email: string
    message: string
    read: boolean
    created_at: string
}

interface Vehicle {
    id: string
    name: string
    category: string
    price_per_day: number
    available: boolean
}

export default function AdminPage() {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [activeTab, setActiveTab] = useState<'bookings' | 'messages' | 'vehicles' | 'contract'>('bookings')
    const [bookings, setBookings] = useState<Booking[]>([])
    const [messages, setMessages] = useState<ContactMessage[]>([])
    const [vehicles, setVehicles] = useState<Vehicle[]>([])
    const [loading, setLoading] = useState(false)
    const [generating, setGenerating] = useState(false)

    // Contract form state
    const [contractForm, setContractForm] = useState({
        driverName: '',
        driverAddress: '',
        driverCity: '',
        driverCountry: 'Hrvatska',
        driverPhone: '',
        driverEmail: '',
        driverOIB: '',
        driverLicenseNumber: '',
        driverLicenseExpiry: '',
        driverPassportNumber: '',
        vehicleId: '',
        pickupDate: '',
        pickupTime: '09:00',
        returnDate: '',
        returnTime: '09:00',
        pickupLocation: 'Zadar - Zračna luka',
        pricePerDay: 65,
        totalDays: 1,
        totalPrice: 65,
        deposit: 200,
        paymentMethod: 'Gotovina',
        notes: ''
    })

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault()
        if (password === ADMIN_PASSWORD) {
            setIsLoggedIn(true)
            setError('')
            localStorage.setItem('adminLoggedIn', 'true')
        } else {
            setError('Pogrešna šifra!')
        }
    }

    const handleLogout = () => {
        setIsLoggedIn(false)
        localStorage.removeItem('adminLoggedIn')
    }

    useEffect(() => {
        if (localStorage.getItem('adminLoggedIn') === 'true') {
            setIsLoggedIn(true)
        }
    }, [])

    useEffect(() => {
        if (isLoggedIn) {
            fetchData()
        }
    }, [isLoggedIn, activeTab])

    // Calculate total price when dates change
    useEffect(() => {
        if (contractForm.pickupDate && contractForm.returnDate) {
            const pickup = new Date(contractForm.pickupDate)
            const returnD = new Date(contractForm.returnDate)
            const days = Math.ceil((returnD.getTime() - pickup.getTime()) / (1000 * 60 * 60 * 24))
            if (days > 0) {
                setContractForm(f => ({
                    ...f,
                    totalDays: days,
                    totalPrice: days * f.pricePerDay
                }))
            }
        }
    }, [contractForm.pickupDate, contractForm.returnDate, contractForm.pricePerDay])

    const fetchData = async () => {
        setLoading(true)
        if (activeTab === 'bookings') {
            const { data } = await supabase.from('bookings').select('*, vehicle:vehicles(name)').order('created_at', { ascending: false })
            setBookings(data || [])
        } else if (activeTab === 'messages') {
            const { data } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false })
            setMessages(data || [])
        } else if (activeTab === 'vehicles' || activeTab === 'contract') {
            const { data } = await supabase.from('vehicles').select('*').order('name')
            setVehicles(data || [])
        }
        setLoading(false)
    }

    const updateBookingStatus = async (id: string, status: string) => {
        await supabase.from('bookings').update({ status }).eq('id', id)
        fetchData()
    }

    const toggleVehicleAvailability = async (id: string, available: boolean) => {
        await supabase.from('vehicles').update({ available: !available }).eq('id', id)
        fetchData()
    }

    const markMessageAsRead = async (id: string) => {
        await supabase.from('contact_messages').update({ read: true }).eq('id', id)
        fetchData()
    }

    const deleteMessage = async (id: string) => {
        await supabase.from('contact_messages').delete().eq('id', id)
        fetchData()
    }

    const handleVehicleChange = (vehicleId: string) => {
        const vehicle = vehicles.find(v => v.id === vehicleId)
        if (vehicle) {
            setContractForm(f => ({
                ...f,
                vehicleId,
                pricePerDay: vehicle.price_per_day,
                totalPrice: f.totalDays * vehicle.price_per_day
            }))
        }
    }

    const generatePDF = () => {
        setGenerating(true)
        const doc = new jsPDF()
        const vehicle = vehicles.find(v => v.id === contractForm.vehicleId)
        const today = new Date().toLocaleDateString('hr')

        doc.setFontSize(20)
        doc.text('KAROCA RENT A CAR', 105, 20, { align: 'center' })
        doc.setFontSize(12)
        doc.text('Obala kneza Branimira 1, 23000 Zadar', 105, 28, { align: 'center' })
        doc.text('Tel: +385 99 165 5885 | Email: info@karoca.hr', 105, 35, { align: 'center' })

        doc.setFontSize(16)
        doc.text('UGOVOR O NAJMU VOZILA', 105, 50, { align: 'center' })

        doc.setFontSize(10)
        doc.text(`Datum: ${today}`, 20, 60)
        doc.text(`Broj ugovora: KRC-${Date.now().toString().slice(-6)}`, 140, 60)

        doc.setFontSize(12)
        doc.text('PODACI O NAJMOPRIMCU:', 20, 75)
        doc.setFontSize(10)
        doc.text(`Ime i prezime: ${contractForm.driverName}`, 20, 85)
        doc.text(`Adresa: ${contractForm.driverAddress}, ${contractForm.driverCity}, ${contractForm.driverCountry}`, 20, 92)
        doc.text(`OIB: ${contractForm.driverOIB}`, 20, 99)
        doc.text(`Telefon: ${contractForm.driverPhone}`, 20, 106)
        doc.text(`Email: ${contractForm.driverEmail}`, 20, 113)
        doc.text(`Vozacka dozvola: ${contractForm.driverLicenseNumber} (vrijedi do: ${contractForm.driverLicenseExpiry})`, 20, 120)
        doc.text(`Putovnica/Osobna: ${contractForm.driverPassportNumber}`, 20, 127)

        doc.setFontSize(12)
        doc.text('PODACI O VOZILU:', 20, 142)
        doc.setFontSize(10)
        doc.text(`Vozilo: ${vehicle?.name || '-'}`, 20, 152)
        doc.text(`Lokacija preuzimanja: ${contractForm.pickupLocation}`, 20, 159)
        doc.text(`Preuzimanje: ${contractForm.pickupDate} u ${contractForm.pickupTime}`, 20, 166)
        doc.text(`Povrat: ${contractForm.returnDate} u ${contractForm.returnTime}`, 20, 173)

        doc.setFontSize(12)
        doc.text('CIJENA NAJMA:', 20, 188)
        doc.setFontSize(10)
        doc.text(`Cijena po danu: ${contractForm.pricePerDay} EUR`, 20, 198)
        doc.text(`Broj dana: ${contractForm.totalDays}`, 20, 205)
        doc.text(`UKUPNO: ${contractForm.totalPrice} EUR`, 20, 212)
        doc.text(`Polog: ${contractForm.deposit} EUR`, 20, 219)
        doc.text(`Nacin placanja: ${contractForm.paymentMethod}`, 20, 226)

        doc.setFontSize(12)
        doc.text('UVJETI NAJMA:', 20, 241)
        doc.setFontSize(8)
        const uvjeti = [
            '1. Najmoprimac se obvezuje vratiti vozilo u istom stanju u kojem ga je preuzeo.',
            '2. Gorivo: Vozilo se preuzima i vraca s punim spremnikom goriva.',
            '3. Kilometraza: Neograniceno.',
            '4. Osiguranje: Vozilo je osigurano od automobilske odgovornosti.',
            '5. Polog se vraca po povratu vozila bez ostecenja.',
            '6. U slucaju kasnjenja s povratom, naplacuje se dodatni dan najma.',
            '7. Zabranjeno je pusenje u vozilu i prijevoz kucnih ljubimaca bez prethodne najave.'
        ]
        uvjeti.forEach((u, i) => doc.text(u, 20, 248 + (i * 5)))

        doc.setFontSize(10)
        doc.text('_______________________', 30, 290)
        doc.text('Najmoprimac', 45, 297)
        doc.text('_______________________', 130, 290)
        doc.text('Najmodavac', 145, 297)

        doc.save(`Ugovor_${contractForm.driverName.replace(/\s/g, '_')}_${contractForm.pickupDate}.pdf`)
        setGenerating(false)
    }

    const resetContractForm = () => {
        setContractForm({
            driverName: '', driverAddress: '', driverCity: '', driverCountry: 'Hrvatska',
            driverPhone: '', driverEmail: '', driverOIB: '', driverLicenseNumber: '',
            driverLicenseExpiry: '', driverPassportNumber: '', vehicleId: '',
            pickupDate: '', pickupTime: '09:00', returnDate: '', returnTime: '09:00',
            pickupLocation: 'Zadar - Zračna luka', pricePerDay: 65, totalDays: 1,
            totalPrice: 65, deposit: 200, paymentMethod: 'Gotovina', notes: ''
        })
    }

    if (!isLoggedIn) {
        return (
            <div className="login-page">
                <div className="login-card">
                    <h1>🚗 Karoca Admin</h1>
                    <p>Unesite šifru za pristup</p>
                    <form onSubmit={handleLogin}>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Šifra..." autoFocus />
                        {error && <div className="error">{error}</div>}
                        <button type="submit">Prijava</button>
                    </form>
                </div>
                <style jsx>{`
          .login-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%); }
          .login-card { background: rgba(255,255,255,0.05); padding: 3rem; border-radius: 20px; text-align: center; border: 1px solid rgba(255,255,255,0.1); }
          h1 { margin-bottom: 0.5rem; color: white; }
          p { color: #888; margin-bottom: 2rem; }
          input { width: 100%; padding: 1rem; border: 1px solid rgba(255,255,255,0.2); border-radius: 10px; background: rgba(255,255,255,0.05); color: white; font-size: 1rem; margin-bottom: 1rem; }
          button { width: 100%; padding: 1rem; background: linear-gradient(135deg, #e94560 0%, #f5af19 100%); border: none; border-radius: 10px; color: white; font-weight: 600; cursor: pointer; }
          .error { color: #e94560; margin-bottom: 1rem; }
        `}</style>
            </div>
        )
    }

    return (
        <div className="admin">
            <nav className="admin-nav">
                <div className="nav-brand">🚗 Karoca Admin</div>
                <div className="nav-tabs">
                    <button className={activeTab === 'bookings' ? 'active' : ''} onClick={() => setActiveTab('bookings')}>
                        <CalendarCheck size={18} /> Rezervacije
                    </button>
                    <button className={activeTab === 'messages' ? 'active' : ''} onClick={() => setActiveTab('messages')}>
                        <MessageSquare size={18} /> Poruke
                    </button>
                    <button className={activeTab === 'vehicles' ? 'active' : ''} onClick={() => setActiveTab('vehicles')}>
                        <Car size={18} /> Vozila
                    </button>
                    <button className={activeTab === 'contract' ? 'active' : ''} onClick={() => setActiveTab('contract')}>
                        <FileText size={18} /> Ugovor
                    </button>
                </div>
                <button className="logout-btn" onClick={handleLogout}>
                    <LogOut size={18} /> Odjava
                </button>
            </nav>

            <main className="admin-content">
                {loading ? (
                    <div className="loading"><Loader2 className="spin" size={40} /></div>
                ) : activeTab === 'bookings' ? (
                    <div className="table-container">
                        <h2>Rezervacije ({bookings.length})</h2>
                        <table>
                            <thead>
                                <tr><th>Datum</th><th>Klijent</th><th>Vozilo</th><th>Period</th><th>Lokacija</th><th>Status</th><th>Akcije</th></tr>
                            </thead>
                            <tbody>
                                {bookings.map((b) => (
                                    <tr key={b.id}>
                                        <td>{new Date(b.created_at).toLocaleDateString('hr')}</td>
                                        <td><strong>{b.customer_name}</strong><br /><small>{b.customer_email}</small><br /><small>{b.customer_phone}</small></td>
                                        <td>{b.vehicle?.name || '-'}</td>
                                        <td>{b.pickup_date} → {b.return_date}</td>
                                        <td>{b.pickup_location}</td>
                                        <td><span className={`status status-${b.status}`}>{b.status}</span></td>
                                        <td>
                                            <div className="actions">
                                                {b.status === 'pending' && (<><button className="btn-confirm" onClick={() => updateBookingStatus(b.id, 'confirmed')}><Check size={14} /></button><button className="btn-cancel" onClick={() => updateBookingStatus(b.id, 'cancelled')}><X size={14} /></button></>)}
                                                {b.status === 'confirmed' && (<button className="btn-complete" onClick={() => updateBookingStatus(b.id, 'completed')}>Završi</button>)}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : activeTab === 'messages' ? (
                    <div className="table-container">
                        <h2>Poruke ({messages.length})</h2>
                        <table>
                            <thead><tr><th>Datum</th><th>Ime</th><th>Email</th><th>Poruka</th><th>Akcije</th></tr></thead>
                            <tbody>
                                {messages.map((m) => (
                                    <tr key={m.id} className={m.read ? '' : 'unread'}>
                                        <td>{new Date(m.created_at).toLocaleDateString('hr')}</td>
                                        <td>{m.name}</td>
                                        <td>{m.email}</td>
                                        <td className="message-cell">{m.message}</td>
                                        <td><div className="actions">{!m.read && (<button className="btn-read" onClick={() => markMessageAsRead(m.id)}><Eye size={14} /></button>)}<button className="btn-delete" onClick={() => deleteMessage(m.id)}><Trash2 size={14} /></button></div></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : activeTab === 'vehicles' ? (
                    <div className="table-container">
                        <h2>Vozila ({vehicles.length})</h2>
                        <table>
                            <thead><tr><th>Naziv</th><th>Kategorija</th><th>Cijena/dan</th><th>Dostupnost</th></tr></thead>
                            <tbody>
                                {vehicles.map((v) => (
                                    <tr key={v.id}>
                                        <td>{v.name}</td>
                                        <td>{v.category}</td>
                                        <td>€{v.price_per_day}</td>
                                        <td><button className={`toggle ${v.available ? 'on' : 'off'}`} onClick={() => toggleVehicleAvailability(v.id, v.available)}>{v.available ? 'Dostupno' : 'Nedostupno'}</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="contract-container">
                        <div className="contract-header">
                            <h2><FileText size={20} /> Novi ugovor o najmu</h2>
                            <button className="reset-btn" onClick={resetContractForm}>Očisti formu</button>
                        </div>

                        <div className="contract-grid">
                            <section>
                                <h3>Podaci o vozaču</h3>
                                <div className="form-grid">
                                    <input placeholder="Ime i prezime *" value={contractForm.driverName} onChange={e => setContractForm({ ...contractForm, driverName: e.target.value })} />
                                    <input placeholder="Adresa *" value={contractForm.driverAddress} onChange={e => setContractForm({ ...contractForm, driverAddress: e.target.value })} />
                                    <input placeholder="Grad *" value={contractForm.driverCity} onChange={e => setContractForm({ ...contractForm, driverCity: e.target.value })} />
                                    <input placeholder="Država" value={contractForm.driverCountry} onChange={e => setContractForm({ ...contractForm, driverCountry: e.target.value })} />
                                    <input placeholder="OIB *" value={contractForm.driverOIB} onChange={e => setContractForm({ ...contractForm, driverOIB: e.target.value })} />
                                    <input placeholder="Telefon *" value={contractForm.driverPhone} onChange={e => setContractForm({ ...contractForm, driverPhone: e.target.value })} />
                                    <input placeholder="Email" value={contractForm.driverEmail} onChange={e => setContractForm({ ...contractForm, driverEmail: e.target.value })} />
                                    <input placeholder="Broj vozačke *" value={contractForm.driverLicenseNumber} onChange={e => setContractForm({ ...contractForm, driverLicenseNumber: e.target.value })} />
                                    <div className="input-group"><label>Vozačka vrijedi do</label><input type="date" value={contractForm.driverLicenseExpiry} onChange={e => setContractForm({ ...contractForm, driverLicenseExpiry: e.target.value })} /></div>
                                    <input placeholder="Br. putovnice/osobne" value={contractForm.driverPassportNumber} onChange={e => setContractForm({ ...contractForm, driverPassportNumber: e.target.value })} />
                                </div>
                            </section>

                            <section>
                                <h3>Podaci o najmu</h3>
                                <div className="form-grid">
                                    <select value={contractForm.vehicleId} onChange={e => handleVehicleChange(e.target.value)} className="full-width">
                                        <option value="">Odaberi vozilo *</option>
                                        {vehicles.filter(v => v.available).map(v => (<option key={v.id} value={v.id}>{v.name} - €{v.price_per_day}/dan</option>))}
                                    </select>
                                    <select value={contractForm.pickupLocation} onChange={e => setContractForm({ ...contractForm, pickupLocation: e.target.value })}>
                                        <option>Zadar - Zračna luka</option>
                                        <option>Zadar - Centar</option>
                                        <option>Zadar - Autobusni kolodvor</option>
                                    </select>
                                    <div className="input-group"><label>Preuzimanje</label><input type="date" value={contractForm.pickupDate} onChange={e => setContractForm({ ...contractForm, pickupDate: e.target.value })} /></div>
                                    <input type="time" value={contractForm.pickupTime} onChange={e => setContractForm({ ...contractForm, pickupTime: e.target.value })} />
                                    <div className="input-group"><label>Povrat</label><input type="date" value={contractForm.returnDate} onChange={e => setContractForm({ ...contractForm, returnDate: e.target.value })} /></div>
                                    <input type="time" value={contractForm.returnTime} onChange={e => setContractForm({ ...contractForm, returnTime: e.target.value })} />
                                </div>
                            </section>

                            <section>
                                <h3>Plaćanje</h3>
                                <div className="form-grid">
                                    <div className="input-group"><label>€/dan</label><input type="number" value={contractForm.pricePerDay} onChange={e => setContractForm({ ...contractForm, pricePerDay: Number(e.target.value) })} /></div>
                                    <div className="input-group"><label>Dana</label><input type="number" value={contractForm.totalDays} readOnly /></div>
                                    <div className="input-group total"><label>UKUPNO €</label><input type="number" value={contractForm.totalPrice} readOnly /></div>
                                    <div className="input-group"><label>Polog €</label><input type="number" value={contractForm.deposit} onChange={e => setContractForm({ ...contractForm, deposit: Number(e.target.value) })} /></div>
                                    <select value={contractForm.paymentMethod} onChange={e => setContractForm({ ...contractForm, paymentMethod: e.target.value })}>
                                        <option>Gotovina</option>
                                        <option>Kartica</option>
                                        <option>Bankovni prijenos</option>
                                    </select>
                                </div>
                            </section>
                        </div>

                        <button className="generate-btn" onClick={generatePDF} disabled={generating || !contractForm.vehicleId || !contractForm.driverName}>
                            {generating ? <><Loader2 className="spin" size={18} /> Generiranje...</> : <><FileText size={18} /> Generiraj PDF ugovor</>}
                        </button>
                    </div>
                )}
            </main>

            <style jsx>{`
        .admin { min-height: 100vh; background: #0f0f1a; color: white; }
        .admin-nav { display: flex; align-items: center; justify-content: space-between; padding: 1rem 2rem; background: rgba(26, 26, 46, 0.9); border-bottom: 1px solid rgba(255,255,255,0.1); }
        .nav-brand { font-size: 1.25rem; font-weight: 700; }
        .nav-tabs { display: flex; gap: 0.5rem; }
        .nav-tabs button { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.25rem; background: transparent; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #888; cursor: pointer; }
        .nav-tabs button.active { background: linear-gradient(135deg, #e94560 0%, #f5af19 100%); border-color: transparent; color: white; }
        .logout-btn { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.25rem; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #888; cursor: pointer; }
        .admin-content { padding: 2rem; }
        .loading { display: flex; justify-content: center; padding: 4rem; }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .table-container { background: rgba(26,26,46,0.5); border-radius: 16px; padding: 1.5rem; }
        h2 { margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 1rem; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.1); }
        th { color: #888; font-weight: 500; }
        .unread { background: rgba(233, 69, 96, 0.1); }
        .message-cell { max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .status { padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; }
        .status-pending { background: rgba(245, 175, 25, 0.2); color: #f5af19; }
        .status-confirmed { background: rgba(34, 197, 94, 0.2); color: #22c55e; }
        .status-completed { background: rgba(59, 130, 246, 0.2); color: #3b82f6; }
        .status-cancelled { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
        .actions { display: flex; gap: 0.5rem; }
        .actions button { padding: 0.5rem; border: none; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 0.25rem; }
        .btn-confirm { background: rgba(34, 197, 94, 0.2); color: #22c55e; }
        .btn-cancel { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
        .btn-complete { background: rgba(59, 130, 246, 0.2); color: #3b82f6; padding: 0.5rem 1rem; }
        .btn-read { background: rgba(59, 130, 246, 0.2); color: #3b82f6; }
        .btn-delete { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
        .toggle { padding: 0.5rem 1rem; border: none; border-radius: 20px; cursor: pointer; font-weight: 500; }
        .toggle.on { background: rgba(34, 197, 94, 0.2); color: #22c55e; }
        .toggle.off { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
        
        /* Contract styles */
        .contract-container { background: rgba(26,26,46,0.5); border-radius: 16px; padding: 1.5rem; }
        .contract-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .reset-btn { padding: 0.5rem 1rem; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; color: #888; cursor: pointer; }
        .contract-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-bottom: 1.5rem; }
        section { background: rgba(255,255,255,0.03); border-radius: 12px; padding: 1.25rem; }
        h3 { font-size: 0.875rem; color: #e94560; margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 0.05em; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
        .form-grid input, .form-grid select { padding: 0.75rem; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: white; font-size: 0.9rem; }
        .form-grid input:focus, .form-grid select:focus { outline: none; border-color: #e94560; }
        .form-grid input::placeholder { color: #666; }
        .full-width { grid-column: 1 / -1; }
        .input-group { display: flex; flex-direction: column; gap: 0.25rem; }
        .input-group label { font-size: 0.75rem; color: #888; }
        .input-group.total input { background: rgba(233, 69, 96, 0.2); font-weight: 700; font-size: 1.25rem; text-align: center; }
        .generate-btn { width: 100%; padding: 1.25rem; background: linear-gradient(135deg, #e94560 0%, #f5af19 100%); border: none; border-radius: 12px; color: white; font-size: 1.125rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.75rem; }
        .generate-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        @media (max-width: 1200px) { .contract-grid { grid-template-columns: 1fr; } }
        @media (max-width: 768px) { .nav-tabs { flex-wrap: wrap; } .form-grid { grid-template-columns: 1fr; } }
      `}</style>
        </div>
    )
}
