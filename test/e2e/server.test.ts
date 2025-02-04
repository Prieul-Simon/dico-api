import { describe, expect, test } from "bun:test";
import { apiName } from "../../src/macros/constants" with { type: 'macro' };
import { serverFetch } from "../../src/router";

const TEST_SERVER_URL = 'http://unexisting.host'
const API_NAME = apiName()

describe('Test server root', () => {
    test('Root', async () => {
        const expectedString = `${API_NAME}\n`

        const actualResponse = await serverFetch(new Request(`${TEST_SERVER_URL}/`))
        const actualText = await actualResponse.text()
        expect(actualText).toBe(expectedString)
    })

    test('404', async () => {
        const expectedString = '404 Not Found\n'
        const actualResponse = await serverFetch(new Request(`${TEST_SERVER_URL}/unexisting-page`))
        const actualText = await actualResponse.text()
        expect(actualText).toBe(expectedString)
    })
})

