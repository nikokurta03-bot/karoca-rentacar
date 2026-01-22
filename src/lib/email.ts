import { Resend } from 'resend'

// Lazy initialization to avoid build errors when API key is not set
function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('RESEND_API_KEY not configured - emails will not be sent')
    return null
  }
  return new Resend(apiKey)
}

interface BookingEmailData {
  customerName: string
  customerEmail: string
  vehicleName: string
  pickupDate: string
  returnDate: string
  pickupLocation: string
  totalPrice: number
  selectedExtras?: string[]
}

export async function sendBookingConfirmation(data: BookingEmailData) {
  const {
    customerName,
    customerEmail,
    vehicleName,
    pickupDate,
    returnDate,
    pickupLocation,
    totalPrice,
    selectedExtras = []
  } = data

  const extrasText = selectedExtras.length > 0
    ? selectedExtras.join(', ')
    : 'Bez dodataka'

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Potvrda rezervacije - Karoca Rent A Car</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #0b1d3d 0%, #162a4d 100%); padding: 40px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🚗 Karoca Rent A Car</h1>
                  <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0 0; font-size: 16px;">Potvrda rezervacije</p>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px;">
                  <h2 style="color: #0b1d3d; margin: 0 0 20px 0;">Poštovani ${customerName},</h2>
                  <p style="color: #666; line-height: 1.6; margin: 0 0 30px 0;">
                    Hvala vam na rezervaciji! Vaša rezervacija je uspješno zaprimljena i uskoro ćemo vas kontaktirati za potvrdu detalja.
                  </p>
                  
                  <!-- Booking Details -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 12px; padding: 24px;">
                    <tr>
                      <td style="padding: 24px;">
                        <h3 style="color: #0b1d3d; margin: 0 0 20px 0; font-size: 18px;">📋 Detalji rezervacije</h3>
                        
                        <table width="100%" cellpadding="8" cellspacing="0">
                          <tr>
                            <td style="color: #666; width: 40%;">Vozilo:</td>
                            <td style="color: #0b1d3d; font-weight: 600;">${vehicleName}</td>
                          </tr>
                          <tr>
                            <td style="color: #666;">Preuzimanje:</td>
                            <td style="color: #0b1d3d; font-weight: 600;">${pickupDate}</td>
                          </tr>
                          <tr>
                            <td style="color: #666;">Povrat:</td>
                            <td style="color: #0b1d3d; font-weight: 600;">${returnDate}</td>
                          </tr>
                          <tr>
                            <td style="color: #666;">Lokacija:</td>
                            <td style="color: #0b1d3d; font-weight: 600;">${pickupLocation}</td>
                          </tr>
                          <tr>
                            <td style="color: #666;">Dodaci:</td>
                            <td style="color: #0b1d3d;">${extrasText}</td>
                          </tr>
                        </table>
                        
                        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                        
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="color: #0b1d3d; font-size: 18px; font-weight: 700;">Ukupna cijena:</td>
                            <td style="color: #22c55e; font-size: 24px; font-weight: 700; text-align: right;">€${totalPrice.toFixed(2)}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Info Box -->
                  <div style="background-color: #fef3cd; border-left: 4px solid #f5af19; padding: 16px; margin-top: 30px; border-radius: 0 8px 8px 0;">
                    <strong style="color: #856404;">ℹ️ Napomena o depozitu:</strong>
                    <p style="color: #856404; margin: 8px 0 0 0; font-size: 14px;">
                      Sigurnosni polog od 700€ se autorizira na kartici ili ostavlja u gotovini prilikom preuzimanja vozila.
                    </p>
                  </div>
                  
                  <!-- CTA -->
                  <div style="text-align: center; margin-top: 40px;">
                    <p style="color: #666; margin: 0 0 20px 0;">Imate pitanja? Slobodno nas kontaktirajte:</p>
                    <a href="tel:+385991655885" style="display: inline-block; background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600;">📞 +385 99 165 5885</a>
                  </div>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f8fafc; padding: 30px; text-align: center;">
                  <p style="color: #666; margin: 0; font-size: 14px;">Karoca Rent A Car</p>
                  <p style="color: #999; margin: 5px 0 0 0; font-size: 12px;">Obala kneza Branimira 1, 23000 Zadar</p>
                  <p style="color: #999; margin: 5px 0 0 0; font-size: 12px;">info@karoca.hr | +385 99 165 5885</p>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `

  const resend = getResendClient()
  if (!resend) {
    return { success: false, error: 'Email service not configured' }
  }

  try {
    const { data: emailData, error } = await resend.emails.send({
      from: 'Karoca Rent A Car <onboarding@resend.dev>',
      to: customerEmail,
      subject: `Potvrda rezervacije - ${vehicleName}`,
      html: emailHtml,
    })

    if (error) {
      console.error('Email send error:', error)
      return { success: false, error }
    }

    return { success: true, data: emailData }
  } catch (error) {
    console.error('Email send exception:', error)
    return { success: false, error }
  }
}
