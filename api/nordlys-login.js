// POST /api/nordlys-login
// Body: { password: string }
// On success: sets HttpOnly cookie 'nla' (signed) and returns { ok: true }

import crypto from 'node:crypto'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' })
  }
  try {
    const { password, redirect } = await readJson(req)
    const PW = process.env.NORDLYS_PASSWORD
    const SECRET = process.env.NORDLYS_SECRET
    if (!PW || !SECRET) {
      return res.status(500).json({ ok: false, error: 'Server not configured' })
    }
    if (!password || password !== PW) {
      await sleep(300) // small timing blur
      return res.status(401).json({ ok: false, error: 'Invalid password' })
    }
    const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 // 24h
    const payload = { exp, v: 1 }
    const token = sign(payload, SECRET)
    setSessionCookie(res, token)
    return res.status(200).json({ ok: true, redirect: typeof redirect === 'string' ? redirect : '/nordlys' })
  } catch {
    return res.status(400).json({ ok: false, error: 'Bad request' })
  }
}

function sign(payload, secret) {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const sig = crypto.createHmac('sha256', secret).update(data).digest('base64url')
  return `${data}.${sig}`
}

function setSessionCookie(res, token) {
  const maxAge = 60 * 60 * 24 // 24h
  const cookie = [
    `nla=${token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Secure',
    `Max-Age=${maxAge}`,
  ].join('; ')
  res.setHeader('Set-Cookie', cookie)
}

function readJson(req) {
  return new Promise((resolve) => {
    let body = ''
    req.on('data', chunk => { body += chunk })
    req.on('end', () => {
      try { resolve(JSON.parse(body || '{}')) } catch { resolve({}) }
    })
  })
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }


