import type { Server } from "bun";
import pino from "pino";
import { serverFetch } from "./router";

const PORT = Bun.env['PORT'] ?? ((): number => { throw new Error('PORT environment variable is not set') })()

const IDLE_TIMEOUT_IN_SECONDS = 30

type ObjectToLog = {
    req?: {
        url?: string,
        method?: string,
        headers?: Request['headers'],
    },
    res?: {
        status?: number,
        statusText?: string,
        headers?: Response['headers']
    },
    responseTime?: number
}

export function createServer(): Server {
    const logger = pino()
    const server = Bun.serve({
        port: PORT,
        idleTimeout: IDLE_TIMEOUT_IN_SECONDS,
        fetch: async (req) => {
            const { url, method, headers: headersReq, } = req
            const objectToLog: ObjectToLog = { req: { url, method, headers: headersReq, } }
            logger.info(objectToLog, 'Incoming request')

            const t1 = Date.now()
            const res = await serverFetch(req)
            const t2 = Date.now()

            objectToLog.responseTime = t2 - t1
            const { status, statusText, headers: headersRes, } = res
            objectToLog.res = { status, statusText, headers: headersRes, }
            logger.info(objectToLog, 'Processed request')

            return res
        },
        error(err) {
            logger.error(err, 'An unexpected error occured')
            return new Response(JSON.stringify({err}))
        },
    })
    logger.info('Server started on http://%s:%s !', server.hostname, server.port)
    return server
}

