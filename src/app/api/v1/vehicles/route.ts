import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
    // 1. Check API Key
    const apiKey = request.headers.get('x-api-key')

    if (!apiKey) {
        return NextResponse.json(
            { error: 'API Key is missing' },
            { status: 401 }
        )
    }

    // 2. Validate API Key against database
    const { data: keyData, error: keyError } = await supabase
        .from('api_keys')
        .select('*')
        .eq('key', apiKey)
        .eq('active', true)
        .single()

    if (keyError || !keyData) {
        return NextResponse.json(
            { error: 'Invalid or inactive API Key' },
            { status: 403 }
        )
    }

    // 3. Fetch Vehicles
    const { data: vehicles, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('*')
        .eq('available', true)

    if (vehiclesError) {
        return NextResponse.json(
            { error: 'Failed to fetch vehicles' },
            { status: 500 }
        )
    }

    // 4. Format Output (Return only relevant public fields)
    const formattedVehicles = vehicles.map(v => ({
        id: v.id,
        name: v.name,
        category: v.category,
        image_url: v.image_url,
        price_per_day: v.price_per_day,
        specs: {
            seats: v.seats,
            transmission: v.transmission,
            fuel: v.fuel_type
        },
        features: v.features,
        available: v.available
    }))

    return NextResponse.json({
        partner: keyData.partner_name,
        timestamp: new Date().toISOString(),
        count: formattedVehicles.length,
        vehicles: formattedVehicles
    })
}
