import { describe, expect, test } from "bun:test";
import { serverFetch } from "../../src/server";

const TEST_SERVER_URL = 'http://unexisting.host'

describe('Test server root', () => {
    test('Root', async () => {
        const expectedString = `
  ____   ____ ____      _    ____  ____  _     _____   ____ ___ ____ ___       _    ____ ___ 
 / ___| / ___|  _ \\    / \\  | __ )| __ )| |   | ____| |  _ \\_ _/ ___/ _ \\     / \\  |  _ \\_ _|
 \\___ \\| |   | |_) |  / _ \\ |  _ \\|  _ \\| |   |  _|   | | | | | |  | | | |   / _ \\ | |_) | | 
  ___) | |___|  _ <  / ___ \\| |_) | |_) | |___| |___  | |_| | | |__| |_| |  / ___ \\|  __/| | 
 |____/ \\____|_| \\_\\/_/   \\_\\____/|____/|_____|_____| |____/___\\____\\___/  /_/   \\_\\_|  |___|
                                                                                             
`.substring(1) // remove first newline

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

