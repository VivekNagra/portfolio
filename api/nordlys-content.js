import crypto from 'node:crypto'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Method Not Allowed' })
  const SECRET = process.env.NORDLYS_SECRET
  if (!SECRET) return res.status(500).json({ ok: false, error: 'Server not configured' })
  const token = readCookie(req.headers.cookie || '', 'nla')
  if (!verify(token, SECRET)) return res.status(401).json({ ok: false, error: 'Unauthorized' })
  // Return protected content (keep sensitive data here, not in client bundle)
  return res.status(200).json({ ok: true, data: {
    title: 'Nordlys',
    message: 'Protected content placeholder. Replace with real data or render server-side.',
  }})
}

function readCookie(header, name) {
  const m = header.split(/; */).find(c => c.startsWith(name + '='))
  return m ? decodeURIComponent(m.split('=').slice(1).join('=')) : ''
}

function verify(token, secret) {
  if (!token) return false
  const [data, sig] = token.split('.')
  if (!data || !sig) return false
  const expected = crypto.createHmac('sha256', secret).update(data).digest('base64url')
  try {
    const okSig = crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
    if (!okSig) return false
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'))
    if (!payload || typeof payload.exp !== 'number') return false
    if (payload.exp < Math.floor(Date.now() / 1000)) return false
    return true
  } catch { return false }
}


