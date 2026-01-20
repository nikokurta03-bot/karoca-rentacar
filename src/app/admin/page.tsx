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
    Loader2
} from 'lucide-react'

// Admin password - in production, use proper authentication!
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
    const [activeTab, setActiveTab] = useState<'bookings' | 'messages' | 'vehicles'>('bookings')
    const [bookings, setBookings] = useState<Booking[]>([])
    const [messages, setMessages] = useState<ContactMessage[]>([])
    const [vehicles, setVehicles] = useState<Vehicle[]>([])
    const [loading, setLoading] = useState(false)

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

    const fetchData = async () => {
        setLoading(true)

        if (activeTab === 'bookings') {
            const { data } = await supabase
                .from('bookings')
                .select('*, vehicle:vehicles(name)')
                .order('created_at', { ascending: false })
            setBookings(data || [])
        } else if (activeTab === 'messages') {
            const { data } = await supabase
                .from('contact_messages')
                .select('*')
                .order('created_at', { ascending: false })
            setMessages(data || [])
        } else if (activeTab === 'vehicles') {
            const { data } = await supabase
                .from('vehicles')
                .select('*')
                .order('name')
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

    if (!isLoggedIn) {
        return (
            <div className="login-page">
                <div className="login-card">
                    <h1>🚗 Karoca Admin</h1>
                    <p>Unesite šifru za pristup</p>
                    <form onSubmit={handleLogin}>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Šifra..."
                            autoFocus
                        />
                        {error && <div className="error">{error}</div>}
                        <button type="submit">Prijava</button>
                    </form>
                </div>
                <style jsx>{`
          .login-page {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%);
          }
          .login-card {
            background: rgba(255,255,255,0.05);
            padding: 3rem;
            border-radius: 20px;
            text-align: center;
            border: 1px solid rgba(255,255,255,0.1);
          }
          h1 { margin-bottom: 0.5rem; color: white; }
          p { color: #888; margin-bottom: 2rem; }
          input {
            width: 100%;
            padding: 1rem;
            border: 1px solid rgba(255,255,255,0.2);
            border-radius: 10px;
            background: rgba(255,255,255,0.05);
            color: white;
            font-size: 1rem;
            margin-bottom: 1rem;
          }
          button {
            width: 100%;
            padding: 1rem;
            background: linear-gradient(135deg, #e94560 0%, #f5af19 100%);
            border: none;
            border-radius: 10px;
            color: white;
            font-weight: 600;
            cursor: pointer;
          }
          .error {
            color: #e94560;
            margin-bottom: 1rem;
          }
        `}</style>
            </div>
        )
    }

    return (
        <div className="admin">
            <nav className="admin-nav">
                <div className="nav-brand">🚗 Karoca Admin</div>
                <div className="nav-tabs">
                    <button
                        className={activeTab === 'bookings' ? 'active' : ''}
                        onClick={() => setActiveTab('bookings')}
                    >
                        <CalendarCheck size={18} /> Rezervacije
                    </button>
                    <button
                        className={activeTab === 'messages' ? 'active' : ''}
                        onClick={() => setActiveTab('messages')}
                    >
                        <MessageSquare size={18} /> Poruke
                    </button>
                    <button
                        className={activeTab === 'vehicles' ? 'active' : ''}
                        onClick={() => setActiveTab('vehicles')}
                    >
                        <Car size={18} /> Vozila
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
                                <tr>
                                    <th>Datum</th>
                                    <th>Klijent</th>
                                    <th>Vozilo</th>
                                    <th>Period</th>
                                    <th>Lokacija</th>
                                    <th>Status</th>
                                    <th>Akcije</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.map((b) => (
                                    <tr key={b.id}>
                                        <td>{new Date(b.created_at).toLocaleDateString('hr')}</td>
                                        <td>
                                            <strong>{b.customer_name}</strong><br />
                                            <small>{b.customer_email}</small><br />
                                            <small>{b.customer_phone}</small>
                                        </td>
                                        <td>{b.vehicle?.name || '-'}</td>
                                        <td>{b.pickup_date} → {b.return_date}</td>
                                        <td>{b.pickup_location}</td>
                                        <td>
                                            <span className={`status status-${b.status}`}>{b.status}</span>
                                        </td>
                                        <td>
                                            <div className="actions">
                                                {b.status === 'pending' && (
                                                    <>
                                                        <button className="btn-confirm" onClick={() => updateBookingStatus(b.id, 'confirmed')}>
                                                            <Check size={14} />
                                                        </button>
                                                        <button className="btn-cancel" onClick={() => updateBookingStatus(b.id, 'cancelled')}>
                                                            <X size={14} />
                                                        </button>
                                                    </>
                                                )}
                                                {b.status === 'confirmed' && (
                                                    <button className="btn-complete" onClick={() => updateBookingStatus(b.id, 'completed')}>
                                                        Završi
                                                    </button>
                                                )}
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
                            <thead>
                                <tr>
                                    <th>Datum</th>
                                    <th>Ime</th>
                                    <th>Email</th>
                                    <th>Poruka</th>
                                    <th>Akcije</th>
                                </tr>
                            </thead>
                            <tbody>
                                {messages.map((m) => (
                                    <tr key={m.id} className={m.read ? '' : 'unread'}>
                                        <td>{new Date(m.created_at).toLocaleDateString('hr')}</td>
                                        <td>{m.name}</td>
                                        <td>{m.email}</td>
                                        <td className="message-cell">{m.message}</td>
                                        <td>
                                            <div className="actions">
                                                {!m.read && (
                                                    <button className="btn-read" onClick={() => markMessageAsRead(m.id)}>
                                                        <Eye size={14} />
                                                    </button>
                                                )}
                                                <button className="btn-delete" onClick={() => deleteMessage(m.id)}>
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="table-container">
                        <h2>Vozila ({vehicles.length})</h2>
                        <table>
                            <thead>
                                <tr>
                                    <th>Naziv</th>
                                    <th>Kategorija</th>
                                    <th>Cijena/dan</th>
                                    <th>Dostupnost</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vehicles.map((v) => (
                                    <tr key={v.id}>
                                        <td>{v.name}</td>
                                        <td>{v.category}</td>
                                        <td>€{v.price_per_day}</td>
                                        <td>
                                            <button
                                                className={`toggle ${v.available ? 'on' : 'off'}`}
                                                onClick={() => toggleVehicleAvailability(v.id, v.available)}
                                            >
                                                {v.available ? 'Dostupno' : 'Nedostupno'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>

            <style jsx>{`
        .admin { min-height: 100vh; background: #0f0f1a; color: white; }
        .admin-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 2rem;
          background: rgba(26, 26, 46, 0.9);
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .nav-brand { font-size: 1.25rem; font-weight: 700; }
        .nav-tabs { display: flex; gap: 0.5rem; }
        .nav-tabs button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          color: #888;
          cursor: pointer;
        }
        .nav-tabs button.active {
          background: linear-gradient(135deg, #e94560 0%, #f5af19 100%);
          border-color: transparent;
          color: white;
        }
        .logout-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          color: #888;
          cursor: pointer;
        }
        .admin-content { padding: 2rem; }
        .loading { display: flex; justify-content: center; padding: 4rem; }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .table-container { background: rgba(26,26,46,0.5); border-radius: 16px; padding: 1.5rem; }
        h2 { margin-bottom: 1.5rem; }
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
        .actions button {
          padding: 0.5rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }
        .btn-confirm { background: rgba(34, 197, 94, 0.2); color: #22c55e; }
        .btn-cancel { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
        .btn-complete { background: rgba(59, 130, 246, 0.2); color: #3b82f6; padding: 0.5rem 1rem; }
        .btn-read { background: rgba(59, 130, 246, 0.2); color: #3b82f6; }
        .btn-delete { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
        .toggle { padding: 0.5rem 1rem; border: none; border-radius: 20px; cursor: pointer; font-weight: 500; }
        .toggle.on { background: rgba(34, 197, 94, 0.2); color: #22c55e; }
        .toggle.off { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
      `}</style>
        </div>
    )
}
