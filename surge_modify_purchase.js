// surge_modify_purchase.js (actualizado)
// Reemplaza productId / skuId / availabilityId en JSON y en form-urlencoded (products=...)
// Valores nuevos:
const NEW_PRODUCT_ID = "9NPH01J3X999";
const NEW_SKU_ID = "0010";
const NEW_AVAILABILITY_ID = "9XJ4NTJPG9X5";

if ($request.method !== "POST") {
  $done({});
}

if (!$request.body) {
  console.log("No request body found.");
  $notification.post('请求体未找到', 'El request no contiene body.', '');
  $done({});
}

function deepReplace(obj) {
  if (!obj || typeof obj !== 'object') return;
  if (Array.isArray(obj)) {
    obj.forEach(item => deepReplace(item));
    return;
  }
  if (obj.hasOwnProperty('productId')) obj.productId = NEW_PRODUCT_ID;
  if (obj.hasOwnProperty('skuId')) obj.skuId = NEW_SKU_ID;
  if (obj.hasOwnProperty('availabilityId')) obj.availabilityId = NEW_AVAILABILITY_ID;

  if (obj.items && Array.isArray(obj.items)) obj.items.forEach(i => deepReplace(i));
  if (obj.lineItems && Array.isArray(obj.lineItems)) obj.lineItems.forEach(i => deepReplace(i));

  for (let k in obj) {
    if (!obj.hasOwnProperty(k)) continue;
    const v = obj[k];
    if (typeof v === 'object' && v !== null) deepReplace(v);
    // También intentar parsear strings que contienen JSON
    if (typeof v === 'string' && v.trim().startsWith('[') || v.trim().startsWith('{')) {
      try {
        const nested = JSON.parse(v);
        deepReplace(nested);
        obj[k] = JSON.stringify(nested);
      } catch (e) {
        // ignore
      }
    }
  }
}

// Helpers para form-urlencoded
function parseFormEncoded(body) {
  const pairs = body.split('&');
  const map = {};
  for (let p of pairs) {
    const idx = p.indexOf('=');
    if (idx === -1) continue;
    const key = decodeURIComponent(p.slice(0, idx));
    const val = decodeURIComponent(p.slice(idx + 1));
    map[key] = val;
  }
  return map;
}
function buildFormEncoded(map) {
  return Object.keys(map).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(map[k])).join('&');
}

const contentTypeHeader = ($request.headers && $request.headers['Content-Type']) || ($request.headers && $request.headers['content-type']) || '';

try {
  // 1) JSON body attempt
  if (contentTypeHeader.indexOf('application/json') !== -1) {
    let parsed = JSON.parse($request.body);
    console.log("Original JSON body:", JSON.stringify(parsed));
    deepReplace(parsed);
    const modified = JSON.stringify(parsed);
    console.log("Modified JSON body:", modified);
    $done({ body: modified });
  }

  // 2) form-urlencoded (buynow flow, products=[...])
  if (contentTypeHeader.indexOf('application/x-www-form-urlencoded') !== -1) {
    let body = $request.body.toString();
    const map = parseFormEncoded(body);

    let modified = false;

    // campos con JSON embebido: "products", "data", "onBehalfOfToken", etc. Nos interesa products y data.
    ['products', 'data', 'productsJson'].forEach(key => {
      if (map[key]) {
        try {
          // algunos productos vienen como array JSON string
          let parsed = JSON.parse(map[key]);
          deepReplace(parsed);
          map[key] = JSON.stringify(parsed);
          modified = true;
        } catch (e) {
          // si no parsea, tratamos de buscar JSON dentro del valor con regex
          let val = map[key];
          // detectar y reemplazar productId / availabilityId / skuId dentro del texto
          val = val.replace(/("productId"\s*:\s*")([^"]+)(")/g, `$1${NEW_PRODUCT_ID}$3`);
          val = val.replace(/("availabilityId"\s*:\s*")([^"]+)(")/g, `$1${NEW_AVAILABILITY_ID}$3`);
          val = val.replace(/("skuId"\s*:\s*")([^"]+)(")/g, `$1${NEW_SKU_ID}$3`);
          map[key] = val;
          modified = true;
        }
      }
    });

    if (modified) {
      const newBody = buildFormEncoded(map);
      console.log("Modified form-urlencoded body:", newBody);
      $done({ body: newBody });
    }
  }

  // 3) Fallback generic: intentar parseo JSON en el body aunque no sea application/json
  try {
    let parsed = JSON.parse($request.body);
    console.log("Fallback parsed JSON:", JSON.stringify(parsed));
    deepReplace(parsed);
    const modified = JSON.stringify(parsed);
    console.log("Modified JSON (fallback):", modified);
    $done({ body: modified });
  } catch (e) {
    // continuar al regex fallback
  }

} catch (e) {
  console.log("Error in processing:", e);
}

// 4) Final fallback: regex sobre todo el body
let bodyStr = $request.body.toString();
console.log("Using ultimate regex fallback.");
bodyStr = bodyStr.replace(/("productId"\s*:\s*")([^"]+)(")/g, `$1${NEW_PRODUCT_ID}$3`);
bodyStr = bodyStr.replace(/("availabilityId"\s*:\s*")([^"]+)(")/g, `$1${NEW_AVAILABILITY_ID}$3`);
bodyStr = bodyStr.replace(/("skuId"\s*:\s*")([^"]+)(")/g, `$1${NEW_SKU_ID}$3`);

// También revisar forms donde products=%5B%7B...%7D%5D (encoded JSON)
// Intentar decodificar y reemplazar patrones codificados
try {
  const decoded = decodeURIComponent(bodyStr);
  if (decoded !== bodyStr) {
    let newDecoded = decoded.replace(/("productId"%3A%22)([^%]+)(%22)/g, `$1${NEW_PRODUCT_ID}$3`);
    newDecoded = newDecoded.replace(/("availabilityId"%3A%22)([^%]+)(%22)/g, `$1${NEW_AVAILABILITY_ID}$3`);
    newDecoded = newDecoded.replace(/("skuId"%3A%22)([^%]+)(%22)/g, `$1${NEW_SKU_ID}$3`);
    const reencoded = encodeURIComponent(newDecoded);
    if (reencoded && reencoded !== bodyStr) {
      bodyStr = reencoded;
    }
  }
} catch (e) {
  // ignore
}

console.log("Modified (final regex) Body:", bodyStr);
$done({ body: bodyStr });
