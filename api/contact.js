// Vercel Serverless Function: /api/contact
// Sends email via Resend. Configure env vars in Vercel:
// RESEND_API_KEY, CONTACT_TO_EMAIL (destination)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' })
  }

  try {
    const { name, email, message } = req.body || {}

    if (!name || !email || !message) {
      return res.status(400).json({ ok: false, error: 'Missing required fields' })
    }

    // Basic validation
    const normalizedEmail = String(email).trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({ ok: false, error: 'Invalid email' })
    }

    const RESEND_API_KEY = process.env.RESEND_API_KEY
    const CONTACT_TO_EMAIL = process.env.CONTACT_TO_EMAIL || process.env.TO_EMAIL

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
        from: 'onboarding@resend.dev',
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


