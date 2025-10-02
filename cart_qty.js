/**
 * Multiplica los lineItems del request Cart/purchase según el qty configurado.
 *
 * Persistent Store:
 *   - qty: cantidad (entero >=1), ej. "3"
 *   - qty_filter_pid: filtra por productId (CSV opcional)
 *   - qty_filter_aid: filtra por availabilityId (CSV opcional)
 *   - qty_filter_sku: filtra por skuId (CSV opcional)
 *
 * Ejemplo: qty=3 duplica 3 veces el item (cada uno con quantity=1)
 */

(function () {
  try {
    if (!$request || !$request.body) return $done({});
    const url = $request.url || "";
    if (!/cart\.production\.store-web\.dynamics\.com\/v1\.0\/Cart\/purchase/.test(url)) return $done({});

    const headers = $request.headers || {};
    const ct = headers["Content-Type"] || headers["content-type"] || "";
    if (!ct.includes("application/json")) return $done({});

    // --- Configuración desde Persistent Store ---
    let qty = parseInt(($persistentStore.read("qty") || "1"), 10);
    if (!Number.isFinite(qty) || qty < 1) qty = 1;

    const pidFilter = parseCsv($persistentStore.read("qty_filter_pid"));
    const aidFilter = parseCsv($persistentStore.read("qty_filter_aid"));
    const skuFilter = parseCsv($persistentStore.read("qty_filter_sku"));

    // --- Parse del body ---
    let body;
    try {
      body = JSON.parse($request.body);
    } catch (err) {
      console.log("[cart_qty] JSON parse error:", err);
      return $done({});
    }

    if (!Array.isArray(body.lineItems) || body.lineItems.length === 0) {
      console.log("[cart_qty] No lineItems");
      return $done({});
    }

    let newItems = [];
    let touched = false;

    for (const it of body.lineItems) {
      if (matchFilters(it, pidFilter, aidFilter, skuFilter)) {
        for (let i = 0; i < qty; i++) {
          let clone = { ...it };
          // forzamos quantity=1 por item (igual que tu python)
          clone.quantity = 1;
          // opcional: regenerar id si el backend requiere únicos
          clone.id = randomUUID();
          newItems.push(clone);
        }
        touched = true;
      } else {
        newItems.push(it);
      }
    }

    if (touched) {
      body.lineItems = newItems;
      $notification.post(
        "Cart Purchase Qty aplicado",
        `qty=${qty}` +
          (pidFilter.length ? ` pid=${pidFilter.join(",")}` : ""),
        ""
      );
      return $done({ body: JSON.stringify(body) });
    }

    return $done({});
  } catch (e) {
    console.log("[cart_qty] Error general:", e);
    $done({});
  }

  // --- helpers ---
  function parseCsv(v) {
    if (!v) return [];
    return String(v)
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);
  }

  function matchFilters(it, pids, aids, skus) {
    if (pids.length === 0 && aids.length === 0 && skus.length === 0) return true;
    const pid = String(it.productId || "");
    const aid = String(it.availabilityId || "");
    const sku = String(it.skuId || "");
    if (pids.length && !pids.includes(pid)) return false;
    if (aids.length && !aids.includes(aid)) return false;
    if (skus.length && !skus.includes(sku)) return false;
    return true;
  }

  function randomUUID() {
    // genera pseudo UUID v4 para que no repita el mismo id
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
})();
