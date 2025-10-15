// surge_modify_purchase.js
// Reemplaza productId / skuId / availabilityId por los valores pedidos
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
  }
}

try {
  let parsed = JSON.parse($request.body);
  console.log("Original JSON body:", JSON.stringify(parsed));
  deepReplace(parsed);
  const modified = JSON.stringify(parsed);
  console.log("Modified JSON body:", modified);
  $done({ body: modified });
} catch (e) {
  let body = $request.body.toString();
  console.log("JSON parse failed, using regex fallback.");

  body = body.replace(/("productId"\s*:\s*")([^"]+)(")/g, `$1${NEW_PRODUCT_ID}$3`);
  body = body.replace(/("availabilityId"\s*:\s*")([^"]+)(")/g, `$1${NEW_AVAILABILITY_ID}$3`);
  body = body.replace(/("skuId"\s*:\s*")([^"]+)(")/g, `$1${NEW_SKU_ID}$3`);

  console.log("Modified (regex) Body:", body);
  $done({ body: body });
}
