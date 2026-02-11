//
// Required Vercel env vars:
// - VAULT_PASSWORD
// - VAULT_SESSION_SECRET

import crypto from 'node:crypto'

const COOKIE_NAME = '__Host-vault'
const DEFAULT_MAX_AGE_SECONDS = 60 * 60 * 24 * 7 // 7 days

export default async function handler(req, res) {
  const VAULT_PASSWORD = process.env.VAULT_PASSWORD
  const VAULT_SESSION_SECRET = process.env.VAULT_SESSION_SECRET

  if (!VAULT_PASSWORD || !VAULT_SESSION_SECRET) {
    return res.status(500).send('Vault is not configured.')
  }

  setSecurityHeaders(res)

  // Logout: GET ?logout=1
  if (req.method === 'GET' && String(req.query?.logout || '') === '1') {
    clearCookie(res)
    return res.status(200).send(renderPasswordPage({ message: 'Logged out.' }))
  }

  if (req.method === 'GET') {
    const isAuthed = verifySessionCookie(req, VAULT_SESSION_SECRET)
    if (!isAuthed) {
      return res.status(200).send(renderPasswordPage({}))
    }
    return res.status(200).send(renderSecretPage(req))
  }

  if (req.method === 'POST') {
    const body = await readBody(req)
    const password = (body?.password ?? '').toString()

    // Constant-time compare (normalize to buffer)
    const ok = timingSafeEqualStr(password, VAULT_PASSWORD)
    if (!ok) {
      return res.status(401).send(renderPasswordPage({ error: 'Incorrect password.' }))
    }

    // Success: set signed session cookie and show secret page
    setSessionCookie(res, VAULT_SESSION_SECRET)
    return res.status(200).send(renderSecretPage(req))
  }

  return res.status(405).send('Method Not Allowed')
}

function setSecurityHeaders(res) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('Referrer-Policy', 'no-referrer')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin')
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin')
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'none'",
      "img-src 'self' data:",
      "style-src 'unsafe-inline'",
      "script-src 'none'",
      "base-uri 'none'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "connect-src 'none'",
    ].join('; ')
  )
}

function renderPasswordPage({ error = '', message = '' }) {
  const errHtml = error ? `<p class="msg err">${escapeHtml(error)}</p>` : ''
  const msgHtml = message ? `<p class="msg ok">${escapeHtml(message)}</p>` : ''
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Vault</title>
    <style>
      :root { color-scheme: dark; }
      body { margin: 0; min-height: 100vh; display: grid; place-items: center; font-family: ui-sans-serif, system-ui, Segoe UI, Roboto, Arial; background: #070A12; color: #E7EAF4; }
      .card { width: min(420px, calc(100vw - 32px)); border-radius: 16px; border: 1px solid rgba(255,255,255,.10); background: rgba(255,255,255,.04); box-shadow: 0 20px 80px rgba(0,0,0,.45); padding: 20px; }
      h1 { font-size: 18px; margin: 0 0 8px; letter-spacing: .3px; }
      p { margin: 0 0 14px; color: rgba(231,234,244,.8); font-size: 13px; line-height: 1.45; }
      label { display: block; font-size: 12px; margin: 0 0 8px; color: rgba(231,234,244,.85); }
      input { width: 100%; box-sizing: border-box; padding: 12px 12px; border-radius: 12px; border: 1px solid rgba(255,255,255,.12); background: rgba(255,255,255,.06); color: #E7EAF4; outline: none; }
      input:focus { border-color: rgba(120,140,255,.55); box-shadow: 0 0 0 4px rgba(120,140,255,.18); }
      button { margin-top: 12px; width: 100%; padding: 12px 12px; border-radius: 12px; border: 1px solid rgba(255,255,255,.12); background: linear-gradient(135deg, rgba(120,140,255,.95), rgba(76,210,255,.85)); color: #071018; font-weight: 800; letter-spacing: .2px; cursor: pointer; }
      button:hover { filter: brightness(1.05); }
      .msg { margin: 0 0 12px; padding: 10px 12px; border-radius: 12px; font-size: 13px; }
      .msg.err { background: rgba(255, 80, 80, .12); border: 1px solid rgba(255, 80, 80, .25); color: rgba(255, 200, 200, .95); }
      .msg.ok { background: rgba(80, 255, 160, .10); border: 1px solid rgba(80, 255, 160, .22); color: rgba(200, 255, 230, .95); }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>Enter password</h1>
      <p>This page is protected.</p>
      ${msgHtml}
      ${errHtml}
      <form method="POST" autocomplete="off">
        <label for="password">Password</label>
        <input id="password" name="password" type="password" required autofocus />
        <button type="submit">Unlock</button>
      </form>
    </div>
  </body>
</html>`
}

function renderSecretPage(req) {
  const logoutHref = `${getPathname(req)}?logout=1`

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Vault</title>
    <style>
      :root { color-scheme: dark; }
      body { margin: 0; min-height: 100vh; font-family: ui-sans-serif, system-ui, Segoe UI, Roboto, Arial; background: #070A12; color: #E7EAF4; }
      .wrap { max-width: 860px; margin: 0 auto; padding: 28px 18px; }
      .panel { border-radius: 16px; border: 1px solid rgba(255,255,255,.10); background: rgba(255,255,255,.04); box-shadow: 0 20px 80px rgba(0,0,0,.45); padding: 22px; }
      h1, h2, h3 { margin: 0 0 10px; }
      p, li { color: rgba(231,234,244,.82); line-height: 1.6; }
      code { padding: 2px 6px; border-radius: 8px; background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.10); }
      .top { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 12px; }
      a.btn { display: inline-flex; align-items: center; justify-content: center; padding: 10px 12px; border-radius: 12px; border: 1px solid rgba(255,255,255,.12); background: rgba(255,255,255,.06); color: rgba(231,234,244,.9); text-decoration: none; font-weight: 700; }
      a.btn:hover { background: rgba(255,255,255,.10); }
      .stamp { font-size: 12px; color: rgba(231,234,244,.55); }
      hr { border: none; border-top: 1px solid rgba(255,255,255,.10); margin: 14px 0; }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="panel">
        <div class="top">
          <div>
            <div class="stamp">Private area</div>
          </div>
          <a class="btn" href="${escapeHtml(logoutHref)}">Log out</a>
        </div>
        <hr />
        ${renderSecretContent()}
      </div>
    </div>
  </body>
</html>`
}

function renderSecretContent() {
    import { useState, useRef, useCallback } from "react";
    import { Button } from "@/components/ui/button";
    import FloatingHearts from "@/components/FloatingHearts";
    import Confetti from "@/components/Confetti";
    
    const noTexts = [
      "No 😢",
      "Are you sure? 🥺",
      "Think again! 💔",
      "Wrong button! 😤",
      "Not this one! 🙈",
      "Please? 🥹",
      "Pretty please? 🌹",
      "Fine, I give up 😭",
    ];
    
    const Index = () => {
      const [noCount, setNoCount] = useState(0);
      const [accepted, setAccepted] = useState(false);
      const [noPosition, setNoPosition] = useState<{ top?: string; left?: string }>({});
      const containerRef = useRef<HTMLDivElement>(null);
    
      const handleNoHover = useCallback(() => {
        if (noCount >= noTexts.length - 1) return;
        const container = containerRef.current;
        if (!container) return;
        const rect = container.getBoundingClientRect();
        // Keep button well within bounds for mobile
        const buttonWidth = 160;
        const buttonHeight = 50;
        const padding = 20;
        const top = padding + Math.random() * (rect.height - buttonHeight - padding * 2);
        const left = padding + Math.random() * (rect.width - buttonWidth - padding * 2);
        setNoPosition({ top: `${top}px`, left: `${left}px` });
        setNoCount((c) => Math.min(c + 1, noTexts.length - 1));
      }, [noCount]);
    
      const noButtonSize = Math.max(0.5, 1 - noCount * 0.06);
      const yesButtonSize = Math.min(1.6, 1 + noCount * 0.08);
    
      if (accepted) {
        return (
          <div className="flex min-h-screen flex-col items-center justify-center bg-background relative overflow-hidden px-4">
            <Confetti />
            <div
              className="text-center z-10"
              style={{ animation: "bounce-in 0.6s ease-out forwards" }}
            >
              <div className="text-7xl sm:text-8xl mb-6">💖</div>
              <h1 className="font-script text-5xl sm:text-7xl text-primary mb-4">
                Yay!!!
              </h1>
              <p className="font-script text-3xl sm:text-4xl text-primary/80 mb-2">
                Vivek & Manice forever! 💕
              </p>
              <p className="text-lg sm:text-xl text-muted-foreground mt-4">
                I knew you'd say yes 🥰
              </p>
              <div className="mt-6 rounded-2xl overflow-hidden shadow-lg" style={{ animation: "bounce-in 0.6s ease-out 0.4s both" }}>
                <img
                  src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcTJ5ZXRrOHhsMGx6Y2R0MnJ6OHJrcm1nNHF4a3BhYnU2MnRxdSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/M90mJvfWfd5mbUuULX/giphy.gif"
                  alt="Cute romantic celebration"
                  className="w-64 h-auto mx-auto"
                />
              </div>
              <div className="flex justify-center gap-2 mt-6 text-4xl">
                <span style={{ animation: "bounce-in 0.5s ease-out 0.5s both" }}>🌹</span>
                <span style={{ animation: "bounce-in 0.5s ease-out 0.7s both" }}>💘</span>
                <span style={{ animation: "bounce-in 0.5s ease-out 0.9s both" }}>🌹</span>
              </div>
              <Button
                variant="outline"
                onClick={() => { setAccepted(false); setNoCount(0); setNoPosition({}); }}
                className="mt-8 font-body rounded-full border-primary/30 text-muted-foreground"
              >
                ← Go back
              </Button>
            </div>
            <FloatingHearts />
          </div>
        );
      }
    
      return (
        <div
          ref={containerRef}
          className="flex min-h-screen flex-col items-center justify-center bg-background relative overflow-hidden px-4"
        >
          <FloatingHearts />
    
          <div className="z-10 text-center max-w-lg mx-auto">
            {/* Emoji art */}
            <div className="text-6xl sm:text-7xl mb-4" style={{ animation: "bounce-in 0.6s ease-out" }}>
              💘
            </div>
    
            {/* Intro message */}
            <p className="text-muted-foreground text-base sm:text-lg mb-2 font-body">
              Dear Manice,
            </p>
            <p className="text-muted-foreground text-sm sm:text-base mb-6 font-body leading-relaxed">
              Every moment with you feels like a dream. You make my world brighter,
              warmer, and so much more beautiful. So I have a very important question…
            </p>
    
            {/* The big question */}
            <h1 className="font-script text-4xl sm:text-5xl md:text-6xl text-primary mb-2 leading-tight">
              Manice,
            </h1>
            <h2 className="font-script text-3xl sm:text-4xl md:text-5xl text-primary/80 mb-8">
              Will You Be My Valentine?
            </h2>
    
            <p className="text-sm text-muted-foreground mb-8 font-body">— with all my love, Vivek 💕</p>
    
            {/* Buttons */}
            <div className="flex flex-col items-center gap-4">
              <Button
                onClick={() => setAccepted(true)}
                className="font-body font-bold text-lg px-8 py-6 rounded-full bg-primary text-primary-foreground shadow-lg transition-all duration-300"
                style={{
                  transform: `scale(${yesButtonSize})`,
                  animation: "pulse-glow 2s ease-in-out infinite",
                }}
              >
                Yes! 💖
              </Button>
    
              <Button
                variant="outline"
                onMouseEnter={handleNoHover}
                onTouchStart={handleNoHover}
                onClick={() => {
                  if (noCount < noTexts.length - 1) {
                    handleNoHover();
                  }
                }}
                className="font-body rounded-full border-primary/30 text-muted-foreground transition-all duration-300"
                style={{
                  transform: `scale(${noButtonSize})`,
                  ...(noPosition.top
                    ? { position: "absolute", top: noPosition.top, left: noPosition.left }
                    : {}),
                }}
              >
                {noTexts[noCount]}
              </Button>
            </div>
          </div>
        </div>
      );
    };
    
    export default Index;
    
  return `
    <h1>Secret page</h1>
    <p>Edit <code>api/vault.js</code> and replace the HTML inside <code>renderSecretContent()</code>.</p>
    <p>Keep it self-contained (no external scripts) unless you also loosen the CSP in <code>setSecurityHeaders()</code>.</p>
  `
}

function setSessionCookie(res, secret) {
  const now = Date.now()
  const maxAge = getMaxAgeSeconds()
  const exp = now + (maxAge * 1000)
  const payload = `${exp}`
  const sig = sign(payload, secret)
  const value = `${payload}.${sig}`

  // __Host- requires Secure; Path=/; no Domain attribute.
  const cookie = [
    `${COOKIE_NAME}=${value}`,
    'Path=/',
    `Max-Age=${maxAge}`,
    'HttpOnly',
    'Secure',
    'SameSite=Strict',
  ].join('; ')

  res.setHeader('Set-Cookie', cookie)
}

function clearCookie(res) {
  const cookie = [
    `${COOKIE_NAME}=`,
    'Path=/',
    'Max-Age=0',
    'HttpOnly',
    'Secure',
    'SameSite=Strict',
  ].join('; ')
  res.setHeader('Set-Cookie', cookie)
}

function verifySessionCookie(req, secret) {
  const raw = req.headers?.cookie || ''
  const cookies = parseCookies(raw)
  const value = cookies[COOKIE_NAME]
  if (!value) return false

  const [expStr, sig] = value.split('.')
  if (!expStr || !sig) return false

  const expMs = Number(expStr)
  if (!Number.isFinite(expMs)) return false
  if (Date.now() > expMs) return false

  const expected = sign(expStr, secret)
  return timingSafeEqualStr(sig, expected)
}

function sign(payload, secret) {
  return crypto.createHmac('sha256', secret).update(payload).digest('base64url')
}

function parseCookies(header) {
  const out = {}
  const parts = String(header).split(';')
  for (const p of parts) {
    const idx = p.indexOf('=')
    if (idx === -1) continue
    const k = p.slice(0, idx).trim()
    const v = p.slice(idx + 1).trim()
    if (!k) continue
    out[k] = v
  }
  return out
}

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body

  const text = await new Promise((resolve) => {
    let data = ''
    req.on('data', chunk => { data += chunk })
    req.on('end', () => resolve(data))
  })

  // Support x-www-form-urlencoded from the form
  if ((/^[^=]+=.*/.test(text) && text.includes('&')) || text.includes('=')) {
    return Object.fromEntries(new URLSearchParams(text))
  }

  try { return JSON.parse(text) } catch { return {} }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
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

function getMaxAgeSeconds() {
  const raw = process.env.VAULT_MAX_AGE_SECONDS
  const n = raw ? Number(raw) : NaN
  return Number.isFinite(n) && n > 60 ? Math.floor(n) : DEFAULT_MAX_AGE_SECONDS
}

function getPathname(req) {
  const rawUrl = req.url || '/'
  const idx = rawUrl.indexOf('?')
  return idx === -1 ? rawUrl : rawUrl.slice(0, idx)
}

