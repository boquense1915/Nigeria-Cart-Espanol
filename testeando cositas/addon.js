/**
 * Script de modificación de request para forzar DLC como Juego
 * Convierte "type":"addOn","kind":"Consumable" en "type":"games","kind":"Game"
 * antes de enviarlo al servidor.
 */

if ($request && $request.body) {
    let originalBody = $request.body;

    // Reemplazo
    let modifiedBody = originalBody.replace(
        /"type":"addOn","kind":"Consumable"/g,
        '"type":"games","kind":"Game"'
    );

    if (modifiedBody !== originalBody) {
        // Si se modificó algo
        $notification.post("✅ Modificación realizada", "El DLC fue cambiado a Juego", "");
    } else {
        // Si no se modificó nada
        $notification.post("⚠️ Sin cambios", "No se encontró DLC para modificar", "");
    }

    $done({ body: modifiedBody });
} else {
    $notification.post("⚠️ Sin cambios", "No se encontró cuerpo en la request", "");
    $done({});
}
