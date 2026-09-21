// Vercel Serverless Function: /api/contact
// Sends email via Resend. Configure env vars in Vercel:
// RESEND_API_KEY, CONTACT_TO_EMAIL (destination)

const MAX_LENGTHS = { name: 100, email: 254, message: 2000 }

// Reject oversized bodies before parsing. The fields above cap out well under
// this, so anything larger is either malformed or abusive.
const MAX_BODY_BYTES = 16 * 1024

// Best-effort abuse throttling. Serverless instances are ephemeral and Vercel
// may run several concurrently, so this bounds a single instance rather than
// the deployment as a whole. It stops casual flooding; move the counter to
// Vercel KV / Upstash if you ever need a hard guarantee.
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000
const RATE_LIMIT_MAX = 5
const rateLimitHits = new Map()

const ALLOWED_ORIGINS = [
  'https://viveknagra.dev',
  'https://www.viveknagra.dev',
]

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' })
  }

  if (!isAllowedOrigin(req.headers.origin)) {
    return res.status(403).json({ ok: false, error: 'Forbidden' })
  }

  const rateLimit = checkRateLimit(getClientIp(req))
  if (!rateLimit.allowed) {
    res.setHeader('Retry-After', String(rateLimit.retryAfterSeconds))
    return res.status(429).json({
      ok: false,
      error: 'Too many messages sent. Please try again later.',
    })
  }

  try {
    // Ensure JSON body in case of missing middleware
    let body = req.body
    if (!body || typeof body !== 'object') {
      let text
      try {
        text = await readReqBody(req, MAX_BODY_BYTES)
      } catch {
        return res.status(413).json({ ok: false, error: 'Payload too large' })
      }
      try { body = JSON.parse(text) } catch { body = {} }
    }

    const { name, email, message } = body || {}

    if (!name || !email || !message) {
      return res.status(400).json({ ok: false, error: 'Missing required fields' })
    }

    // Basic validation
    const normalizedName = String(name).trim()
    const normalizedEmail = String(email).trim()
    const normalizedMessage = String(message).trim()

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({ ok: false, error: 'Invalid email', fieldErrors: { email: 'Please enter a valid email.' } })
    }
    if (normalizedEmail.length > MAX_LENGTHS.email) {
      return res.status(400).json({ ok: false, error: 'Invalid email', fieldErrors: { email: 'Email is too long.' } })
    }
    if (normalizedName.length < 2) {
      return res.status(400).json({ ok: false, error: 'Invalid name', fieldErrors: { name: 'Name must be at least 2 characters.' } })
    }
    if (normalizedName.length > MAX_LENGTHS.name) {
      return res.status(400).json({ ok: false, error: 'Invalid name', fieldErrors: { name: `Name is too long (${MAX_LENGTHS.name} max).` } })
    }
    if (normalizedMessage.length < 10) {
      return res.status(400).json({ ok: false, error: 'Message too short', fieldErrors: { message: 'Message must be at least 10 characters.' } })
    }
    if (normalizedMessage.length > MAX_LENGTHS.message) {
      return res.status(400).json({ ok: false, error: 'Message too long', fieldErrors: { message: `Message is too long (${MAX_LENGTHS.message} max).` } })
    }

    const RESEND_API_KEY = process.env.RESEND_API_KEY
    const CONTACT_TO_EMAIL = process.env.CONTACT_TO_EMAIL || process.env.TO_EMAIL
    const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'

    if (!RESEND_API_KEY || !CONTACT_TO_EMAIL) {
      return res.status(500).json({ ok: false, error: 'Server not configured' })
    }

    const subject = `New portfolio message from ${sanitizeHeader(normalizedName)}`
    const html = `
      <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; line-height: 1.6;">
        <h2 style="margin: 0 0 8px;">New message</h2>
        <p style="margin: 0 0 8px;"><strong>From:</strong> ${escapeHtml(normalizedName)} &lt;${escapeHtml(normalizedEmail)}&gt;</p>
        <p style="white-space: pre-wrap; margin: 16px 0 0;">${escapeHtml(normalizedMessage)}</p>
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
      // Log the provider response server-side only; returning it would expose
      // details about the email configuration to anyone hitting the endpoint.
      const details = await resp.text().catch(() => '')
      console.error('resend error', resp.status, details)
      return res.status(502).json({ ok: false, error: 'Email provider error' })
    }

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('contact api error', err)
    return res.status(500).json({ ok: false, error: 'Unexpected error' })
  }
}

function isAllowedOrigin(origin) {
  // Non-browser clients omit Origin entirely; rate limiting still applies to them.
  if (!origin) return true
  try {
    const { hostname, protocol } = new URL(origin)
    if (hostname === 'localhost' || hostname === '127.0.0.1') return true
    if (protocol !== 'https:') return false
    if (ALLOWED_ORIGINS.includes(origin)) return true
    // Vercel preview deployments.
    return hostname.endsWith('.vercel.app')
  } catch {
    return false
  }
}

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim()
  }
  return req.headers['x-real-ip'] || req.socket?.remoteAddress || 'unknown'
}

function checkRateLimit(ip) {
  const now = Date.now()

  // Drop expired entries so the map can't grow unbounded on a warm instance.
  for (const [key, timestamps] of rateLimitHits) {
    const fresh = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW_MS)
    if (fresh.length === 0) rateLimitHits.delete(key)
    else rateLimitHits.set(key, fresh)
  }

  const hits = rateLimitHits.get(ip) || []
  if (hits.length >= RATE_LIMIT_MAX) {
    const retryAfterMs = RATE_LIMIT_WINDOW_MS - (now - hits[0])
    return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000)) }
  }

  hits.push(now)
  rateLimitHits.set(ip, hits)
  return { allowed: true }
}

// Subject lines are a header field, not HTML. Strip anything control-like so a
// crafted name can't smuggle line breaks into the header.
function sanitizeHeader(str) {
  return String(str).replace(/[\r\n\t]+/g, ' ').replace(/[^\x20-\x7E\u00A0-\uFFFF]/g, '').trim()
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function readReqBody(req, limitBytes) {
  return new Promise((resolve, reject) => {
    let data = ''
    let size = 0
    req.on('data', chunk => {
      size += chunk.length
      if (size > limitBytes) {
        reject(new Error('PAYLOAD_TOO_LARGE'))
        req.destroy()
        return
      }
      data += chunk
    })
    req.on('end', () => resolve(data))
    req.on('error', reject)
  })
}
