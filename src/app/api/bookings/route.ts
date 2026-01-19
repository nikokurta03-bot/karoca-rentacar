import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
    try {
        const body = await request.json()

        const {
            vehicle_id,
            customer_name,
            customer_email,
            customer_phone,
            pickup_location,
            pickup_date,
            return_date,
            total_price
        } = body

        // Validate required fields
        if (!vehicle_id || !customer_name || !customer_email || !pickup_location || !pickup_date || !return_date) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        const { data, error } = await supabase
            .from('bookings')
            .insert([{
                vehicle_id,
                customer_name,
                customer_email,
                customer_phone,
                pickup_location,
                pickup_date,
                return_date,
                total_price,
                status: 'pending'
            }])
            .select()
            .single()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({
            message: 'Booking created successfully',
            booking: data
        }, { status: 201 })

    } catch (error) {
        return NextResponse.json(
            { error: 'Invalid request body' },
            { status: 400 }
        )
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
        return NextResponse.json(
            { error: 'Email is required' },
            { status: 400 }
        )
    }

    const { data, error } = await supabase
        .from('bookings')
        .select(`
      *,
      vehicle:vehicles(name, image_url)
    `)
        .eq('customer_email', email)
        .order('created_at', { ascending: false })

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}
