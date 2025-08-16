// ng_market_force_v2.js
// Fuerza market=NG y locale=en-NG en URL y body (incluye niveles anidados como data.market).
// Reescribe también en peticiones OPTIONS (preflight) y GET sin body.
// Probado para dominios: www.microsoft.com, buynow.production.store-web.dynamics.com, cart.production.store-web.dynamics.com, emerald.xboxservices.com

function deepFix(obj) {
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) deepFix(obj[i]);
    return obj;
  }
  if (obj && typeof obj === 'object') {
    for (const k of Object.keys(obj)) {
      const v = obj[k];
      if (k.toLowerCase() === 'market') {
        obj[k] = 'NG';
      } else if (k.toLowerCase() === 'locale') {
        obj[k] = 'en-NG';
      } else if (v && (typeof v === 'object' || Array.isArray(v))) {
        deepFix(v);
      }
    }
  }
  return obj;
}

// Reemplazos defensivos cuando el body no es JSON “limpio”
function replaceInText(body) {
  try {
    body = body.replace(/"market"\s*:\s*"[^"]*"/gi, '"market":"NG"');
    body = body.replace(/"locale"\s*:\s*"[^"]*"/gi, '"locale":"en-NG"');
  } catch (e) {}
  return body;
}

// Asegurar query market=NG y locale=en-NG en la URL
function fixUrl(u) {
  try {
    if (u.match(/([?&])market=/i)) {
      u = u.replace(/([?&])market=[^&]*/i, '$1market=NG');
    } else {
      u += (u.includes('?') ? '&' : '?') + 'market=NG';
    }
    if (u.match(/([?&])locale=/i)) {
      u = u.replace(/([?&])locale=[^&]*/i, '$1locale=en-NG');
    } else {
      u += (u.includes('?') ? '&' : '?') + 'locale=en-NG';
    }
  } catch (e) {}
  return u;
}

if ($request && $request.method) {
  let url = $request.url || '';
  url = fixUrl(url); // SIEMPRE reescribimos la URL (OPTIONS/GET/POST/PUT)

  const method = $request.method.toUpperCase();

  // Para preflight OPTIONS no hay body que modificar
  if (method === 'OPTIONS') {
    $done({ url });
  } else {
    const headers = $request.headers || {};
    // Forzar recalcular Content-Length
    delete headers['Content-Length']; delete headers['content-length'];

    let bodyStr = $request.body;
    if (bodyStr) {
      let fixedBodyStr = bodyStr;
      let parsed = null;

      // 1) Intento JSON directo
      try {
        parsed = JSON.parse(bodyStr);
      } catch (e1) {
        // 2) URL-encoded con JSON o JSON escapado
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
        // Reemplazo profundo
        deepFix(parsed);
        if (parsed.market !== undefined) parsed.market = 'NG';
        if (parsed.locale !== undefined) parsed.locale = 'en-NG';
        fixedBodyStr = JSON.stringify(parsed);
      } else {
        // Reemplazo textual defensivo
        fixedBodyStr = replaceInText(bodyStr);
      }

      $done({ url, headers, body: fixedBodyStr });
    } else {
      // GET/POST sin body: solo URL + headers
      $done({ url, headers });
    }
  }
} else {
  $done({});
}


