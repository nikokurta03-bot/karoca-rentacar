import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { sendBookingConfirmation } from '@/lib/email'

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
            total_price,
            selected_extras,
            extra_notes,
            deposit_confirmed
        } = body

        // Validate required fields
        if (!vehicle_id || !customer_name || !customer_email || !pickup_location || !pickup_date || !return_date) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Get vehicle name for email
        const { data: vehicle } = await supabase
            .from('vehicles')
            .select('name')
            .eq('id', vehicle_id)
            .single()

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
                selected_extras: selected_extras || [],
                extra_notes: extra_notes || '',
                deposit_confirmed: deposit_confirmed || false,
                status: 'pending'
            }])
            .select()
            .single()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // Send confirmation email (don't block on failure)
        try {
            await sendBookingConfirmation({
                customerName: customer_name,
                customerEmail: customer_email,
                vehicleName: vehicle?.name || 'Vozilo',
                pickupDate: pickup_date,
                returnDate: return_date,
                pickupLocation: pickup_location,
                totalPrice: total_price,
                selectedExtras: selected_extras
            })
        } catch (emailError) {
            console.error('Failed to send confirmation email:', emailError)
            // Don't fail the booking if email fails
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
