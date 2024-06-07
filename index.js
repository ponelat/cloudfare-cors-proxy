export default {
  async fetch(request) {
    const ALLOWED_METHODS = ['GET', 'HEAD', 'OPTIONS', 'POST', 'PUT', 'DELETE']
    const CORS_HEADERS = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": ALLOWED_METHODS.join(','),
      "Access-Control-Max-Age": "86400",
      // This is handled dynamically, but we can hardcoded it too
      // "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept, Authorization",
    };

    const url = new URL(request.url);

    // Path isn't / or empty? Return usage
    if (url.pathname !== "/" && url.pathname !== '') {
      console.log('Warn: Pathname !== / or ""')
      return usageResponse(request)
    }

    // No search? Return usage
    if (url.search.length < 2) {
      console.log('Warn: Search < 2 chars')
      return usageResponse(request)
    }

    // Handle CORS preflight requests
    if (request.method === "OPTIONS") {
      return handleOptions(request);
    }

    // Checked allowable methods
    if (!ALLOWED_METHODS.includes(request.method)) {
      console.log('Warn: Method not allowed')
      return new Response(null, {
	status: 405,
	statusText: "Method Not Allowed",
      })
    }

    // Proxy request
    return handleRequest(request);

    // -------- Functions...

    function usageResponse(request) {
      const url = new URL(request.url)
      const resObj = JSON.stringify({
        "usage": `${url.origin}/?encodeURIComponent(<url>)`,
        search: url.search,
        pathname: url.pathname,
      }, null, 2)
      console.warn("Usage: ", resObj)
      return new Response(resObj, {status: 500});
    }

    async function handleRequest(request) {
      const targetUrl = new URL(getTargetUrl(request.url))
      const origin = request.headers.get("Origin")

      // Rewrite request to point to API URL. This also makes the request mutable
      // so you can add the correct Origin header to make the API server think
      // that this request is not cross-site.
      const newRequest = new Request(targetUrl.href, request);
      newRequest.headers.set("Origin", targetUrl.origin);

      // Recreate the response so you can modify the headers
      let response = await fetch(newRequest);
      response = new Response(response.body, response);

      // Set CORS headers
      response.headers.set("Access-Control-Allow-Origin", origin);

      // Append to/Add Vary header so browser will cache response correctly
      response.headers.append("Vary", "Origin");

      return response;
    }

    function getTargetUrl(url) {
      url = new URL(url)
      // Grab the search and remove the '?'
      const targetUrlEncoded = url.search.slice(1) 
      // Decode
      return decodeURIComponent(targetUrlEncoded)
    }

    async function handleOptions(request) {
      if (
        request.headers.get("Origin") !== null &&
        request.headers.get("Access-Control-Request-Method") !== null &&
        request.headers.get("Access-Control-Request-Headers") !== null
      ) {
        // Handle CORS preflight requests.
        return new Response(null, {
          headers: {
            ...CORS_HEADERS,
            "Access-Control-Allow-Headers": request.headers.get(
              "Access-Control-Request-Headers"
            ),
          },
        });
      } else {
        // Handle standard OPTIONS request.
        return new Response(null, {
          headers: {
            Allow: "GET, HEAD, POST, PUT, DELETE, OPTIONS",
          },
        });
      }
    }


  },
};
