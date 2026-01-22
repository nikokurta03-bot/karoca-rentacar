import { NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const testEmail = searchParams.get('email')

    if (!testEmail) {
        return NextResponse.json({
            error: 'Dodaj ?email=tvoj@email.com u URL'
        }, { status: 400 })
    }

    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
        return NextResponse.json({
            error: 'RESEND_API_KEY nije konfiguriran',
            hint: 'Dodaj RESEND_API_KEY u .env.local'
        }, { status: 500 })
    }

    const resend = new Resend(apiKey)

    try {
        const { data, error } = await resend.emails.send({
            from: 'Karoca Test <onboarding@resend.dev>',
            to: testEmail,
            subject: 'Test email - Karoca Rent A Car',
            html: '<h1>Test email radi! ✅</h1><p>Ako vidiš ovo, email sustav funkcionira.</p>'
        })

        if (error) {
            return NextResponse.json({
                success: false,
                error: error,
                message: 'Resend je vratio grešku'
            }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            message: `Email poslan na ${testEmail}`,
            emailId: data?.id
        })
    } catch (err) {
        return NextResponse.json({
            success: false,
            error: String(err),
            message: 'Greška pri slanju emaila'
        }, { status: 500 })
    }
}
