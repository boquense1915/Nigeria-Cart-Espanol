// getcartid.js - Extraer y guardar Cart ID y LineItem ID

let body = $response.body;
let obj = JSON.parse(body);

if (obj.cart && obj.cart.id && obj.cart.lineItems && obj.cart.lineItems.length > 0) {
    let cartId = obj.cart.id;
    let lineItemId = obj.cart.lineItems[0].id; // Usamos siempre el primer producto del carrito

    // Guardar cartId y lineItemId en almacenamiento persistente
    $persistentStore.write(cartId, "cartId");
    $persistentStore.write(lineItemId, "lineItemId");

    $notification.post("✅ Cart ID obtenido con éxito", `Cart ID: ${cartId}, LineItem ID: ${lineItemId}`, "");
    console.log(`Cart ID: ${cartId}, LineItem ID: ${lineItemId}`);
} else {
    $notification.post("⚠️ Error al obtener Cart ID", "No se encontraron los datos requeridos en la respuesta", "");
    console.log("No se encontraron los datos requeridos en la respuesta");
}

$done({});
