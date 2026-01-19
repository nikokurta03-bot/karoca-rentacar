import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    let query = supabase
        .from('vehicles')
        .select('*')
        .eq('available', true)
        .order('price_per_day', { ascending: true })

    if (category && category !== 'Svi') {
        query = query.eq('category', category)
    }

    const { data, error } = await query

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}
