export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method Not Allowed' })
  // Expire cookie
  res.setHeader('Set-Cookie', 'nla=; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=0')
  return res.status(200).json({ ok: true })
}


