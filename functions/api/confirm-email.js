export async function onRequestGet(context) {
  const { request, env } = context;
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    if (!token) {
      return json({ error: 'Missing token' }, 400);
    }

    const payload = await verifyJWT(token, env.JWT_SECRET);
    if (!payload) {
      return json({ error: 'Invalid token' }, 400);
    }

    if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) {
      return json({ error: 'Token expired' }, 400);
    }

    // Check if email is already confirmed
    if (env.SUBSCRIBERS) {
      const existingEmail = await env.SUBSCRIBERS.get(payload.email);
      if (existingEmail) {
        const emailData = JSON.parse(existingEmail);
        if (emailData.status === 'confirmed') {
          return json({ error: 'Email already confirmed' }, 409);
        }
      }
    }

    // Send confirmation success email (optional)
    const fromName = env.FROM_NAME || 'Kuzamo Team';
    const fromEmail = env.FROM_EMAIL || 'onboarding@resend.dev';
    const replyTo = env.REPLY_TO || 'support@kuzamo.com';

    const lang = (payload.lang === 'en') ? 'en' : 'tr';
    const subject = lang === 'en' ? 'Email confirmed! Welcome to Kuzamo' : 'E-posta doğrulandı! Kuzamo\'ya hoş geldiniz';
    // Generate unsubscribe token
    const unsubscribeToken = await signJWT({ 
      email: payload.email, 
      action: 'unsubscribe',
      exp: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60) // 1 year
    }, env.JWT_SECRET);
    
    const baseUrl = env.BASE_URL || new URL('/', request.url).origin;
    const unsubscribeUrl = `${baseUrl}/unsubscribe.html?token=${encodeURIComponent(unsubscribeToken)}`;

    const html = buildBrandedEmail({
      lang,
      title: lang === 'en' ? 'Email Confirmed' : 'E-posta Doğrulandı',
      greeting: lang === 'en' ? `Hi ${escapeHtml(payload.name)},` : `Merhaba ${escapeHtml(payload.name)},`,
      body: lang === 'en'
        ? 'Your email has been confirmed successfully. You\'ve been added to our early access list. We\'ll notify you when Kuzamo is ready and you can start using it.'
        : 'E-posta adresiniz başarıyla doğrulandı. Erken erişim listesine eklendiniz. Kuzamo hazır olduğunda size haber vereceğiz ve kullanmaya başlayabileceksiniz.',
      footer: lang === 'en' 
        ? 'If this wasn\'t you, you can ignore this email.' 
        : 'Bu işlem size ait değilse e-postayı yok sayabilirsiniz.',
      unsubscribeUrl,
      showCta: false
    });

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: `${fromName} <${fromEmail}>`,
        to: [payload.email],
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
    }).catch(() => {});

    // Update email status to confirmed in KV storage
    if (env.SUBSCRIBERS) {
      const emailData = {
        email: payload.email,
        name: payload.name,
        company: payload.company,
        status: 'confirmed',
        confirmedAt: Math.floor(Date.now() / 1000),
        lang: payload.lang
      };
      await env.SUBSCRIBERS.put(payload.email, JSON.stringify(emailData), { 
        expirationTtl: 365 * 24 * 60 * 60 // 1 year TTL for confirmed emails
      });
    }

    // If request expects JSON (AJAX), return JSON; otherwise redirect
    const accept = request.headers.get('accept') || '';
    if (accept.includes('application/json')) {
      return json({ message: 'Email confirmed' });
    }
    const successUrl = new URL('/confirm-email.html', request.url);
    successUrl.search = '?ok=1';
    return Response.redirect(successUrl.toString(), 302);
  } catch (e) {
    // If not JSON, redirect to page with error
    const req = context?.request || request;
    const accept = req.headers.get('accept') || '';
    if (accept.includes('text/html')) {
      const errorUrl = new URL('/confirm-email.html', request.url);
      errorUrl.search = '?error=1';
      return Response.redirect(errorUrl.toString(), 302);
    }
    return json({ error: 'Failed to confirm email' }, 500);
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

async function verifyJWT(token, secret) {
  const [headerPart, payloadPart, signature] = token.split('.');
  if (!headerPart || !payloadPart || !signature) return null;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const unsigned = `${headerPart}.${payloadPart}`;
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(unsigned));
  const base64url = (b) => btoa(String.fromCharCode(...new Uint8Array(b)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const expected = base64url(sig);
  if (expected !== signature) return null;
  try {
    const jsonStr = decodeURIComponent(escape(atob(payloadPart.replace(/-/g, '+').replace(/_/g, '/'))));
    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
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

function buildBrandedEmail({ lang, title, greeting, body, ctaText, ctaUrl, footer, unsubscribeUrl, showCta = true }){
  const brand = {
    bg: '#f5f7ff', card: '#ffffff', text: '#111827', muted: '#6b7280', brand: '#4f46e5', brandDark: '#4338ca'
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
      <tr><td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:${brand.card};border-radius:16px;overflow:hidden;box-shadow:0 10px 25px rgba(0,0,0,0.08);">
          <tr><td style="padding:24px 24px 0 24px;">
            <span style="display:inline-block;height:36px;width:36px;border-radius:8px;background:${brand.brand};color:#fff;font-weight:700;font-size:18px;line-height:36px;text-align:center;vertical-align:middle">K</span>
            <span style="display:inline-block;margin-left:10px;font-size:22px;font-weight:800;color:${brand.brand};vertical-align:middle">Kuzamo</span>
          </td></tr>
          <tr><td style="padding:24px 24px 0 24px;">
            <h1 style="margin:0 0 8px 0;font-size:24px;line-height:1.3">${escapeHtml(title)}</h1>
            <p style="margin:0 0 4px 0;color:${brand.muted}">${escapeHtml(greeting)}</p>
            <p style="margin:8px 0 16px 0;color:${brand.muted}">${escapeHtml(body)}</p>
            ${ctaButton}
          </td></tr>
          <tr><td style="padding:8px 24px 24px 24px;color:${brand.muted};font-size:13px">${escapeHtml(footer)}</td></tr>
        </table>
        <div style="max-width:600px;margin-top:12px;color:${brand.muted};font-size:12px;text-align:center">
          ${escapeHtml(copyright)}
          ${unsubscribeLink}
        </div>
      </td></tr>
    </table>
  </body></html>`;
}
