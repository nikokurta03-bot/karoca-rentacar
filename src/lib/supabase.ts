import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for the database
export interface Vehicle {
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
    created_at: string
    // Management fields
    mileage: number
    registration_expiry: string
    kasko_expiry: string
    last_service_date: string
    tire_type: 'Ljetne' | 'Zimske'
    tire_age: number
    color: string
    cleanliness: 'Oprano' | 'Neoprano'
    vehicle_status: 'Spreman' | 'U najmu' | 'Servis'
    license_plate: string
}

export interface Booking {
    id: string
    vehicle_id: string
    customer_name: string
    customer_email: string
    customer_phone: string
    pickup_location: string
    pickup_date: string
    return_date: string
    total_price: number
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
    created_at: string
}

export interface ContactMessage {
    id: string
    name: string
    email: string
    message: string
    created_at: string
}
