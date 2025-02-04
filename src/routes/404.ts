export function notFound(): Response {
    return new Response("404 Not Found\n", {
        status: 404
    })
}