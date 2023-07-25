/** 
     * @private
     */
 export async function getJson(url) {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, { signal: controller.signal });

    if (response.status >= 400) {
        return Promise.reject({
            status: response.status,
            message: response.statusText,
            body: response.data
        });
    }
    if (response.status >= 200 && response.status <= 202) {
        const json = await response.json();
        return json;
    }
    return {};
}

export function encodeAndJoin(items, separator = " OR "){
    let encodedItems= items.map(it => encodeURIComponent('"' + it + '"'));
    return encodedItems.join("OR");
}