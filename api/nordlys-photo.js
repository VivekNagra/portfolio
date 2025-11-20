import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Method Not Allowed' })
  const SECRET = process.env.NORDLYS_SECRET
  if (!SECRET) return res.status(500).json({ ok: false, error: 'Server not configured' })
  const token = readCookie(req.headers.cookie || '', 'nla')
  if (!verify(token, SECRET)) return res.status(401).json({ ok: false, error: 'Unauthorized' })

  const id = String(req.query?.id || '').replace(/[^0-9a-zA-Z_-]/g, '')
  if (!id) return res.status(400).json({ ok: false, error: 'Missing id' })

  // Allowed extensions to try in order
  const exts = ['.jpg', '.jpeg', '.png', '.webp']
  let found = null
  for (const ext of exts) {
    const candidate = path.join(process.cwd(), 'api', '_nordlys_assets', `${id}${ext}`)
    if (fs.existsSync(candidate)) { found = candidate; break }
  }
  if (!found) return res.status(404).json({ ok: false, error: 'Not found' })

  try {
    const ext = path.extname(found).toLowerCase()
    const ct = contentType(ext)
    res.setHeader('Content-Type', ct)
    res.setHeader('Cache-Control', 'private, max-age=0, no-store')
    fs.createReadStream(found).pipe(res)
  } catch {
    return res.status(500).json({ ok: false, error: 'Failed to read image' })
  }
}

function contentType(ext) {
  switch (ext) {
    case '.jpg':
    case '.jpeg': return 'image/jpeg'
    case '.png': return 'image/png'
    case '.webp': return 'image/webp'
    default: return 'application/octet-stream'
  }
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


