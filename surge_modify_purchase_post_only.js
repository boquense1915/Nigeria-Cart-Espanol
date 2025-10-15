// surge_modify_purchase_post_only.js
// Only acts on POST requests to /users/me/orders

const TARGET_PRODUCT = {
  productId: "9NPH01J3X999",
  availabilityId: "9XJ4NTJPG9X5",
  skuId: "0010"
};

const ADD_BENEFICIARY = true;
const BENEFICIARY_MSA_ID = "985155622837686";

const ENABLE_LOGGING = true;

function modifyRequest(request) {
  try {
    // Only handle POST requests
    if (!request || !request.method) {
      log("⚠️ Request inválido");
      return request;
    }
    if (request.method.toUpperCase() !== "POST") {
      log(`ℹ️ Método ${request.method} → no procesado (solo POST)`);
      return request;
    }

    if (!request.body) {
      log("⚠️ Request POST sin body — no hay nada que procesar");
      return request;
    }

    let body;
    try {
      body = JSON.parse(request.body);
    } catch (e) {
      log("❌ No pude parsear JSON del body: " + e.message);
      return request;
    }

    log("▶ Interceptado POST /users/me/orders");
    const items = body.items || body.orderLineItems || body.orderLineItems;
    if (!items || items.length === 0) {
      log("⚠️ No hay items en el body");
      return request;
    }

    let modified = false;

    items.forEach((item, idx) => {
      log(`--- Item ${idx+1} ---`);
      if (item.productId && item.productId !== TARGET_PRODUCT.productId) {
        log(` productId: ${item.productId} → ${TARGET_PRODUCT.productId}`);
        item.productId = TARGET_PRODUCT.productId;
        modified = true;
      }
      if (item.availabilityId && item.availabilityId !== TARGET_PRODUCT.availabilityId) {
        log(` availabilityId: ${item.availabilityId} → ${TARGET_PRODUCT.availabilityId}`);
        item.availabilityId = TARGET_PRODUCT.availabilityId;
        modified = true;
      } else if (!item.availabilityId) {
        item.availabilityId = TARGET_PRODUCT.availabilityId;
        log(` availabilityId agregado: ${TARGET_PRODUCT.availabilityId}`);
        modified = true;
      }

      if (item.skuId && item.skuId !== TARGET_PRODUCT.skuId) {
        log(` skuId: ${item.skuId} → ${TARGET_PRODUCT.skuId}`);
        item.skuId = TARGET_PRODUCT.skuId;
        modified = true;
      } else if (!item.skuId) {
        item.skuId = TARGET_PRODUCT.skuId;
        log(` skuId agregado: ${TARGET_PRODUCT.skuId}`);
        modified = true;
      }

      if (ADD_BENEFICIARY) {
        if (!item.beneficiary || !item.beneficiary.identityValue) {
          item.beneficiary = { identityType: "Msa", identityValue: BENEFICIARY_MSA_ID };
          log(` ✅ beneficiary agregado: ${BENEFICIARY_MSA_ID}`);
          modified = true;
        } else {
          log(` ℹ️ beneficiary existente: ${item.beneficiary.identityValue}`);
        }
      }
    });

    if (modified) {
      request.body = JSON.stringify(body);
      log("✅ Request POST modificado. Enviando versión modificada...");
    } else {
      log("ℹ️ No se realizaron modificaciones (items ya coinciden con TARGET_PRODUCT)");
    }

    return request;
  } catch (err) {
    log("❌ Error en script: " + (err && err.message ? err.message : err));
    return request;
  }
}

function log(msg) {
  if (ENABLE_LOGGING && typeof console !== "undefined") {
    console.log("[SURGE SCRIPT] " + msg);
  }
}

let out = modifyRequest($request);
$done(out);
