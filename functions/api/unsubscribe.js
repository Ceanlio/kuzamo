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

    if (payload.action !== 'unsubscribe') {
      return json({ error: 'Invalid token action' }, 400);
    }

    // Remove email from KV storage entirely to allow fresh resubscription
    if (env.SUBSCRIBERS) {
      await env.SUBSCRIBERS.delete(payload.email);
    }

    // If request expects JSON (AJAX), return JSON; otherwise redirect
    const accept = request.headers.get('accept') || '';
    if (accept.includes('application/json')) {
      return json({ message: 'Successfully unsubscribed' });
    }
    
    // Redirect to unsubscribe confirmation page
    const successUrl = new URL('/unsubscribe.html', request.url);
    successUrl.search = '?success=1';
    return Response.redirect(successUrl.toString(), 302);
  } catch (e) {
    // If not JSON, redirect to page with error
    const req = context?.request || request;
    const accept = req.headers.get('accept') || '';
    if (accept.includes('text/html')) {
      const errorUrl = new URL('/unsubscribe.html', request.url);
      errorUrl.search = '?error=1';
      return Response.redirect(errorUrl.toString(), 302);
    }
    return json({ error: 'Failed to unsubscribe' }, 500);
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
  const expectedSig = await crypto.subtle.sign('HMAC', key, enc.encode(unsigned));
  const expectedSigB64 = btoa(String.fromCharCode(...new Uint8Array(expectedSig)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  if (expectedSigB64 !== signature) return null;
  try {
    const payload = JSON.parse(atob(payloadPart.replace(/-/g, '+').replace(/_/g, '/')));
    return payload;
  } catch { return null; }
}
