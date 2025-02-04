import { getDefinitions, type Definition } from "../larousse";
import { URL } from 'node:url';

const DEFINITION_PATHNAME = "/definitions/"

export async function definitions(url: URL): Promise<Response | false> {
    if (url.pathname.startsWith(DEFINITION_PATHNAME)
        && url.pathname.substring(DEFINITION_PATHNAME.length) !== ""
        && !url.pathname.substring(DEFINITION_PATHNAME.length).includes("/")) {
        const word = url.pathname.substring(DEFINITION_PATHNAME.length)
        const definition = await getDefinitions(word)
        return toDefinitionResponse(definition)
    }
    return false
}

function toDefinitionResponse(definition: Definition): Response {
    return new Response(JSON.stringify(definition), {
        headers: {
            "Content-Type": "application/json",
        },
    })
}