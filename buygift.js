if ($request.method.toUpperCase() !== "OPTIONS") {
  let body = {};
  try {
    body = Object.fromEntries(new URLSearchParams($request.body));
  } catch (e) {
    $notification.post("❌ Error", "No se pudo parsear el body", "");
    $done({});
  }

  let storedCartId = $persistentStore.read("cartId");

  if (!storedCartId) {
    $notification.post("❌ No hay cartId guardado", "Usá getcartid.js antes", "");
    $done({});
    return;
  }

  const scenario = body["scenario"];
  if (scenario && scenario.toLowerCase() === "gift") {
    body["market"] = "AR";
    body["locale"] = "es-AR";
    body["data"] = `{"usePurchaseSdk":true,"cartId":"${storedCartId}"}`;

    $notification.post("🎁 Compra regalo AR interceptada", `Usando cartId: ${storedCartId}`, "");

    $done({
      body: new URLSearchParams(body).toString()
    });
  } else {
    console.log("No es regalo. Ignorado.");
    $done({});
  }
} else {
  $done({});
}