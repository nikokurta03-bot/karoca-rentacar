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
    FileText,
    Settings,
    Save,
    Edit2,
    Tag,
    Plus,
    Copy
} from 'lucide-react'
import { jsPDF } from 'jspdf'


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
    extra_notes?: string
    border_crossing?: boolean
    cleaning_fee?: boolean
    deposit_confirmed?: boolean
    selected_extras?: string[]
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
    // Management fields
    mileage?: number
    registration_expiry?: string
    kasko_expiry?: string
    last_service_date?: string
    tire_type?: 'Ljetne' | 'Zimske'
    tire_age?: number
    color?: string
    cleanliness?: 'Oprano' | 'Neoprano'
    vehicle_status?: 'Spreman' | 'U najmu' | 'Servis'
    license_plate?: string
}

interface PromoCode {
    id: string
    code: string
    discount_percent: number
    active: boolean
    uses_remaining: number | null
    valid_until: string | null
    created_at: string
}

interface ApiKey {
    id: string
    partner_name: string
    key: string
    active: boolean
    created_at: string
}

export default function AdminPage() {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loginLoading, setLoginLoading] = useState(false)
    const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null)
    const isMasterAdmin = currentUserEmail === 'niko.kurta03@karoca-rentacar.hr'
    const [activeTab, setActiveTab] = useState<'bookings' | 'messages' | 'vehicles' | 'contract' | 'fleet' | 'promo' | 'api'>('bookings')

    const [bookings, setBookings] = useState<Booking[]>([])
    const [messages, setMessages] = useState<ContactMessage[]>([])
    const [vehicles, setVehicles] = useState<Vehicle[]>([])
    const [loading, setLoading] = useState(false)
    const [generating, setGenerating] = useState(false)
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
    const [saving, setSaving] = useState(false)

    // Promo codes state
    const [promoCodes, setPromoCodes] = useState<PromoCode[]>([])
    const [newPromoCode, setNewPromoCode] = useState('')
    const [newPromoDiscount, setNewPromoDiscount] = useState(10)
    const [creatingPromo, setCreatingPromo] = useState(false)

    // API Keys state
    const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
    const [newPartnerName, setNewPartnerName] = useState('')
    const [creatingKey, setCreatingKey] = useState(false)


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
        paymentStatus: 'Neplaćeno',
        notes: '',
        agentName: ''
    })


    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoginLoading(true)
        setError('')

        try {
            const { error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (authError) {
                setError('Neuspješna prijava: ' + authError.message)
            } else {
                setIsLoggedIn(true)
            }
        } catch (err: any) {
            setError('Došlo je do pogreške pri prijavi')
        } finally {
            setLoginLoading(false)
        }
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        setIsLoggedIn(false)
    }

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (session) {
                setIsLoggedIn(true)
                setCurrentUserEmail(session.user.email ?? null)
            }
        }
        checkSession()

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) {
                setIsLoggedIn(true)
                setCurrentUserEmail(session.user.email ?? null)
            } else {
                setIsLoggedIn(false)
                setCurrentUserEmail(null)
            }
        })

        return () => subscription.unsubscribe()
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
        setError('')
        try {
            if (activeTab === 'bookings') {
                const { data, error } = await supabase.from('bookings').select('*, vehicle:vehicles(name)').order('created_at', { ascending: false })
                if (error) throw error
                setBookings(data || [])
            } else if (activeTab === 'messages') {
                const { data, error } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false })
                if (error) throw error
                setMessages(data || [])
            } else if (activeTab === 'vehicles' || activeTab === 'contract' || activeTab === 'fleet') {
                const { data, error } = await supabase.from('vehicles').select('*').order('name')
                if (error) throw error
                setVehicles(data || [])
            } else if (activeTab === 'promo') {
                const { data, error } = await supabase.from('promo_codes').select('*').order('created_at', { ascending: false })
                if (error) throw error
                setPromoCodes(data || [])
            } else if (activeTab === 'api') {
                const { data, error } = await supabase.from('api_keys').select('*').order('created_at', { ascending: false })
                if (error) throw error
                setApiKeys(data || [])
            }
        } catch (err: any) {
            console.error('Fetch error:', err)
            setError('Greška pri dohvaćanju podataka: ' + err.message)
        }
        setLoading(false)
    }

    const saveVehicle = async () => {
        if (!selectedVehicle) return
        setSaving(true)
        try {
            const { error } = await supabase.from('vehicles').update({
                name: selectedVehicle.name,
                category: selectedVehicle.category,
                price_per_day: selectedVehicle.price_per_day,
                mileage: selectedVehicle.mileage,
                registration_expiry: selectedVehicle.registration_expiry || null,
                kasko_expiry: selectedVehicle.kasko_expiry || null,
                last_service_date: selectedVehicle.last_service_date || null,
                tire_type: selectedVehicle.tire_type,
                tire_age: selectedVehicle.tire_age,
                color: selectedVehicle.color,
                cleanliness: selectedVehicle.cleanliness,
                vehicle_status: selectedVehicle.vehicle_status,
                license_plate: selectedVehicle.license_plate
            }).eq('id', selectedVehicle.id)

            if (error) throw error

            await fetchData()
            setSelectedVehicle(null)
            alert('Promjene uspješno spremljene!')
        } catch (error: any) {
            console.error('Error saving vehicle:', error)
            alert(`Greška pri spremanju: ${error.message || 'Nepoznata greška'}`)
        } finally {
            setSaving(false)
        }
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

    // Promo code functions
    const generateRandomCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
        let code = 'KAROCA'
        for (let i = 0; i < 4; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        setNewPromoCode(code)
    }

    const createPromoCode = async () => {
        if (!newPromoCode.trim()) {
            alert('Unesite kod!')
            return
        }
        setCreatingPromo(true)
        try {
            const { error } = await supabase.from('promo_codes').insert({
                code: newPromoCode.toUpperCase().trim(),
                discount_percent: newPromoDiscount,
                active: true
            })
            if (error) throw error
            setNewPromoCode('')
            setNewPromoDiscount(10)
            fetchData()
            alert('Promo kod uspješno kreiran!')
        } catch (error: any) {
            alert(`Greška: ${error.message}`)
        } finally {
            setCreatingPromo(false)
        }
    }

    const togglePromoActive = async (id: string, currentActive: boolean) => {
        await supabase.from('promo_codes').update({ active: !currentActive }).eq('id', id)
        fetchData()
    }

    const deletePromoCode = async (id: string) => {
        if (!confirm('Jeste li sigurni da želite obrisati ovaj promo kod?')) return
        await supabase.from('promo_codes').delete().eq('id', id)
        fetchData()
    }

    const copyToClipboard = (code: string) => {
        navigator.clipboard.writeText(code)
        alert(`Kopirano: ${code}`)
    }

    // API Key functions
    const generateApiKey = async () => {
        if (!newPartnerName.trim()) {
            alert('Unesite naziv partnera!')
            return
        }
        setCreatingKey(true)
        try {
            const newKey = `karoca_${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}`
            const { error } = await supabase.from('api_keys').insert({
                partner_name: newPartnerName.trim(),
                key: newKey,
                active: true
            })
            if (error) throw error
            setNewPartnerName('')
            fetchData()
            alert('API ključ uspješno generiran!')
        } catch (error: any) {
            alert(`Greška: ${error.message}`)
        } finally {
            setCreatingKey(false)
        }
    }

    const deleteApiKey = async (id: string) => {
        if (!confirm('Jeste li sigurni da želite obrisati ovaj API ključ? Pristup partneru će biti odmah onemogućen.')) return
        await supabase.from('api_keys').delete().eq('id', id)
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
        const today = new Date().toLocaleDateString('hr-HR')
        const contractNumber = `KRC-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`

        // ============ PAGE 1 ============
        // Header
        doc.setFontSize(22)
        doc.setFont('helvetica', 'bold')
        doc.text('KAROCA RENT A CAR', 105, 20, { align: 'center' })
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.text('Obala kneza Branimira 1, 23000 Zadar, Hrvatska', 105, 27, { align: 'center' })
        doc.text('Tel: +385 99 165 5885 | Email: info@karoca.hr | OIB: 12345678901', 105, 33, { align: 'center' })

        doc.setLineWidth(0.5)
        doc.line(20, 38, 190, 38)

        // Title
        doc.setFontSize(16)
        doc.setFont('helvetica', 'bold')
        doc.text('UGOVOR O NAJMU MOTORNOG VOZILA', 105, 48, { align: 'center' })

        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.text(`Broj ugovora: ${contractNumber}`, 20, 56)
        doc.text(`Datum sklapanja: ${today}`, 140, 56)
        doc.text(`Mjesto sklapanja: Zadar`, 20, 62)

        // Article 1 - Parties
        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.text('Clanak 1. UGOVORNE STRANE', 20, 72)
        doc.setFontSize(9)
        doc.setFont('helvetica', 'normal')
        doc.text('NAJMODAVAC: KAROCA RENT A CAR, Obala kneza Branimira 1, 23000 Zadar, OIB: 12345678901', 20, 79)
        doc.text('NAJMOPRIMAC:', 20, 86)
        doc.text(`   Ime i prezime: ${contractForm.driverName}`, 20, 92)
        doc.text(`   Adresa: ${contractForm.driverAddress}, ${contractForm.driverCity}, ${contractForm.driverCountry}`, 20, 98)
        doc.text(`   OIB: ${contractForm.driverOIB}                    Telefon: ${contractForm.driverPhone}`, 20, 104)
        doc.text(`   Email: ${contractForm.driverEmail}`, 20, 110)
        doc.text(`   Vozacka dozvola br.: ${contractForm.driverLicenseNumber}     Vrijedi do: ${contractForm.driverLicenseExpiry}`, 20, 116)
        doc.text(`   Osobna iskaznica / Putovnica br.: ${contractForm.driverPassportNumber}`, 20, 122)

        // Article 2 - Vehicle
        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.text('Clanak 2. PREDMET UGOVORA - VOZILO', 20, 132)
        doc.setFontSize(9)
        doc.setFont('helvetica', 'normal')
        doc.text(`Marka i model: ${vehicle?.name || '-'}`, 20, 139)
        doc.text(`Registracijska oznaka: ZD-XXX-XX`, 20, 145)
        doc.text(`Stanje kilometara pri preuzimanju: _____________ km`, 20, 151)
        doc.text(`Stanje goriva pri preuzimanju: PUNO / 3/4 / 1/2 / 1/4   (zaokruziti)`, 20, 157)
        doc.text(`Vozilo se preuzima u tehnicki ispravnom stanju bez vidljivih ostecenja, osim:`, 20, 163)
        doc.text(`_____________________________________________________________________________`, 20, 169)

        // Article 3 - Rental Period
        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.text('Clanak 3. TRAJANJE NAJMA', 20, 179)
        doc.setFontSize(9)
        doc.setFont('helvetica', 'normal')
        doc.text(`Lokacija preuzimanja: ${contractForm.pickupLocation}`, 20, 186)
        doc.text(`Datum i vrijeme preuzimanja: ${contractForm.pickupDate} u ${contractForm.pickupTime} sati`, 20, 192)
        doc.text(`Lokacija povrata: ${contractForm.pickupLocation}`, 20, 198)
        doc.text(`Datum i vrijeme povrata: ${contractForm.returnDate} u ${contractForm.returnTime} sati`, 20, 204)
        doc.text(`Ukupno dana najma: ${contractForm.totalDays}`, 20, 210)

        // Article 4 - Price
        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.text('Clanak 4. CIJENA I NACIN PLACANJA', 20, 220)
        doc.setFontSize(9)
        doc.setFont('helvetica', 'normal')
        doc.text(`Cijena najma po danu: ${contractForm.pricePerDay},00 EUR`, 20, 227)
        doc.text(`Ukupna cijena najma (${contractForm.totalDays} dana x ${contractForm.pricePerDay} EUR): ${contractForm.totalPrice},00 EUR`, 20, 233)
        doc.text(`Polog (jamcevina): ${contractForm.deposit},00 EUR`, 20, 239)
        doc.text(`Nacin placanja: ${contractForm.paymentMethod}`, 20, 245)
        doc.text(`Polog se vraca najmoprimcu po povratu vozila u neostecenomu stanju.`, 20, 251)

        // Footer page 1
        doc.setFontSize(8)
        doc.text('Stranica 1 od 2', 105, 290, { align: 'center' })

        // ============ PAGE 2 ============
        doc.addPage()

        // Article 5 - Obligations
        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.text('Clanak 5. OBVEZE NAJMOPRIMCA', 20, 20)
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        const obligations = [
            '5.1. Koristiti vozilo paznjom dobrog domacina i u skladu sa Zakonom o sigurnosti prometa na cestama.',
            '5.2. Vozilo smije koristiti iskljucivo najmoprimac naveden u ovom ugovoru.',
            '5.3. Zabranjeno je koristenje vozila pod utjecajem alkohola, droga ili drugih opojnih sredstava.',
            '5.4. Zabranjeno je pusenje u vozilu.',
            '5.5. Zabranjeno je prijevoz kucnih ljubimaca bez prethodne pisane suglasnosti najmodavca.',
            '5.6. Zabranjeno je koristenje vozila za vucu drugih vozila ili prikolica.',
            '5.7. Zabranjeno je koristenje vozila za utrke, terenska voznja ili nezakonite aktivnosti.',
            '5.8. Najmoprimac je duzan odmah prijaviti svaku prometnu nezgodu, krađu ili ostecenje vozila.',
            '5.9. Vozilo se vraca s istom razinom goriva kao pri preuzimanju (puno-puno politika).'
        ]
        obligations.forEach((o, i) => doc.text(o, 20, 28 + (i * 5)))

        // Article 6 - Insurance
        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.text('Clanak 6. OSIGURANJE I ODGOVORNOST', 20, 78)
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        const insurance = [
            '6.1. Vozilo je osigurano policom obveznog osiguranja od automobilske odgovornosti.',
            '6.2. CDW (Collision Damage Waiver) - umanjena odgovornost za stetu na vozilu ukljucena u cijenu.',
            '6.3. Najmoprimac je odgovoran za stetu nastalu namjernim djelovanjem ili grubom nepaznjom.',
            '6.4. Najmoprimac je odgovoran za stetu na gumama, staklu, podvozju i unutrasnjosti vozila.',
            '6.5. U slucaju prometne nezgode, najmoprimac je duzan pozvati policiju i pribaviti zapisnik.',
            '6.6. Neogranicena kilometraza ukljucena u cijenu najma.'
        ]
        insurance.forEach((ins, i) => doc.text(ins, 20, 86 + (i * 5)))

        // Article 7 - Return
        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.text('Clanak 7. POVRAT VOZILA', 20, 120)
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        const returnC = [
            '7.1. Vozilo se vraca na ugovorenu lokaciju, u ugovoreno vrijeme, u istom stanju kao pri preuzimanju.',
            '7.2. Kasnjenje s povratom do 1 sat tolerira se bez dodatne naplate.',
            '7.3. Kasnjenje vece od 1 sata naplacuje se kao dodatni dan najma.',
            '7.4. Ukoliko se vozilo ne vrati u roku od 24 sata nakon ugovorenog vremena bez najave,',
            '     najmodavac ima pravo prijaviti vozilo kao ukradeno nadleznim tijelima.',
            '7.5. Troskovi goriva koje nedostaje naplacuju se po vazecoj maloprodajnoj cijeni + naknada za uslugu.'
        ]
        returnC.forEach((r, i) => doc.text(r, 20, 128 + (i * 5)))

        // Article 8 - Fines
        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.text('Clanak 8. PROMETNI PREKRSAJI I KAZNE', 20, 165)
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        doc.text('Najmoprimac je u potpunosti odgovoran za sve prometne prekrsaje pocinjeneza vrijeme trajanja najma.', 20, 172)
        doc.text('Kazne za parkiranenje i ostale prekrsaje terete iskljucivo najmoprimca.', 20, 178)

        // Article 9 - Final
        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.text('Clanak 9. ZAVRSNE ODREDBE', 20, 190)
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        const finalC = [
            '9.1. Za sve sto nije regulirano ovim ugovorom, primjenjuju se odredbe Zakona o obveznim odnosima.',
            '9.2. U slucaju spora nadlezan je Opcinski sud u Zadru.',
            '9.3. Potpisom ovog ugovora najmoprimac potvrđuje da je pregledao vozilo i preuzeo ga u ispravnom stanju.',
            '9.4. Ugovor je sacinjen u dva (2) primjerka, po jedan za svaku ugovornu stranu.'
        ]
        finalC.forEach((f, i) => doc.text(f, 20, 198 + (i * 5)))

        // Signatures
        doc.setFontSize(10)
        doc.text(`U Zadru, ${today}`, 20, 235)

        doc.setFont('helvetica', 'bold')
        doc.text('NAJMOPRIMAC:', 30, 250)
        doc.text('NAJMODAVAC:', 130, 250)

        doc.setFont('helvetica', 'normal')
        doc.line(20, 270, 80, 270)
        doc.line(120, 270, 180, 270)
        doc.text(`${contractForm.driverName}`, 50, 278, { align: 'center' })
        doc.text(`${contractForm.agentName || 'KAROCA RENT A CAR'}`, 150, 278, { align: 'center' })
        doc.text('(vlastorucni potpis)', 50, 284, { align: 'center' })
        doc.text('(pecat i potpis)', 150, 284, { align: 'center' })

        // Footer page 2
        doc.setFontSize(8)
        doc.text('Stranica 2 od 2', 105, 290, { align: 'center' })

        doc.save(`Ugovor_${contractNumber}_${contractForm.driverName.replace(/\s/g, '_')}.pdf`)
        setGenerating(false)
    }

    const resetContractForm = () => {
        setContractForm({
            driverName: '', driverAddress: '', driverCity: '', driverCountry: 'Hrvatska',
            driverPhone: '', driverEmail: '', driverOIB: '', driverLicenseNumber: '',
            driverLicenseExpiry: '', driverPassportNumber: '', vehicleId: '',
            pickupDate: '', pickupTime: '09:00', returnDate: '', returnTime: '09:00',
            pickupLocation: 'Zadar - Zračna luka', pricePerDay: 65, totalDays: 1,
            totalPrice: 65, deposit: 200, paymentMethod: 'Gotovina', paymentStatus: 'Neplaćeno',
            notes: '', agentName: ''
        })
    }


    if (!isLoggedIn) {
        return (
            <div className="login-page">
                <div className="login-card">
                    <h1>🚗 Karoca Admin</h1>
                    <p>Prijavite se s emailom i lozinkom</p>
                    <form onSubmit={handleLogin}>
                        <div className="input-group">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email..."
                                required
                                autoFocus
                            />
                        </div>
                        <div className="input-group">
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Lozinka..."
                                required
                            />
                        </div>
                        {error && <div className="error">{error}</div>}
                        <button type="submit" disabled={loginLoading}>
                            {loginLoading ? (
                                <span className="loader-container">
                                    <Loader2 className="spin" size={20} /> Prijava...
                                </span>
                            ) : 'Prijava'}
                        </button>
                    </form>
                </div>
                <style jsx>{`
          .login-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%); }
          .login-card { background: rgba(255,255,255,0.05); padding: 3rem; border-radius: 20px; text-align: center; border: 1px solid rgba(255,255,255,0.1); }
          h1 { margin-bottom: 0.5rem; color: white; }
          p { color: #888; margin-bottom: 2rem; }
          input { width: 100%; padding: 1rem; border: 1px solid rgba(255,255,255,0.2); border-radius: 10px; background: rgba(255,255,255,0.05); color: white; font-size: 1rem; margin-bottom: 1rem; }
          button { width: 100%; padding: 1rem; background: linear-gradient(135deg, #e94560 0%, #f5af19 100%); border: none; border-radius: 10px; color: white; font-weight: 600; cursor: pointer; }
          button:disabled { opacity: 0.7; cursor: not-allowed; }
          .loader-container { display: flex; align-items: center; justify-content: center; gap: 0.5rem; }
          .error { color: #e94560; margin-bottom: 1rem; }
          .spin { animation: spin 1s linear infinite; }
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `}</style>
            </div>
        )
    }

    return (
        <div className="admin">
            <nav className="admin-nav">
                <div className="nav-brand">
                    🚗 Karoca Admin
                    {isMasterAdmin && <span className="master-badge">Master Admin</span>}
                </div>
                <div className="nav-tabs">
                    {/* ... existing buttons ... */}
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
                    <button className={activeTab === 'fleet' ? 'active' : ''} onClick={() => setActiveTab('fleet')}>
                        <Settings size={18} /> Flota
                    </button>
                    <button className={activeTab === 'promo' ? 'active' : ''} onClick={() => setActiveTab('promo')}>
                        <Tag size={18} /> Promo
                    </button>
                    <button className={activeTab === 'api' ? 'active' : ''} onClick={() => setActiveTab('api')}>
                        <Settings size={18} /> API
                    </button>
                </div>
                <div className="nav-user">
                    <span>{currentUserEmail}</span>
                    <button className="logout-btn" onClick={handleLogout}>
                        <LogOut size={18} /> Odjava
                    </button>
                </div>
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
                                        <td>
                                            <strong>{b.customer_name}</strong><br />
                                            <small>{b.customer_email}</small><br />
                                            <small>{b.customer_phone}</small>
                                            {b.extra_notes && (
                                                <div style={{ marginTop: '0.5rem', padding: '0.4rem', background: 'rgba(245, 175, 25, 0.1)', border: '1px solid rgba(245, 175, 25, 0.2)', borderRadius: '6px', fontSize: '0.8rem' }}>
                                                    <strong>Napomena:</strong> {b.extra_notes}
                                                </div>
                                            )}
                                            <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                                                {b.border_crossing && <span style={{ fontSize: '0.7rem', background: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6', padding: '2px 6px', borderRadius: '4px' }}>Granica</span>}
                                                {b.cleaning_fee && <span style={{ fontSize: '0.7rem', background: 'rgba(34, 197, 94, 0.2)', color: '#22c55e', padding: '2px 6px', borderRadius: '4px' }}>Čišćenje</span>}
                                                {b.deposit_confirmed && <span style={{ fontSize: '0.7rem', background: 'rgba(245, 175, 25, 0.2)', color: '#f5af19', padding: '2px 6px', borderRadius: '4px' }}>Polog OK</span>}
                                                {b.selected_extras?.map(id => {
                                                    const labels: Record<string, string> = {
                                                        'cdw': 'Puno kasko',
                                                        'glass': 'Stakla/Gume',
                                                        'infant': 'Jaje',
                                                        'child': 'Sjedalica',
                                                        'booster': 'Booster',
                                                        'gps': 'GPS'
                                                    }
                                                    // Only show labels for things not already covered by flags
                                                    if (['border_eu', 'border_noneu', 'cleaning'].includes(id)) return null;
                                                    if (!labels[id]) return null;
                                                    return <span key={id} style={{ fontSize: '0.7rem', background: 'rgba(255, 255, 255, 0.1)', color: '#fff', padding: '2px 6px', borderRadius: '4px' }}>{labels[id]}</span>
                                                })}
                                            </div>
                                        </td>
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
                            <thead><tr><th>Naziv</th><th>Registracija</th><th>Kategorija</th><th>Cijena/dan</th><th>Dostupnost</th></tr></thead>
                            <tbody>
                                {vehicles.map((v) => (
                                    <tr key={v.id}>
                                        <td>{v.name}</td>
                                        <td><strong style={{ color: '#e94560' }}>{v.license_plate || '-'}</strong></td>
                                        <td>{v.category}</td>
                                        <td>€{v.price_per_day}</td>
                                        <td><button className={`toggle ${v.available ? 'on' : 'off'}`} onClick={() => toggleVehicleAvailability(v.id, v.available)}>{v.available ? 'Dostupno' : 'Nedostupno'}</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : activeTab === 'fleet' ? (
                    <div className="table-container">
                        <h2><Settings size={20} /> Upravljanje flotom ({vehicles.length})</h2>

                        {selectedVehicle ? (
                            <div className="fleet-edit">
                                <div className="fleet-edit-header">
                                    <h3>Uređivanje: {selectedVehicle.name}</h3>
                                    <button className="reset-btn" onClick={() => setSelectedVehicle(null)}>
                                        <X size={16} /> Odustani
                                    </button>
                                </div>

                                <div className="fleet-form-grid">
                                    <div className="input-group full-width">
                                        <label>Naziv vozila</label>
                                        <input type="text" value={selectedVehicle.name || ''} onChange={e => setSelectedVehicle({ ...selectedVehicle, name: e.target.value })} />
                                    </div>
                                    <div className="input-group">
                                        <label>Kategorija</label>
                                        <select value={selectedVehicle.category || 'Economic'} onChange={e => setSelectedVehicle({ ...selectedVehicle, category: e.target.value })}>
                                            <option>Economic</option>
                                            <option>SUV</option>
                                            <option>Premium</option>
                                            <option>Kombi</option>
                                        </select>
                                    </div>
                                    <div className="input-group">
                                        <label>Cijena po danu (€)</label>
                                        <input type="number" value={selectedVehicle.price_per_day || 0} onChange={e => setSelectedVehicle({ ...selectedVehicle, price_per_day: Number(e.target.value) })} />
                                    </div>
                                    <div className="input-group">
                                        <label>Registracija (tablica)</label>
                                        <input type="text" placeholder="ZD-123-AB" value={selectedVehicle.license_plate || ''} onChange={e => setSelectedVehicle({ ...selectedVehicle, license_plate: e.target.value.toUpperCase() })} />
                                    </div>

                                    <div className="input-group">
                                        <label>Kilometraža (km)</label>
                                        <input type="number" value={selectedVehicle.mileage || 0} onChange={e => setSelectedVehicle({ ...selectedVehicle, mileage: Number(e.target.value) })} />
                                    </div>

                                    <div className="input-group">
                                        <label>Boja vozila</label>
                                        <input type="text" value={selectedVehicle.color || ''} onChange={e => setSelectedVehicle({ ...selectedVehicle, color: e.target.value })} />
                                    </div>
                                    <div className="input-group">
                                        <label>Istek registracije</label>
                                        <input type="date" value={selectedVehicle.registration_expiry || ''} onChange={e => setSelectedVehicle({ ...selectedVehicle, registration_expiry: e.target.value })} />
                                    </div>
                                    <div className="input-group">
                                        <label>Istek kaska</label>
                                        <input type="date" value={selectedVehicle.kasko_expiry || ''} onChange={e => setSelectedVehicle({ ...selectedVehicle, kasko_expiry: e.target.value })} />
                                    </div>
                                    <div className="input-group">
                                        <label>Zadnji servis</label>
                                        <input type="date" value={selectedVehicle.last_service_date || ''} onChange={e => setSelectedVehicle({ ...selectedVehicle, last_service_date: e.target.value })} />
                                    </div>
                                    <div className="input-group">
                                        <label>Gume</label>
                                        <select value={selectedVehicle.tire_type || 'Ljetne'} onChange={e => setSelectedVehicle({ ...selectedVehicle, tire_type: e.target.value as 'Ljetne' | 'Zimske' })}>
                                            <option>Ljetne</option>
                                            <option>Zimske</option>
                                        </select>
                                    </div>
                                    <div className="input-group">
                                        <label>Starost guma (mj)</label>
                                        <input type="number" value={selectedVehicle.tire_age || 0} onChange={e => setSelectedVehicle({ ...selectedVehicle, tire_age: Number(e.target.value) })} />
                                    </div>
                                    <div className="input-group">
                                        <label>Čistoća</label>
                                        <select value={selectedVehicle.cleanliness || 'Oprano'} onChange={e => setSelectedVehicle({ ...selectedVehicle, cleanliness: e.target.value as 'Oprano' | 'Neoprano' })}>
                                            <option>Oprano</option>
                                            <option>Neoprano</option>
                                        </select>
                                    </div>
                                    <div className="input-group">
                                        <label>Status vozila</label>
                                        <select value={selectedVehicle.vehicle_status || 'Spreman'} onChange={e => setSelectedVehicle({ ...selectedVehicle, vehicle_status: e.target.value as 'Spreman' | 'U najmu' | 'Servis' })}>
                                            <option>Spreman</option>
                                            <option>U najmu</option>
                                            <option>Servis</option>
                                        </select>
                                    </div>
                                </div>

                                <button className="generate-btn" onClick={saveVehicle} disabled={saving}>
                                    {saving ? <><Loader2 className="spin" size={18} /> Spremanje...</> : <><Save size={18} /> Spremi promjene</>}
                                </button>
                            </div>
                        ) : (
                            <table>
                                <thead>
                                    <tr>
                                        <th>Vozilo</th>
                                        <th>Tablica</th>
                                        <th>Km</th>
                                        <th>Istek reg.</th>
                                        <th>Kasko</th>
                                        <th>Gume</th>
                                        <th>Čistoća</th>
                                        <th>Status</th>
                                        <th>Akcije</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {vehicles.map((v) => (
                                        <tr key={v.id}>
                                            <td><strong>{v.name}</strong><br /><small style={{ color: '#888' }}>{v.color || '-'}</small></td>
                                            <td><strong style={{ color: '#e94560' }}>{v.license_plate || '-'}</strong></td>
                                            <td>{v.mileage?.toLocaleString() || 0} km</td>
                                            <td>{v.registration_expiry ? new Date(v.registration_expiry).toLocaleDateString('hr') : '-'}</td>
                                            <td>{v.kasko_expiry ? new Date(v.kasko_expiry).toLocaleDateString('hr') : '-'}</td>
                                            <td>{v.tire_type || '-'}</td>
                                            <td><span className={`status ${v.cleanliness === 'Oprano' ? 'status-confirmed' : 'status-pending'}`}>{v.cleanliness || '-'}</span></td>
                                            <td><span className={`status ${v.vehicle_status === 'Spreman' ? 'status-confirmed' : v.vehicle_status === 'U najmu' ? 'status-pending' : 'status-cancelled'}`}>{v.vehicle_status || '-'}</span></td>
                                            <td><button className="btn-read" onClick={() => setSelectedVehicle(v)}><Edit2 size={14} /></button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                ) : activeTab === 'contract' ? (
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
                                    <div className="input-group">
                                        <label>Status plaćanja</label>
                                        <select
                                            value={contractForm.paymentStatus}
                                            onChange={e => setContractForm({ ...contractForm, paymentStatus: e.target.value })}
                                            style={{
                                                background: contractForm.paymentStatus === 'Plaćeno' ? 'rgba(34, 197, 94, 0.2)' :
                                                    contractForm.paymentStatus === 'Djelomično' ? 'rgba(245, 175, 25, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                                borderColor: contractForm.paymentStatus === 'Plaćeno' ? '#22c55e' :
                                                    contractForm.paymentStatus === 'Djelomično' ? '#f5af19' : '#ef4444'
                                            }}
                                        >
                                            <option>Neplaćeno</option>
                                            <option>Djelomično</option>
                                            <option>Plaćeno</option>
                                        </select>
                                    </div>
                                </div>
                            </section>

                        </div>

                        <section style={{ marginBottom: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '1.25rem' }}>
                            <h3 style={{ fontSize: '0.875rem', color: '#e94560', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Agent / Zaposlenik</h3>
                            <div className="form-grid">
                                <input
                                    className="full-width"
                                    placeholder="Ime i prezime zaposlenika koji izdaje vozilo *"
                                    value={contractForm.agentName}
                                    onChange={e => setContractForm({ ...contractForm, agentName: e.target.value })}
                                />
                            </div>
                        </section>

                        <button className="generate-btn" onClick={generatePDF} disabled={generating || !contractForm.vehicleId || !contractForm.driverName}>
                            {generating ? <><Loader2 className="spin" size={18} /> Generiranje...</> : <><FileText size={18} /> Generiraj PDF ugovor</>}
                        </button>
                    </div>
                ) : activeTab === 'promo' ? (
                    <div className="table-container">
                        <h2><Tag size={20} /> Promo kodovi ({promoCodes.length})</h2>

                        {/* Create new promo code */}
                        <div className="promo-create" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem' }}>
                            <h3 style={{ marginBottom: '1rem', color: '#f5af19' }}>Kreiraj novi promo kod</h3>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                                <div className="input-group" style={{ flex: 1, minWidth: '200px' }}>
                                    <label>Kod</label>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <input
                                            type="text"
                                            placeholder="KAROCA10"
                                            value={newPromoCode}
                                            onChange={e => setNewPromoCode(e.target.value.toUpperCase())}
                                            style={{ flex: 1 }}
                                        />
                                        <button
                                            onClick={generateRandomCode}
                                            style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: 'white', cursor: 'pointer' }}
                                            title="Generiraj random kod"
                                        >
                                            <Plus size={18} />
                                        </button>
                                    </div>
                                </div>
                                <div className="input-group" style={{ width: '150px' }}>
                                    <label>Popust (%)</label>
                                    <select
                                        value={newPromoDiscount}
                                        onChange={e => setNewPromoDiscount(Number(e.target.value))}
                                        style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}
                                    >
                                        <option value={10}>10%</option>
                                        <option value={20}>20%</option>
                                        <option value={30}>30%</option>
                                        <option value={40}>40%</option>
                                        <option value={50}>50%</option>
                                        <option value={60}>60%</option>
                                    </select>
                                </div>
                                <button
                                    onClick={createPromoCode}
                                    disabled={creatingPromo}
                                    style={{ padding: '0.75rem 1.5rem', background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', border: 'none', borderRadius: '8px', color: 'white', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                >
                                    {creatingPromo ? <Loader2 className="spin" size={18} /> : <Plus size={18} />}
                                    Kreiraj
                                </button>
                            </div>
                        </div>

                        {/* Promo codes table */}
                        <table>
                            <thead>
                                <tr>
                                    <th>Kod</th>
                                    <th>Popust</th>
                                    <th>Status</th>
                                    <th>Kreirano</th>
                                    <th>Akcije</th>
                                </tr>
                            </thead>
                            <tbody>
                                {promoCodes.map((p) => (
                                    <tr key={p.id}>
                                        <td>
                                            <strong style={{ fontSize: '1.1rem', letterSpacing: '0.05em' }}>{p.code}</strong>
                                            <button
                                                onClick={() => copyToClipboard(p.code)}
                                                style={{ marginLeft: '0.5rem', padding: '0.25rem', background: 'transparent', border: 'none', color: '#888', cursor: 'pointer' }}
                                                title="Kopiraj kod"
                                            >
                                                <Copy size={14} />
                                            </button>
                                        </td>
                                        <td>
                                            <span style={{
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '20px',
                                                background: p.discount_percent >= 40 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 175, 25, 0.2)',
                                                color: p.discount_percent >= 40 ? '#ef4444' : '#f5af19',
                                                fontWeight: '700'
                                            }}>
                                                -{p.discount_percent}%
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                className={`toggle ${p.active ? 'on' : 'off'}`}
                                                onClick={() => togglePromoActive(p.id, p.active)}
                                            >
                                                {p.active ? 'Aktivan' : 'Neaktivan'}
                                            </button>
                                        </td>
                                        <td>{new Date(p.created_at).toLocaleDateString('hr')}</td>
                                        <td>
                                            <button className="btn-delete" onClick={() => deletePromoCode(p.id)}>
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : activeTab === 'api' ? (
                    <div className="table-container">
                        <h2><Settings size={20} /> API Integracija ({apiKeys.length})</h2>

                        {/* Create new API Key */}
                        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem' }}>
                            <h3 style={{ marginBottom: '1rem', color: '#3b82f6' }}>Generiraj novi API ključ za partnera</h3>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                                <div className="input-group" style={{ flex: 1, minWidth: '300px' }}>
                                    <label>Naziv partnera / OTA kanala</label>
                                    <input
                                        type="text"
                                        placeholder="npr. Booking.com, Rentalcars, Lokalna Agencija..."
                                        value={newPartnerName}
                                        onChange={e => setNewPartnerName(e.target.value)}
                                        style={{ width: '100%' }}
                                    />
                                </div>
                                <button
                                    onClick={generateApiKey}
                                    disabled={creatingKey}
                                    style={{ padding: '0.75rem 1.5rem', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', border: 'none', borderRadius: '8px', color: 'white', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                >
                                    {creatingKey ? <Loader2 className="spin" size={18} /> : <Plus size={18} />}
                                    Generiraj Ključ
                                </button>
                            </div>
                            <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '1rem' }}>
                                <Settings size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                                Endpoint URL: <code>{typeof window !== 'undefined' ? `${window.location.origin}/api/v1/vehicles` : '/api/v1/vehicles'}</code>
                            </p>
                        </div>

                        {/* API Keys Table */}
                        <table>
                            <thead>
                                <tr>
                                    <th>Partner</th>
                                    <th>API Ključ</th>
                                    <th>Status</th>
                                    <th>Kreirano</th>
                                    <th>Akcije</th>
                                </tr>
                            </thead>
                            <tbody>
                                {apiKeys.map((k) => (
                                    <tr key={k.id}>
                                        <td><strong>{k.partner_name}</strong></td>
                                        <td>
                                            <code>{k.key}</code>
                                            <button
                                                onClick={() => copyToClipboard(k.key)}
                                                style={{ marginLeft: '0.5rem', padding: '0.25rem', background: 'transparent', border: 'none', color: '#888', cursor: 'pointer' }}
                                            >
                                                <Copy size={14} />
                                            </button>
                                        </td>
                                        <td>
                                            <span className={`status ${k.active ? 'status-confirmed' : 'status-cancelled'}`}>
                                                {k.active ? 'Aktivan' : 'Neaktivan'}
                                            </span>
                                        </td>
                                        <td>{new Date(k.created_at).toLocaleDateString('hr')}</td>
                                        <td>
                                            <button className="btn-delete" onClick={() => deleteApiKey(k.id)}>
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {apiKeys.length === 0 && (
                                    <tr>
                                        <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
                                            Nema generiranih API ključeva.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : null
                }
            </main >

            <style jsx>{`

        .admin { min-height: 100vh; background: #0f0f1a; color: white; }
        .admin-nav { display: flex; align-items: center; justify-content: space-between; padding: 1rem 2rem; background: rgba(26, 26, 46, 0.9); border-bottom: 1px solid rgba(255,255,255,0.1); }
        .nav-brand { font-size: 1.25rem; font-weight: 700; display: flex; align-items: center; gap: 0.75rem; }
        .master-badge { font-size: 0.7rem; background: #f5af19; color: black; padding: 0.2rem 0.6rem; border-radius: 20px; text-transform: uppercase; }
        .nav-tabs { display: flex; gap: 0.5rem; }
        .nav-tabs button { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.25rem; background: transparent; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #888; cursor: pointer; }
        .nav-tabs button.active { background: linear-gradient(135deg, #e94560 0%, #f5af19 100%); border-color: transparent; color: white; }
        .nav-user { display: flex; align-items: center; gap: 1rem; color: #888; font-size: 0.9rem; }
        .logout-btn { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.25rem; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #888; cursor: pointer; }

        .admin-content { padding: 2rem; }
        .loading { display: flex; justify-content: center; padding: 4rem; }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        
        .table-container { background: rgba(26,26,46,0.5); border-radius: 16px; padding: 1.5rem; }
        .generate-btn { display: flex; align-items: center; gap: 0.5rem; padding: 1rem 2rem; background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); border: none; border-radius: 12px; color: white; font-weight: 600; cursor: pointer; transition: all 0.3s ease; }
        .generate-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(30, 58, 138, 0.3); }
        .generate-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        
        /* Fleet Edit Styles */
        .fleet-edit { background: rgba(255, 255, 255, 0.03); border-radius: 12px; padding: 2rem; margin-bottom: 2rem; border: 1px solid rgba(255,255,255,0.1); }
        .fleet-edit-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
        .fleet-form-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
        .input-group { display: flex; flex-direction: column; gap: 0.5rem; }
        .input-group.full-width { grid-column: 1 / -1; }
        .input-group label { font-size: 0.85rem; color: #888; font-weight: 500; }
        .input-group input, .input-group select { padding: 0.75rem; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: white; }
        .input-group input:focus { border-color: #3b82f6; outline: none; }
        
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
        
        /* Fleet Management */
        .fleet-edit { background: rgba(255,255,255,0.03); border-radius: 16px; padding: 2rem; }
        .fleet-edit-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .fleet-edit-header h3 { font-size: 1.25rem; color: white; }
        .fleet-form-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
        .fleet-form-grid .input-group input, .fleet-form-grid .input-group select { padding: 0.75rem; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: white; font-size: 0.9rem; width: 100%; }
        .fleet-form-grid .input-group input:focus, .fleet-form-grid .input-group select:focus { outline: none; border-color: #e94560; }
        @media (max-width: 1024px) { .fleet-form-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 768px) { .fleet-form-grid { grid-template-columns: 1fr; } }
      `}</style>

        </div >
    )
}
