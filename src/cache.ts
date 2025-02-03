import { createClient } from "redis";
import type { Definition } from "./larousse";

const REDIS_URL: string = Bun.env['REDIS_URL'] ?? ((): string => { throw new Error('REDIS_URL environment variable is not set') })()
const REDIS_KEY_PREFIX = 'dicoapi'
const REDIS_KEY_ENVIRONMENT = Bun.env['REDIS_KEY_ENVIRONMENT'] ?? ((): string => { throw new Error('REDIS_KEY_ENVIRONMENT environment variable is not set') })()
const REDIS_KEY_DEFINITIONS = 'definitions'
const DEFAULT_WORD = 'Scrabble'

type RedisClient = Awaited<ReturnType<typeof createClient>>
let redisClient: RedisClient = null as unknown as RedisClient
let redisClientPromise: Promise<RedisClient> = createClient({
    url: `redis://${REDIS_URL}`,
})
    .on('error', (err) => console.error('Redis Client Error', err))
    .connect()
redisClientPromise.then((client) => { redisClient = client })

export async function onRedisClientReady(): Promise<void> {
    await redisClientPromise
    return
}

export async function maybeCache(word: string, definition: Definition): Promise<Definition> {
    const definitionAsString = JSON.stringify(definition)
    for (const altWord of [word, ...definition.words]) {
        const key = computeKey(altWord)
        if (await redisClient.exists(key) !== 1) {
            await redisClient.set(key, definitionAsString)
        }
    }
    return definition
}

export async function getFromCache(word: string): Promise<Definition | undefined> {
    const key = computeKey(word)
    const redisValue = await redisClient.get(key)
    if (redisValue === null) return undefined
    return JSON.parse(redisValue)
}

function computeKey(word: string): string {
    return `${REDIS_KEY_PREFIX}:${REDIS_KEY_ENVIRONMENT}:${REDIS_KEY_DEFINITIONS}:${word ?? DEFAULT_WORD}`
}

