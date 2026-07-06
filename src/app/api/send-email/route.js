import { createClient } from '@supabase/supabase-js'

export async function POST(request) {
  try {
    const { registration_id, qr_data, name, email, section, roll_no } = await request.json()

    if (!registration_id || !qr_data || !email) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const BREVO_API_KEY = process.env.BREVO_API_KEY
    if (!BREVO_API_KEY) {
      return Response.json({ error: 'BREVO_API_KEY not configured in .env' }, { status: 500 })
    }

    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qr_data)}`

    const emailHtml = `
      <html>
        <body style="font-family:Arial,sans-serif;padding:24px;max-width:600px;margin:0 auto;">
          <h2>Farewell 2026 - Registration Confirmed</h2>
          <p>Hi <strong>${name}</strong>,</p>
          <p>Your payment has been verified. Here is your unique QR code:</p>
          <div style="text-align:center;margin:24px 0;">
            <img src="${qrImageUrl}" alt="QR Code" style="width:200px;height:200px;" />
          </div>
          <table style="border-collapse:collapse;width:100%;">
            <tr><td style="padding:8px;border:1px solid #ddd;">Name</td><td style="padding:8px;border:1px solid #ddd;">${name}</td></tr>
            <tr><td style="padding:8px;border:1px solid #ddd;">Section</td><td style="padding:8px;border:1px solid #ddd;">${section}</td></tr>
            <tr><td style="padding:8px;border:1px solid #ddd;">Roll No</td><td style="padding:8px;border:1px solid #ddd;">${roll_no}</td></tr>
          </table>
          <p style="margin-top:24px;">Show this QR at the event entrance.</p>
        </body>
      </html>`

    const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { name: 'Farewell 2026', email: process.env.BREVO_SENDER_EMAIL || 'noreply@farewell2026.com' },
        to: [{ email, name }],
        subject: 'Farewell 2026 - Your QR Code is Ready!',
        htmlContent: emailHtml,
      }),
    })

    if (!brevoRes.ok) {
      const err = await brevoRes.text()
      console.error('Brevo error:', brevoRes.status, err)
      return Response.json({ error: `Brevo API (${brevoRes.status}): ${err}` }, { status: 500 })
    }

    return Response.json({ success: true, email })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
