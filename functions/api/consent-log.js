export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const ct = (request.headers.get('content-type') || '').toLowerCase();
    if (!ct.includes('application/json')) {
      return json({ ok: true }, 204);
    }
    const raw = await request.text();
    if (!raw) return json({ ok: true }, 204);
    let body;
    try { body = JSON.parse(raw); } catch { body = null; }

    // Build minimal receipt
    const receipt = {
      time: new Date().toISOString(),
      ip: request.headers.get('cf-connecting-ip') || null,
      ua: request.headers.get('user-agent') || null,
      lang: body?.lang || null,
      version: body?.version || null,
      gpc: !!body?.gpc,
      preferences: body?.preferences || null
    };

    // Optional persistence to KV if bound
    if (env && env.CONSENT_KV) {
      const key = `consent:${Date.now()}:${Math.random().toString(36).slice(2)}`;
      try { await env.CONSENT_KV.put(key, JSON.stringify(receipt), { expirationTtl: 60 * 60 * 24 * 400 }); } catch {}
    }
    return json({ ok: true }, 204);
  } catch (e) {
    return json({ ok: false }, 204);
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}


