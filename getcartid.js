let body = $response.body;
let obj = JSON.parse(body);

if (obj.cart && obj.cart.id) {
    let cartId = obj.cart.id;
    
    $persistentStore.write(cartId, "cartId");

    $notification.post("Cart ID obtenido con éxito", `cartId: ${cartId}`, "");
    
    console.log(`Cart ID: ${cartId}`);
} else {
    $notification.post("Error al obtener Cart ID", "No se encontró cart id en el cuerpo de la respuesta", "");
    console.log("No se encontró cart id en el cuerpo de la respuesta");
}

$done({});
