// Surge Script - Decode form-urlencoded and replace product IDs
const NEW_PRODUCT_ID = "9NPH01J3X999";
const NEW_SKU_ID = "0010";
const NEW_AVAILABILITY_ID = "9XJ4NTJPG9X5";

if ($request && $request.body) {
  try {
    // Decodificar el body completo
    let decoded = decodeURIComponent($request.body);
    console.log("🟠 Original body:", decoded);

    // Reemplazar los valores dentro del parámetro products=[{...}]
    decoded = decoded
      .replace(/"productId"\s*:\s*"[^"]+"/g, `"productId":"${NEW_PRODUCT_ID}"`)
      .replace(/"skuId"\s*:\s*"[^"]+"/g, `"skuId":"${NEW_SKU_ID}"`)
      .replace(/"availabilityId"\s*:\s*"[^"]+"/g, `"availabilityId":"${NEW_AVAILABILITY_ID}"`);

    console.log("🟢 Modified body:", decoded);

    // Re-encodear todo antes de enviar
    const encoded = encodeURIComponent(decoded);
    $done({ body: encoded });
  } catch (err) {
    console.log("❌ Error modifying:", err);
    $done({});
  }
} else {
  console.log("⚪ No request body detected");
  $done({});
}
