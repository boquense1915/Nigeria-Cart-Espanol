if ($request.method.toUpperCase() !== "OPTIONS") {
    let storedCartId = $persistentStore.read("cartId");

    if (storedCartId) {
        let headers = $request.headers;
        let body = JSON.parse($request.body);

        if (body.cartId) {
            body.cartId = storedCartId;
            $notification.post("Cart ID reemplazado con éxito", `Usando Cart ID: ${storedCartId}`, "");
        } else {
            $notification.post("Error al reemplazar Cart ID", "No se encontró cartId en el cuerpo de la solicitud", "");
            console.log("No se encontró cartId en el cuerpo de la solicitud, es posible que esta solicitud no requiera reemplazo");
        }

        $done({
            body: JSON.stringify(body)
        });
    } else {
        $notification.post("Error al extraer Cart ID", "No hay un cartId almacenado disponible para reemplazar", "");
        console.log("No hay un cartId almacenado disponible");
        $done({});
    }
} else {
    $done({});
}
