import { notFound } from "./routes/404";
import { definitions } from "./routes/definitions";
import { root } from "./routes/root";
import { testStacktrace } from "./routes/testStacktrace";

export async function serverFetch(req: Request): Promise<Response> {
    const url = new URL(req.url)
    let response: Response | false

    response = root(url)
    if (response !== false) return response

    response = await testStacktrace(url)
    if (response !== false) return response

    response = await definitions(url)
    if (response !== false) return response

    return notFound()
}
