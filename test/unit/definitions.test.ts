import { beforeAll, describe, expect, test, } from "bun:test";
import { getDefinitions } from "../../src/larousse";
import { getFromCache, onRedisClientReady } from "../../src/cache";

const EMPTY_STRING_SET = new Set<string>()

beforeAll(async () => {
    await onRedisClientReady()
})

describe('Test retrieving definitions for a given word', () => {
    test("getDefinitions() with existing word", async () => {
        const expectedWords = new Set(['wou', 'wu'])
        const expectedDefinitions = new Set(['Dialecte chinois parlé au Jiangsu (au sud du Yangzi Jiang) et dans la plus grande partie du Zhejiang.'])
        let actual = await getDefinitions('wus')

        expect(new Set(actual.words)).toEqual(expectedWords)
        expect(new Set(actual.definitions)).toEqual(expectedDefinitions)

        let fromCache = await getFromCache('wu')
        expect(fromCache).toBeDefined()
        actual = await getDefinitions('wu')

        expect(new Set(actual.words)).toEqual(expectedWords)
        expect(new Set(actual.definitions)).toEqual(expectedDefinitions)

        fromCache = await getFromCache('wou')
        expect(fromCache).toBeDefined()
        actual = await getDefinitions('wou')

        expect(new Set(actual.words)).toEqual(expectedWords)
        expect(new Set(actual.definitions)).toEqual(expectedDefinitions)
    })

    test("getDefinitions() with empty word", async () => {
        const expectedWords = EMPTY_STRING_SET
        const expectedDefinitions = EMPTY_STRING_SET
        const actual = await getDefinitions('')

        expect(new Set(actual.words)).toEqual(expectedWords)
        expect(new Set(actual.definitions)).toEqual(expectedDefinitions)
    })

    test("getDefinitions() with unexisting word", async () => {
        const expectedWords = EMPTY_STRING_SET
        const expectedDefinitions = EMPTY_STRING_SET
        const actual = await getDefinitions('azertyuiop1234')

        expect(new Set(actual.words)).toEqual(expectedWords)
        expect(new Set(actual.definitions)).toEqual(expectedDefinitions)
    })
})
