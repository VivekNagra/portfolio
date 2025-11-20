import crypto from 'node:crypto'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Method Not Allowed' })
  const SECRET = process.env.NORDLYS_SECRET
  if (!SECRET) return res.status(500).json({ ok: false, error: 'Server not configured' })
  const token = readCookie(req.headers.cookie || '', 'nla')
  if (!verify(token, SECRET)) return res.status(401).json({ ok: false, error: 'Unauthorized' })
  // Return protected content meta (keep sensitive data here, not in client bundle)
  return res.status(200).json({
    ok: true,
    data: {
      title: 'To år med os',
      subtitle: 'For evigt taknemmelig for dig.',
      hero: {
        heading: 'To år, min elskede',
        body: 'To år med grin, vækst og utallige små øjeblikke, der betyder alting. Tak fordi du vælger mig—hver dag, igen og igen.',
      },
      timeline: [
        { date: 'År 1', text: 'Fra fremmede til bedste venner—hver dag føltes ny.' },
        { date: 'År 2', text: 'Vi lærte, elskede og byggede et liv, der føles som hjem.' },
        { date: 'I dag', text: 'Forlovede—og spændte på alle dagene, der kommer.' },
      ],
      gallery: [
        // Add more ids as you add photos to /api/_nordlys_assets
        { id: '01', caption: 'Os to—smil som solen.' },
        { id: '02', caption: 'Dig, der stjal mit hjerte (igen).' },
        { id: '03', caption: 'Et stille øjeblik, jeg aldrig glemmer.' },
      ],
    },
  })
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


