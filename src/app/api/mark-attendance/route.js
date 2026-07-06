import { createClient } from '@supabase/supabase-js'

export async function POST(request) {
  try {
    const { qr_data } = await request.json()
    if (!qr_data) {
      return Response.json({ error: 'qr_data is required' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !serviceKey) {
      return Response.json({ error: 'Server config error' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, serviceKey)

    const { data: reg, error: findError } = await supabase
      .from('registrations')
      .select('id, name, email, section, roll_no, qr_data')
      .eq('qr_data', qr_data)
      .single()

    if (findError || !reg) {
      return Response.json({ error: 'Invalid QR code' }, { status: 404 })
    }

    const { data: existing } = await supabase
      .from('attendance')
      .select('id')
      .eq('registration_id', reg.id)
      .single()

    if (existing) {
      return Response.json({ error: 'Attendance already marked' }, { status: 409 })
    }

    const { error: insertError } = await supabase.from('attendance').insert({
      registration_id: reg.id,
      verified_by: 'admin',
    })

    if (insertError) {
      return Response.json({ error: insertError.message }, { status: 500 })
    }

    return Response.json({
      success: true,
      registration: {
        id: reg.id,
        name: reg.name,
        email: reg.email,
        section: reg.section,
        roll_no: reg.roll_no,
      },
    })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
