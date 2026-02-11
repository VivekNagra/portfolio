//
// Required Vercel env vars:
// - VAULT_PASSWORD
// - VAULT_SESSION_SECRET

import crypto from 'node:crypto'

const COOKIE_NAME = '__Host-vault'
const DEFAULT_MAX_AGE_SECONDS = 60 * 60 * 24 * 7 // 7 days

export default async function handler(req, res) {
  try {
    setSecurityHeaders(res)

    const VAULT_PASSWORD = process.env.VAULT_PASSWORD
    const VAULT_SESSION_SECRET = process.env.VAULT_SESSION_SECRET

    if (!VAULT_PASSWORD || !VAULT_SESSION_SECRET) {
      const missing = [
        !VAULT_PASSWORD ? 'VAULT_PASSWORD' : null,
        !VAULT_SESSION_SECRET ? 'VAULT_SESSION_SECRET' : null,
      ].filter(Boolean)
      console.error('[vault] misconfigured: missing env vars:', missing.join(', ') || '(unknown)')
      return res.status(500).send('Vault is not configured.')
    }

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
  } catch (err) {
    console.error('[vault] crashed:', err)
    return res.status(500).send('Internal Server Error')
  }
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
      "img-src 'self' data: https://media.giphy.com https://i.giphy.com",
      "style-src 'unsafe-inline' https://fonts.googleapis.com",
      // Needed for the secret page interactions (no external scripts are allowed).
      "script-src 'unsafe-inline'",
      "font-src https://fonts.gstatic.com",
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
    </style>
  </head>
  <body>
    ${renderSecretContent({ logoutHref: escapeHtml(logoutHref) })}
  </body>
</html>`
}

function renderSecretContent({ logoutHref }) {
  // Converted from your React version into self-contained HTML/CSS/JS (no React, no Tailwind).
  // Keep it self-contained: no external scripts; images are avoided to preserve strict CSP.
  return `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;600;700&display=swap');

      /* Shadcn-ish tokens */
      :root {
        --background: 0 0% 100%;
        --foreground: 240 10% 3.9%;
        --muted-foreground: 240 3.8% 46.1%;
        --primary: 346 77% 49%; /* rose */
        --primary-foreground: 0 0% 100%;
        --border: 240 5.9% 90%;
      }

      /* Page */
      body { background: hsl(var(--background)); color: hsl(var(--foreground)); }
      .val-root { position: relative; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px 16px; overflow: hidden; background: hsl(var(--background)); }
      .val-card { width: min(720px, calc(100vw - 32px)); border-radius: 18px; border: 1px solid hsl(var(--border)); background: hsl(var(--background)); box-shadow: 0 24px 90px rgba(0,0,0,.10); padding: 26px; text-align: center; position: relative; z-index: 2; }
      .val-muted { color: hsl(var(--muted-foreground)); }
      .val-title { margin: 6px 0 8px; font-size: clamp(34px, 5vw, 64px); letter-spacing: .2px; }
      .val-sub { margin: 0 0 18px; font-size: clamp(24px, 4vw, 46px); color: color-mix(in oklab, hsl(var(--primary)), black 15%); }
      .val-kicker { margin: 0 0 8px; font-size: 15px; }
      .val-par { margin: 0 auto 14px; max-width: 56ch; font-size: 15px; line-height: 1.6; }
      .val-sign { margin: 0 0 18px; font-size: 13px; }
      .font-script { font-family: 'Dancing Script', ui-serif, Georgia, serif; }
      .font-body { font-family: ui-sans-serif, system-ui, Segoe UI, Roboto, Arial; }

      /* Buttons */
      .btn-row { display: flex; flex-direction: column; align-items: center; gap: 14px; margin-top: 12px; position: relative; }
      .btn { appearance: none; border: 1px solid color-mix(in oklab, hsl(var(--primary)), transparent 70%); background: transparent; color: hsl(var(--muted-foreground)); border-radius: 999px; padding: 14px 22px; font-weight: 800; font-size: 18px; cursor: pointer; transition: transform .18s ease, background .18s ease, filter .18s ease; user-select: none; }
      .btn:hover { background: color-mix(in oklab, hsl(var(--primary)), transparent 92%); }
      .btn-primary { border-color: transparent; background: hsl(var(--primary)); color: hsl(var(--primary-foreground)); box-shadow: 0 18px 60px color-mix(in oklab, hsl(var(--primary)), transparent 70%); }
      .btn-primary:hover { filter: brightness(1.05); }
      .btn-ghost { font-weight: 800; font-size: 15px; padding: 10px 16px; }

      /* Top actions */
      .topbar { position: absolute; top: 14px; right: 14px; z-index: 3; display: flex; gap: 10px; align-items: center; }
      a.toplink { text-decoration: none; display: inline-flex; align-items: center; justify-content: center; border-radius: 999px; padding: 10px 12px; border: 1px solid hsl(var(--border)); background: hsl(var(--background)); color: hsl(var(--muted-foreground)); font-weight: 800; font-size: 13px; }
      a.toplink:hover { background: color-mix(in oklab, hsl(var(--primary)), transparent 95%); }

      /* Hearts */
      .heart { position: absolute; left: 50%; top: 110%; transform: translateX(-50%); font-size: 18px; opacity: 0; pointer-events: none; }
      @keyframes floatUp {
        0%   { transform: translate(-50%, 0) scale(.9); opacity: 0; }
        10%  { opacity: .85; }
        100% { transform: translate(calc(-50% + var(--drift)), -120vh) scale(1.25); opacity: 0; }
      }

      /* Confetti */
      .confetti { position: absolute; inset: 0; overflow: hidden; pointer-events: none; z-index: 1; }
      .confetti i { position: absolute; top: -16px; width: 10px; height: 14px; border-radius: 2px; transform: rotate(var(--rot)); background: hsl(var(--h), 95%, 60%); animation: confFall var(--dur) linear forwards; }
      @keyframes confFall {
        0% { transform: translateY(-20px) translateX(0) rotate(var(--rot)); opacity: 1; }
        100% { transform: translateY(110vh) translateX(var(--dx)) rotate(calc(var(--rot) + 720deg)); opacity: 0; }
      }

      /* Animations */
      @keyframes bounceIn {
        0% { transform: scale(.88); opacity: 0; }
        70% { transform: scale(1.04); opacity: 1; }
        100% { transform: scale(1); }
      }
      .bounce-in { animation: bounceIn .6s ease-out both; }

      @keyframes pulseGlow {
        0%, 100% { box-shadow: 0 18px 60px color-mix(in oklab, hsl(var(--primary)), transparent 72%); }
        50% { box-shadow: 0 26px 95px color-mix(in oklab, hsl(var(--primary)), transparent 60%); }
      }
      .pulse { animation: pulseGlow 2s ease-in-out infinite; }

      /* Responsiveness */
      @media (min-width: 640px) {
        .btn-row { flex-direction: column; }
      }
    </style>

    <div class="val-root" id="val-root">
      <div class="topbar">
        <a class="toplink" href="${logoutHref}">Log out</a>
      </div>

      <div class="confetti" id="confetti" aria-hidden="true"></div>

      <!-- QUESTION VIEW -->
      <div class="val-card bounce-in" id="view-question">
        <div style="font-size: 56px; margin-bottom: 8px;">💘</div>
        <p class="val-muted val-kicker font-body">Dear Manice,</p>
        <p class="val-muted val-par font-body">
          Every moment with you feels like a dream. You make my world brighter,
          warmer, and so much more beautiful. So I have a very important question…
        </p>

        <h1 class="val-title font-script" style="color: hsl(var(--primary));">Manice,</h1>
        <h2 class="val-sub font-script">Will You Be My Valentine?</h2>

        <p class="val-muted val-sign font-body">— with all my love, Vivek 💕</p>

        <div class="btn-row" id="btn-area">
          <button class="btn btn-primary pulse font-body" id="btn-yes" type="button">Yes! 💖</button>
          <button class="btn" id="btn-no" type="button">No 😢</button>
        </div>
      </div>

      <!-- ACCEPTED VIEW -->
      <div class="val-card bounce-in" id="view-accepted" style="display:none;">
        <div style="font-size: 72px; margin-bottom: 10px;">💖</div>
        <h1 class="val-title font-script" style="margin-top:0; color: hsl(var(--primary));">Yay!!!</h1>
        <p class="val-muted font-script" style="font-size: clamp(20px, 3.2vw, 34px); margin: 0 0 6px; color: color-mix(in oklab, hsl(var(--primary)), black 8%);">Vivek &amp; Manice forever! 💕</p>
        <p class="val-muted font-body" style="font-size: 18px; margin: 12px 0 0;">I knew you'd say yes 🥰</p>
        <div class="bounce-in" style="margin-top: 18px; animation-delay:.25s;">
          <div style="margin: 0 auto; width: 256px; border-radius: 16px; overflow: hidden; box-shadow: 0 18px 60px rgba(0,0,0,.12); border: 1px solid hsl(var(--border));">
            <img
              src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcTJ5ZXRrOHhsMGx6Y2R0MnJ6OHJrcm1nNHF4a3BhYnU2MnRxdSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/M90mJvfWfd5mbUuULX/giphy.gif"
              alt="Cute romantic celebration"
              style="display:block; width: 256px; height: auto;"
            />
          </div>
        </div>
        <div style="display:flex; justify-content:center; gap: 10px; margin-top: 18px; font-size: 40px;">
          <span class="bounce-in" style="animation-delay:.2s;">🌹</span>
          <span class="bounce-in" style="animation-delay:.35s;">💘</span>
          <span class="bounce-in" style="animation-delay:.5s;">🌹</span>
        </div>
        <button class="btn btn-ghost font-body" id="btn-back" type="button" style="margin-top: 18px;">← Go back</button>
      </div>
    </div>

    <script>
      (() => {
        const noTexts = ${JSON.stringify([
          "No 😢",
          "Are you sure? 🥺",
          "Think again! 💔",
          "Wrong button! 😤",
          "Not this one! 🙈",
          "Please? 🥹",
          "Pretty please? 🌹",
          "Fine, I give up 😭",
        ])};

        const root = document.getElementById('val-root');
        const btnArea = document.getElementById('btn-area');
        const btnYes = document.getElementById('btn-yes');
        const btnNo = document.getElementById('btn-no');
        const btnBack = document.getElementById('btn-back');
        const viewQ = document.getElementById('view-question');
        const viewA = document.getElementById('view-accepted');
        const confetti = document.getElementById('confetti');

        let noCount = 0;
        let accepted = false;
        let heartTimer = null;

        function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

        function setScales() {
          const noScale = clamp(1 - noCount * 0.06, 0.5, 1);
          const yesScale = clamp(1 + noCount * 0.08, 1, 1.6);
          btnNo.style.transform = 'scale(' + noScale + ')';
          btnYes.style.transform = 'scale(' + yesScale + ')';
        }

        function moveNoButton() {
          if (noCount >= noTexts.length - 1) return;
          const rect = root.getBoundingClientRect();
          const buttonWidth = 160;
          const buttonHeight = 52;
          const padding = 22;
          const top = padding + Math.random() * (rect.height - buttonHeight - padding * 2);
          const left = padding + Math.random() * (rect.width - buttonWidth - padding * 2);

          btnNo.style.position = 'absolute';
          btnNo.style.top = top + 'px';
          btnNo.style.left = left + 'px';

          noCount = Math.min(noCount + 1, noTexts.length - 1);
          btnNo.textContent = noTexts[noCount];
          setScales();
        }

        function spawnHeart() {
          const el = document.createElement('div');
          el.className = 'heart';
          el.textContent = Math.random() > 0.25 ? '💗' : '💖';
          const x = Math.random() * 100;
          const drift = (Math.random() * 120 - 60) + 'px';
          const dur = (6 + Math.random() * 4) + 's';
          const size = (14 + Math.random() * 18) + 'px';
          el.style.left = x + '%';
          el.style.setProperty('--drift', drift);
          el.style.fontSize = size;
          el.style.animation = 'floatUp ' + dur + ' ease-in forwards';
          root.appendChild(el);
          requestAnimationFrame(() => { el.style.opacity = '1'; });
          setTimeout(() => el.remove(), (parseFloat(dur) * 1000) + 200);
        }

        function startHearts() {
          if (heartTimer) return;
          heartTimer = setInterval(spawnHeart, 450);
        }

        function stopHearts() {
          if (!heartTimer) return;
          clearInterval(heartTimer);
          heartTimer = null;
        }

        function burstConfetti() {
          confetti.innerHTML = '';
          const pieces = 140;
          for (let i = 0; i < pieces; i++) {
            const p = document.createElement('i');
            const left = Math.random() * 100;
            const dx = (Math.random() * 240 - 120) + 'px';
            const h = Math.floor(Math.random() * 360);
            const rot = (Math.random() * 360) + 'deg';
            const dur = (2.8 + Math.random() * 1.6) + 's';
            p.style.left = left + 'vw';
            p.style.setProperty('--dx', dx);
            p.style.setProperty('--h', h);
            p.style.setProperty('--rot', rot);
            p.style.setProperty('--dur', dur);
            confetti.appendChild(p);
          }
          setTimeout(() => { confetti.innerHTML = ''; }, 5200);
        }

        function accept() {
          accepted = true;
          viewQ.style.display = 'none';
          viewA.style.display = 'block';
          btnNo.style.position = '';
          btnNo.style.top = '';
          btnNo.style.left = '';
          burstConfetti();
          startHearts();
        }

        function reset() {
          accepted = false;
          noCount = 0;
          btnNo.textContent = noTexts[0];
          btnNo.style.position = '';
          btnNo.style.top = '';
          btnNo.style.left = '';
          setScales();
          viewA.style.display = 'none';
          viewQ.style.display = 'block';
          stopHearts();
          confetti.innerHTML = '';
        }

        btnYes.addEventListener('click', accept);
        btnBack.addEventListener('click', reset);

        btnNo.addEventListener('mouseenter', moveNoButton);
        btnNo.addEventListener('touchstart', (e) => { e.preventDefault(); moveNoButton(); }, { passive: false });
        btnNo.addEventListener('click', () => {
          if (noCount < noTexts.length - 1) moveNoButton();
        });

        // Initialize
        setScales();
        startHearts();
      })();
    </script>
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

