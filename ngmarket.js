if ($request.method.toUpperCase() !== "OPTIONS") {
  let body = JSON.parse($request.body);
  let headers = $request.headers;
  let url = $request.url;

  if (body.market) {
    body.market = "NG";
  }

  if (body.locale) {
    body.locale = "en-NG";
  }

  if (body.friendlyName) {
    if (url.includes("appId=storeCart")) {
      body.friendlyName = "cart-save-for-later-NG";
    } else {
      body.friendlyName = "cart-NG";
    }
  }

  if (headers["X-MS-Market"]) {
    headers["X-MS-Market"] = "NG";
  }

  if (headers["x-ms-market"]) {
    headers["x-ms-market"] = "NG";
  }

  $done({
    headers: headers,
    body: JSON.stringify(body)
  });
} else {
  $done({});
}
