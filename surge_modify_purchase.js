/*
Script para Surge - Modificar ProductId, AvailabilityId y SkuId

Intercepta las compras de Microsoft Store y reemplaza automáticamente:
- productId
- availabilityId
- skuId

Uso:
1. Agregar a Surge.conf:
   [Script]
   msft_purchase = type=http-request,pattern=^https://purchase\.md\.mp\.microsoft\.com/v7\.0/users/me/orders,requires-body=1,max-size=0,script-path=surge_modify_purchase.js

2. Configurar los IDs deseados abajo
3. Hacer compra normalmente en el navegador
*/

// ============= CONFIGURACIÓN =============

// IDs del producto que quieres comprar REALMENTE
const TARGET_PRODUCT = {
    productId: "9NPH01J3X999",       // ← Cambia esto
    availabilityId: "9XJ4NTJPG9X5",  // ← Cambia esto
    skuId: "0010"                    // ← Cambia esto
};

// IDs del producto original (opcional: solo para logging)
const ORIGINAL_PRODUCT = {
    productId: "ORIGINAL_ID",
    availabilityId: "ORIGINAL_AVAILABILITY",
    skuId: "ORIGINAL_SKU"
};

// Beneficiary (opcional: agregar si no está)
const ADD_BENEFICIARY = true;
const BENEFICIARY_MSA_ID = "985155622837686";  // ← Cambia esto

// Logging
const ENABLE_LOGGING = true;

// ==========================================

function modifyRequest(request) {
    try {
        // Solo procesar si tiene body
        if (!request.body) {
            log("⚠️ Request sin body, ignorando");
            return request;
        }

        // Parsear el body JSON
        let body = JSON.parse(request.body);

        log("🎯 Interceptado: POST /users/me/orders");
        log(`📦 Items originales: ${body.items ? body.items.length : 0}`);

        // Verificar que tenga items
        if (!body.items || body.items.length === 0) {
            log("⚠️ No hay items en el body");
            return request;
        }

        let modified = false;

        // Modificar cada item
        body.items.forEach((item, index) => {
            log(`\n--- Item ${index + 1} ---`);

            // Guardar valores originales para logging
            const original = {
                productId: item.productId,
                availabilityId: item.availabilityId,
                skuId: item.skuId
            };

            // 1. Modificar productId
            if (item.productId !== TARGET_PRODUCT.productId) {
                log(`  productId: ${item.productId} → ${TARGET_PRODUCT.productId}`);
                item.productId = TARGET_PRODUCT.productId;
                modified = true;
            }

            // 2. Modificar availabilityId
            if (item.availabilityId !== TARGET_PRODUCT.availabilityId) {
                log(`  availabilityId: ${item.availabilityId} → ${TARGET_PRODUCT.availabilityId}`);
                item.availabilityId = TARGET_PRODUCT.availabilityId;
                modified = true;
            }

            // 3. Modificar skuId
            if (item.skuId !== TARGET_PRODUCT.skuId) {
                log(`  skuId: ${item.skuId} → ${TARGET_PRODUCT.skuId}`);
                item.skuId = TARGET_PRODUCT.skuId;
                modified = true;
            }

            // 4. Agregar beneficiary si está habilitado
            if (ADD_BENEFICIARY && BENEFICIARY_MSA_ID !== "985155622837686") {
                if (!item.beneficiary) {
                    item.beneficiary = {
                        identityType: "Msa",
                        identityValue: BENEFICIARY_MSA_ID
                    };
                    log(`  ✅ Beneficiary agregado: ${BENEFICIARY_MSA_ID}`);
                    modified = true;
                } else {
                    log(`  ℹ️ Beneficiary ya existe: ${item.beneficiary.identityValue}`);
                }
            }
        });

        // Si se modificó algo, actualizar el request
        if (modified) {
            request.body = JSON.stringify(body);
            log("\n✅ Request modificado exitosamente");
            log("📤 Enviando a Microsoft...");
        } else {
            log("\nℹ️ No se requirieron modificaciones");
        }

        return request;

    } catch (error) {
        log(`❌ Error: ${error.message}`);
        log(`Stack: ${error.stack}`);
        return request;
    }
}

function log(message) {
    if (ENABLE_LOGGING) {
        console.log(`[SURGE] ${message}`);
    }
}

// Entry point para Surge
let modifiedRequest = modifyRequest($request);
$done(modifiedRequest);
