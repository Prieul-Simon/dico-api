import type { Server } from "bun";
import { getDefinitions, type Definition } from "./larousse";
import { apiName } from "./macros/constants" with { type: 'macro' };

const API_NAME = apiName()
const PORT = Bun.env['PORT'] ?? ((): number => { throw new Error('PORT environment variable is not set') })()

const IDLE_TIMEOUT_IN_SECONDS = 30
const DEFINITION_PATHNAME = "/definitions/"

export function createServer(): Server {
    const server = Bun.serve({
        port: PORT,
        idleTimeout: IDLE_TIMEOUT_IN_SECONDS,
        fetch: serverFetch,
    })
    console.info('Server started on http://%s:%s !', server.hostname, server.port)
    return server
}

export async function serverFetch(req: Request) {
    const url = new URL(req.url)
    if (url.pathname === "/") return new Response(`${API_NAME}\n`)
    if (url.pathname === "/_/test_stacktrace") {
        throwErrorAndLogStacktrace()
        return new Response('Server is logging a stacktrace to test built code is well source-mapped\n')
    }

    if (url.pathname.startsWith(DEFINITION_PATHNAME)
        && url.pathname.substring(DEFINITION_PATHNAME.length) !== ""
        && !url.pathname.substring(DEFINITION_PATHNAME.length).includes("/")) {
        const word = url.pathname.substring(DEFINITION_PATHNAME.length)
        const definition = await getDefinitions(word)
        return toDefinitionResponse(definition)
    }

    return new Response("404 Not Found\n", {
        status: 404
    })
}

function toDefinitionResponse(definition: Definition): Response {
    return new Response(JSON.stringify(definition), {
        headers: {
            "Content-Type": "application/json",
        },
    })
}

function throwErrorAndLogStacktrace(): void {
    function wrapping() {
        try {
            func1()
        } catch (err) {
            throw new Error('Wrapping error: ', {
                cause: err,
            })
        }
    }
    function func1() {
        try {
            return func2()
        } catch (err) {
            throw err
        }
    }
    function func2() {
        return func3()
    }
    function func3() {
        (() /* is anonymous */ => {
            // @ts-ignore
            (null).toString()
        })()
    }
    try {
        return wrapping()
    } catch (err) {
        console.error('Test logging stacktrace: ', err)
    }
}
