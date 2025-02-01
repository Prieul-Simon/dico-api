import { load, type CheerioAPI } from "cheerio"
import { getFromCache, maybeCache } from "./cache"
import axios from "axios"
import { Agent } from "https"

const WEB_URL = "https://www.larousse.fr/dictionnaires/francais/"
const ABORT_TIMEOUT_IN_MILLISECONDS = 15_000
const DEFINITION_CSS_SELECTOR = 'article.BlocDefinition ul.Definitions li.DivisionDefinition'
const ITEM_WORD_CSS_SELECTOR = 'div.item-word.sel'
const END_ITEM_WORD = '-'

const axiosInstance = axios.create({
    baseURL: WEB_URL,
    timeout: ABORT_TIMEOUT_IN_MILLISECONDS,
    responseEncoding: 'utf8',
    maxRedirects: 10,
    httpsAgent: new Agent({
        keepAlive: true,
    }),
    headers: {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:134.0) Gecko/20100101 Firefox/134.0'
    }
})

export interface Definition {
    words: string[]
    definitions: string[]
}
const emptyDefinition = (word: string): Definition => ({
    words: [word],
    definitions: [],
})

export async function getDefinitions(word: string): Promise<Definition> {
    const fromCache = await getFromCache(word)
    if (fromCache) return fromCache

    const definition = await computeDefinition(word)
    if ('err' in definition) {
        console.error('Error while fetching definition for %s: ', word, definition.err)
        return emptyDefinition(word)
    }
    await maybeCache(word, definition)
    return definition
}

async function computeDefinition(word: string): Promise<Definition | { err: unknown }> {
    const url = word.toLowerCase()

    try {
        const axiosResponse = await axiosInstance.get<string>(`/${url}`, {
            responseType: 'text',
        })
        if (axiosResponse.status !== 200) return { err: `Status code: ${axiosResponse.status}` }
        if (typeof axiosResponse.data !== 'string') return { err: 'Response is not a string' }
        
        const html = axiosResponse.data
        const $ = load(html)
        const redirectedWords = extractRedirectedWords($)
        const texts = $(DEFINITION_CSS_SELECTOR)
            .map((_, el) => $(el).text())
            .get()
            .map(sanitize)
        const definition = {
            words: redirectedWords,
            definitions: texts,
        }
        return definition
    }
    catch (err) {
        return { err }
    }
}

function extractRedirectedWords($: CheerioAPI): string[] {
    let text = $(ITEM_WORD_CSS_SELECTOR).text()
    if (text.endsWith(END_ITEM_WORD)) {
        text = text.slice(0, -END_ITEM_WORD.length)
    }
    return text.split(',')
        .map(sanitize)
}

function sanitize(word: string): string {
    return word
        .trim()
        .replaceAll('\\n+', '\n')
        .replaceAll('\\t+', '\t')
}