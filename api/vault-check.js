// Vercel Serverless Function: /api/vault-check
// POST { password } -> { ok: true } or 401
import crypto from 'node:crypto'

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' })
  }

  const VAULT_PASSWORD = process.env.VAULT_PASSWORD
  if (!VAULT_PASSWORD) {
    return res.status(500).json({ ok: false, error: 'Vault not configured' })
  }

  let body = req.body
  if (!body || typeof body !== 'object') {
    const text = await readReqBody(req)
    try { body = JSON.parse(text) } catch { body = {} }
  }

  const password = String(body?.password ?? '')

  const ok = timingSafeEqualStr(password, VAULT_PASSWORD)
  if (!ok) {
    // Small fixed delay to reduce brute-force speed (best-effort)
    await sleep(250)
    return res.status(401).json({ ok: false })
  }

  return res.status(200).json({ ok: true })
}

function timingSafeEqualStr(a, b) {
  const ab = Buffer.from(String(a), 'utf8')
  const bb = Buffer.from(String(b), 'utf8')
  if (ab.length !== bb.length) {
    const paddedA = Buffer.concat([ab, Buffer.alloc(Math.max(0, bb.length - ab.length))])
    const paddedB = Buffer.concat([bb, Buffer.alloc(Math.max(0, ab.length - bb.length))])
    return crypto.timingSafeEqual(paddedA, paddedB) && false
  }
  return crypto.timingSafeEqual(ab, bb)
}

function readReqBody(req) {
  return new Promise((resolve) => {
    let data = ''
    req.on('data', (chunk) => { data += chunk })
    req.on('end', () => resolve(data))
  })
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

