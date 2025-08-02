let body = $response.body;
let obj = JSON.parse(body);

if (obj.cart && obj.cart.id) {
    let cartId = obj.cart.id;
    $persistentStore.write(cartId, "cartId");
    $notification.post("Cart ID obtenido ✅", `cartId: ${cartId}`, "");
    console.log(`Cart ID: ${cartId}`);
} else {
    $notification.post("Cart ID no encontrado ❌", "No se detectó cartId", "");
    console.log("Cart ID no encontrado en la respuesta");
}
$done({});