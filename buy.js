if ($request.method.toUpperCase() !== "OPTIONS") {
    let storedCartId = $persistentStore.read("cartId");

    if (storedCartId) {
        let body = JSON.parse($request.body);

        if (body.cartId) {
            body.cartId = storedCartId;
            $notification.post("✅ Cart ID reemplazado", `Usando: ${storedCartId}`, "");
        } else {
            $notification.post("⚠️ Sin cartId en body", "No se encontró cartId para reemplazar", "");
            console.log("No se encontró cartId");
        }

        $done({
            body: JSON.stringify(body)
        });
    } else {
        $notification.post("❌ Cart ID no disponible", "Guardá uno con getcartid.js", "");
        $done({});
    }
} else {
    $done({});
}