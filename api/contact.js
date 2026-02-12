// Vercel Serverless Function: /api/contact
// Sends email via Resend. Configure env vars in Vercel:
// RESEND_API_KEY, CONTACT_TO_EMAIL (destination)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' })
  }

  try {
    // Ensure JSON body in case of missing middleware
    let body = req.body
    if (!body || typeof body !== 'object') {
      const text = await readReqBody(req)
      try { body = JSON.parse(text) } catch { body = {} }
    }

    const { name, email, message } = body || {}

    if (!name || !email || !message) {
      return res.status(400).json({ ok: false, error: 'Missing required fields' })
    }

    // Basic validation
    const normalizedEmail = String(email).trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({ ok: false, error: 'Invalid email', fieldErrors: { email: 'Please enter a valid email.' } })
    }
    if (String(name).trim().length < 2) {
      return res.status(400).json({ ok: false, error: 'Invalid name', fieldErrors: { name: 'Name must be at least 2 characters.' } })
    }
    if (String(message).trim().length < 10) {
      return res.status(400).json({ ok: false, error: 'Message too short', fieldErrors: { message: 'Message must be at least 10 characters.' } })
    }

    const RESEND_API_KEY = process.env.RESEND_API_KEY
    const CONTACT_TO_EMAIL = process.env.CONTACT_TO_EMAIL || process.env.TO_EMAIL
    const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'

    if (!RESEND_API_KEY || !CONTACT_TO_EMAIL) {
      return res.status(500).json({ ok: false, error: 'Server not configured' })
    }

    const subject = `New portfolio message from ${name}`
    const html = `
      <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; line-height: 1.6;">
        <h2 style="margin: 0 0 8px;">New message</h2>
        <p style="margin: 0 0 8px;"><strong>From:</strong> ${escapeHtml(name)} &lt;${escapeHtml(normalizedEmail)}&gt;</p>
        <p style="white-space: pre-wrap; margin: 16px 0 0;">${escapeHtml(message)}</p>
      </div>
    `

    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: RESEND_FROM_EMAIL,
        to: CONTACT_TO_EMAIL,
        subject,
        html,
      }),
    })

    if (!resp.ok) {
      const text = await resp.text()
      return res.status(502).json({ ok: false, error: 'Email provider error', details: text })
    }

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('contact api error', err)
    return res.status(500).json({ ok: false, error: 'Unexpected error' })
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function readReqBody(req) {
  return new Promise((resolve) => {
    let data = ''
    req.on('data', chunk => { data += chunk })
    req.on('end', () => resolve(data))
  })
}


