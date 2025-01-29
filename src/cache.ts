// TODO replace this by a Redis service

import QuickLRU from "quick-lru";
import type { Definition } from "./larousse";

const DEFINITIONS_CACHE = new QuickLRU<string, Definition>({
    maxSize: 1000,
})

export function maybeCache(word: string, definition: Definition) : Definition {
    if (!DEFINITIONS_CACHE.has(word)) {
        DEFINITIONS_CACHE.set(word, definition)
    }
    return definition
}

export function getFromCache(word: string): Definition | undefined {
    return DEFINITIONS_CACHE.get(word)
}

