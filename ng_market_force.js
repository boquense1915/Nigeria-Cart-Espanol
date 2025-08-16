// ng_market_force.js
// Fuerza market=NG (incluidos campos anidados como data.market)
// y locale=en-NG en cualquier nivel del body y en la URL.

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

function replaceInText(body) {
  try {
    body = body.replace(/"market"\s*:\s*"[^"]*"/gi, '"market":"NG"');
    body = body.replace(/"locale"\s*:\s*"[^"]*"/gi, '"locale":"en-NG"');
  } catch (e) {}
  return body;
}

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

if ($request && $request.method && $request.method.toUpperCase() !== 'OPTIONS') {
  let url = $request.url || '';
  url = fixUrl(url);

  const headers = $request.headers || {};
  delete headers['Content-Length'];
  delete headers['content-length'];

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
      if (parsed.market !== undefined) parsed.market = 'NG';
      if (parsed.locale !== undefined) parsed.locale = 'en-NG';
      fixedBodyStr = JSON.stringify(parsed);
    } else {
      fixedBodyStr = replaceInText(bodyStr);
    }

    $done({ url, headers, body: fixedBodyStr });
  } else {
    $done({ url, headers });
  }
} else {
  $done({});
}
