export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    // Basic guards
    const ct = (request.headers.get('content-type') || '').toLowerCase();
    if (!ct.includes('application/json')) {
      return json({ error: 'Unsupported content type' }, 415);
    }
    const raw = await request.text();
    if (!raw || raw.length > 4096) {
      return json({ error: 'Payload too large' }, 413);
    }
    let body;
    try { body = JSON.parse(raw); } catch { return json({ error: 'Invalid JSON' }, 400); }

    // Normalize
    const name = (body?.name || '').toString().trim();
    const email = (body?.email || '').toString().trim().toLowerCase();
    const company = (body?.company || '').toString().trim();
    const lang = (body?.lang || '').toString().trim().toLowerCase() === 'en' ? 'en' : 'tr';

    // Validate name (letters, spaces, apostrophes, dashes, and Turkish characters)
    const nameOk = /^[A-Za-zÀ-ÖØ-öø-ÿÇĞIİÖŞÜçğıiöşü' -]{2,80}$/u.test(name);
    // Validate email length and shape
    const emailOk = email.length > 3 && email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!nameOk || !emailOk) { return json({ error: 'Invalid name or email' }, 400); }
    if (company && company.length > 100) { return json({ error: 'Company too long' }, 400); }

    // Disposable domain and MX check
    const domain = email.split('@')[1];
    if (isDisposableDomain(domain)) { return json({ error: 'Disposable email not allowed' }, 400); }
    const hasMx = await hasMxRecord(domain);
    if (!hasMx) { return json({ error: 'Email domain has no MX' }, 400); }

    // Rate limit & duplicate guard
    const ip = request.headers.get('cf-connecting-ip') || '0.0.0.0';
    if (!checkRate(ip)) { return json({ error: 'Too many requests' }, 429); }
    
    // Check for existing email in KV storage
    if (env.SUBSCRIBERS) {
      const existingEmail = await env.SUBSCRIBERS.get(email);
      if (existingEmail) {
        const emailData = JSON.parse(existingEmail);
        const now = Math.floor(Date.now() / 1000);
        
        if (emailData.status === 'pending' && emailData.exp > now) {
          return json({ error: 'Already requested. Please check your inbox.' }, 409);
        } else if (emailData.status === 'confirmed') {
          return json({ error: 'Email already confirmed. You are already on our list.' }, 409);
        } else if (emailData.status === 'unsubscribed') {
          return json({ error: 'This email has been unsubscribed. Please contact support if you want to resubscribe.' }, 409);
        }
        // If status is 'pending' but expired, or any other status, allow resubscription
      }
      // If no KV storage entry exists, allow subscription (email was unsubscribed and deleted)
    } else {
      // No KV storage available, fallback to in-memory check
      if (!markPending(email)) {
        return json({ error: 'Already requested. Please check your inbox.' }, 409);
      }
    }

    const expiryHours = parseInt(env.CONFIRMATION_EXPIRY_HOURS || '24', 10);
    const exp = Math.floor(Date.now() / 1000) + (expiryHours * 60 * 60);

    const token = await signJWT({ email, name, company, exp, lang }, env.JWT_SECRET);

    const siteUrl = new URL(request.url);
    siteUrl.pathname = '/confirm-email.html';
    siteUrl.search = `?token=${encodeURIComponent(token)}`;
    const confirmationLink = siteUrl.toString();

    // Tip: if your domain isn't verified in Resend, use onboarding@resend.dev
    const fromName = env.FROM_NAME || 'Kuzamo Team';
    const fromEmail = env.FROM_EMAIL || 'onboarding@resend.dev';
    const replyTo = env.REPLY_TO || 'support@kuzamo.com';

    // Generate unsubscribe token
    const unsubscribeToken = await signJWT({ 
      email, 
      action: 'unsubscribe',
      exp: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60) // 1 year
    }, env.JWT_SECRET);
    
    const baseUrl = env.BASE_URL || new URL('/', request.url).origin;
    const unsubscribeUrl = `${baseUrl}/unsubscribe.html?token=${encodeURIComponent(unsubscribeToken)}`;

    const subject = lang === 'en' ? 'Welcome to Kuzamo! Please confirm your email' : 'Kuzamo\'ya hoş geldiniz! Lütfen e-postanızı doğrulayın';
    const html = buildBrandedEmail({
      lang,
      title: lang === 'en' ? 'Confirm Your Email' : 'E-postanızı Doğrulayın',
      greeting: lang === 'en' ? `Hi ${escapeHtml(name)},` : `Merhaba ${escapeHtml(name)},`,
      body: lang === 'en'
        ? 'We\'re excited to have you on board. Please confirm your email address to activate your access.'
        : 'Aramıza hoş geldiniz. Erişiminizi aktifleştirmek için lütfen e-posta adresinizi doğrulayın.',
      ctaText: lang === 'en' ? 'Confirm Email' : 'E-postayı Doğrula',
      ctaUrl: confirmationLink,
      footer: lang === 'en'
        ? 'If you did not request this, you can safely ignore this email.'
        : 'Bu talebi siz oluşturmadıysanız bu e-postayı yok sayabilirsiniz.',
      unsubscribeUrl
    });

    const sendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: `${fromName} <${fromEmail}>`,
        to: [email],
        subject,
        html,
        reply_to: replyTo,
        headers: {
          'List-Unsubscribe': `<${unsubscribeUrl}>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
          'X-Mailer': 'Kuzamo Email System',
          'X-Priority': '3'
        }
      })
    });

    const apiResp = await safeJson(sendRes);
    if (!sendRes.ok) {
      return json({ error: 'Failed to send email', details: apiResp || null }, 500);
    }

    // Store email in KV storage as pending
    if (env.SUBSCRIBERS) {
      const emailData = {
        email,
        name,
        company,
        status: 'pending',
        exp,
        lang,
        createdAt: Math.floor(Date.now() / 1000),
        tokenId: apiResp?.id || null
      };
      await env.SUBSCRIBERS.put(email, JSON.stringify(emailData), { 
        expirationTtl: expiryHours * 60 * 60 // TTL in seconds
      });
      
      // Clear from in-memory storage to avoid conflicts
      pendingEmails.delete(email);
    }

    return json({ message: 'Confirmation email sent successfully', email, id: apiResp?.id || null });
  } catch (e) {
    return json({ error: 'Failed to handle subscribe' }, 500);
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

async function safeJson(res){
  try { return await res.json(); } catch { return null; }
}

// In-memory guards (best-effort in edge runtime)
const ipHits = new Map(); // ip -> array of timestamps (ms)
const pendingEmails = new Map(); // email -> expiry ms

function checkRate(ip){
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const limit = 10; // 10 requests / 15 min per IP
  const list = ipHits.get(ip) || [];
  const fresh = list.filter(ts => now - ts < windowMs);
  fresh.push(now);
  ipHits.set(ip, fresh);
  return fresh.length <= limit;
}

function markPending(email){
  const now = Date.now();
  const ttl = 24 * 60 * 60 * 1000; // 24h
  // sweep
  for (const [em, exp] of pendingEmails.entries()) {
    if (exp <= now) pendingEmails.delete(em);
  }
  if (pendingEmails.has(email)) return false;
  pendingEmails.set(email, now + ttl);
  return true;
}

function isDisposableDomain(domain){
  const list = new Set([
    'mailinator.com','yopmail.com','tempmail.com','10minutemail.com','guerrillamail.com','trashmail.com','fakeinbox.com','dispostable.com','getnada.com','sharklasers.com'
  ]);
  return list.has(domain);
}

async function hasMxRecord(domain){
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 2000);
    const resp = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=MX`, { signal: ctrl.signal });
    clearTimeout(t);
    if (!resp.ok) return false;
    const data = await resp.json();
    return Array.isArray(data?.Answer) && data.Answer.length > 0;
  } catch { return false; }
}

function buildBrandedEmail({ lang, title, greeting, body, ctaText, ctaUrl, footer, unsubscribeUrl, showCta = true }){
  const brand = {
    bg: '#f5f7ff',
    card: '#ffffff',
    text: '#111827',
    muted: '#6b7280',
    brand: '#4f46e5',
    brandDark: '#4338ca'
  };
  const copyright = lang === 'en' ? '© 2025 Kuzamo. All rights reserved.' : '© 2025 Kuzamo. Tüm hakları saklıdır.';
  const unsubscribeText = lang === 'en' ? 'Unsubscribe' : 'Abonelikten Çık';
  
  const ctaButton = showCta && ctaText && ctaUrl ? 
    `<p><a href="${ctaUrl}" style="display:inline-block;padding:12px 18px;border-radius:10px;background:${brand.brand};color:#fff;text-decoration:none;font-weight:600">${escapeHtml(ctaText)}</a></p>` : '';
  
  const unsubscribeLink = unsubscribeUrl ? 
    `<p style="margin:16px 0 0 0;text-align:center;"><a href="${unsubscribeUrl}" style="color:${brand.muted};text-decoration:underline;font-size:12px">${unsubscribeText}</a></p>` : '';

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${escapeHtml(title)}</title></head>
  <body style="margin:0;padding:0;background:${brand.bg};font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:${brand.text};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${brand.bg};padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:${brand.card};border-radius:16px;overflow:hidden;box-shadow:0 10px 25px rgba(0,0,0,0.08);">
            <tr>
              <td style="padding:24px 24px 0 24px;">
                <span style="display:inline-block;height:36px;width:36px;border-radius:8px;background:${brand.brand};color:#fff;font-weight:700;font-size:18px;line-height:36px;text-align:center;vertical-align:middle">K</span>
                <span style="display:inline-block;margin-left:10px;font-size:22px;font-weight:800;color:${brand.brand};vertical-align:middle">Kuzamo</span>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 24px 0 24px;">
                <h1 style="margin:0 0 8px 0;font-size:24px;line-height:1.3">${escapeHtml(title)}</h1>
                <p style="margin:0 0 4px 0;color:${brand.muted}">${escapeHtml(greeting)}</p>
                <p style="margin:8px 0 16px 0;color:${brand.muted}">${escapeHtml(body)}</p>
                ${ctaButton}
              </td>
            </tr>
            <tr>
              <td style="padding:8px 24px 24px 24px;color:${brand.muted};font-size:13px">${escapeHtml(footer)}</td>
            </tr>
          </table>
          <div style="max-width:600px;margin-top:12px;color:${brand.muted};font-size:12px;text-align:center">
            ${escapeHtml(copyright)}
            ${unsubscribeLink}
          </div>
        </td>
      </tr>
    </table>
  </body></html>`;
}

async function signJWT(payload, secret) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const header = { alg: 'HS256', typ: 'JWT' };
  const base64url = (b) => btoa(String.fromCharCode(...new Uint8Array(b)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const toBase64Url = (obj) => btoa(unescape(encodeURIComponent(JSON.stringify(obj))))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const unsigned = `${toBase64Url(header)}.${toBase64Url(payload)}`;
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(unsigned));
  const signature = base64url(sig);
  return `${unsigned}.${signature}`;
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (c) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;' }[c]));
}
