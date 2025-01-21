/**
 * Cloudflare Worker for Proxying Requests to Target URLs
 * Author: SeRaMo ( https://github.com/seramo/ )
 */

addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
    const url = new URL(request.url);

    // Extract the target URL from the path
    const targetUrl = url.pathname.slice(1); // Remove the leading "/" from the path

    // Validate the target URL to ensure it's a valid URL
    try {
        new URL(targetUrl); // URL validation
    } catch (e) {
        return new Response('Invalid URL provided.', { status: 400 });
    }

    // Clone the incoming request and prepare it for the target URL
    const modifiedRequest = new Request(targetUrl + url.search, {
        method: request.method,
        headers: request.headers,
        body: request.body,
        redirect: 'follow',
    });

    try {
        // Fetch the target URL
        const response = await fetch(modifiedRequest);

        // Return the response from the target server
        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
        });
    } catch (error) {
        return new Response('Error fetching the target URL.', { status: 500 });
    }
}
