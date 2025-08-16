// ng_market_force_v2_nz.js
// Fuerza market=NZ y locale=en-NZ en URL y body (incluye niveles anidados).
// Cubre también preflight OPTIONS y GET sin body.
// Dominios: www.microsoft.com, buynow.production.store-web.dynamics.com, cart.production.store-web.dynamics.com, emerald.xboxservices.com

function deepFix(obj) {
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) deepFix(obj[i]);
    return obj;
  }
  if (obj && typeof obj === 'object') {
    for (const k of Object.keys(obj)) {
      const v = obj[k];
      if (k.toLowerCase() === 'market') {
        obj[k] = 'NZ';
      } else if (k.toLowerCase() === 'locale') {
        obj[k] = 'en-NZ';
      } else if (v && (typeof v === 'object' || Array.isArray(v))) {
        deepFix(v);
      }
    }
  }
  return obj;
}

function replaceInText(body) {
  try {
    body = body.replace(/"market"\s*:\s*"[^"]*"/gi, '"market":"NZ"');
    body = body.replace(/"locale"\s*:\s*"[^"]*"/gi, '"locale":"en-NZ"');
  } catch (e) {}
  return body;
}

function fixUrl(u) {
  try {
    if (u.match(/([?&])market=/i)) {
      u = u.replace(/([?&])market=[^&]*/i, '$1market=NZ');
    } else {
      u += (u.includes('?') ? '&' : '?') + 'market=NZ';
    }
    if (u.match(/([?&])locale=/i)) {
      u = u.replace(/([?&])locale=[^&]*/i, '$1locale=en-NZ');
    } else {
      u += (u.includes('?') ? '&' : '?') + 'locale=en-NZ';
    }
  } catch (e) {}
  return u;
}

if ($request && $request.method) {
  let url = $request.url || '';
  url = fixUrl(url);

  const method = $request.method.toUpperCase();

  if (method === 'OPTIONS') {
    $done({ url });
  } else {
    const headers = $request.headers || {};
    delete headers['Content-Length']; delete headers['content-length'];

    let bodyStr = $request.body;
    if (bodyStr) {
      let fixedBodyStr = bodyStr;
      let parsed = null;

      try {
        parsed = JSON.parse(bodyStr);
      } catch (e1) {
        try {
          if (/=/.test(bodyStr) && bodyStr.includes('%7B')) {
            const decoded = decodeURIComponent(bodyStr);
            const m = decoded.match(/\{[\s\S]*\}$/);
            if (m) parsed = JSON.parse(m[0]);
          } else if (bodyStr.startsWith('%7B')) {
            parsed = JSON.parse(decodeURIComponent(bodyStr));
          }
        } catch (e2) {}
      }

      if (parsed && typeof parsed === 'object') {
        deepFix(parsed);
        if (parsed.market !== undefined) parsed.market = 'NZ';
        if (parsed.locale !== undefined) parsed.locale = 'en-NZ';
        fixedBodyStr = JSON.stringify(parsed);
      } else {
        fixedBodyStr = replaceInText(bodyStr);
      }

      $done({ url, headers, body: fixedBodyStr });
    } else {
      $done({ url, headers });
    }
  }
} else {
  $done({});
}


