import type { Server } from "bun";
import { serverFetch } from "./router";

const PORT = Bun.env['PORT'] ?? ((): number => { throw new Error('PORT environment variable is not set') })()

const IDLE_TIMEOUT_IN_SECONDS = 30

export function createServer(): Server {
    const server = Bun.serve({
        port: PORT,
        idleTimeout: IDLE_TIMEOUT_IN_SECONDS,
        fetch: serverFetch,
    })
    console.info('Server started on http://%s:%s !', server.hostname, server.port)
    return server
}

