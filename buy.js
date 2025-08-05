if ($request.method.toUpperCase() !== "OPTIONS") {
    let storedCartId = $persistentStore.read("cartId");

    if (storedCartId) {
        let headers = $request.headers;
        let body = JSON.parse($request.body);

        if (body.cartId) {
            body.cartId = storedCartId;
            $notification.post("Cart ID 替换成功", `使用 Cart ID: ${storedCartId}`, "");
        } else {
            $notification.post("Cart ID 替换失败", "请求体中未找到 cartId", "");
            console.log("请求体中未找到 cartId，此请求可能不需要替换");
        }

        $done({
            body: JSON.stringify(body)
        });
    } else {
        $notification.post("Cart ID 提取失败", "没有存储的 cartId 可用于替换", "");
        console.log("没有存储的 cartId 可用");
        $done({});
    }
} else {
    $done({});
}
