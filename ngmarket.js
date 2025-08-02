if ($request.method.toUpperCase() !== "OPTIONS") {
  let body = JSON.parse($request.body);
  let headers = $request.headers;
  let url = $request.url;

  if (body.market) {
    body.market = "AR";
  }

  if (body.locale) {
    body.locale = "es-AR";
  }

  if (body.friendlyName) {
    if (url.includes("appId=storeCart")) {
      body.friendlyName = "cart-save-for-later-AR";
    } else {
      body.friendlyName = "cart-AR";
    }
  }

  if (headers["X-MS-Market"]) {
    headers["X-MS-Market"] = "AR";
  }

  if (headers["x-ms-market"]) {
    headers["x-ms-market"] = "AR";
  }

  $done({
    headers: headers,
    body: JSON.stringify(body)
  });
} else {
  $done({});
}