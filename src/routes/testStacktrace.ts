import { URL } from 'node:url'

export async function testStacktrace(url: URL): Promise<Response | false> {
    if (url.pathname === "/_/test_stacktrace") {
        throwErrorAndLogStacktrace()
        return new Response('Server is logging a stacktrace to test built code is well source-mapped\n')
    }
    if (url.pathname === "/_/test_async_stacktrace") {
        asyncThrowErrorAndLogStacktrace()
        return new Response('Server is logging an async stacktrace to test built code is well source-mapped\n')
    }
    return false
}

async function asyncThrowErrorAndLogStacktrace(): Promise<void> {
    async function wrapping() {
        try {
            await Bun.sleep(1)
            await func1()
        } catch (err) {
            throw new Error('Wrapping error: ', {
                cause: err,
            })
        }
    }
    async function func1() {
        try {
            await Bun.sleep(1)
            return await func2()
        } catch (err) {
            throw err
        }
    }
    async function func2() {
        await Bun.sleep(1)
        return await func3()
    }
    async function func3() {
        await Bun.sleep(1)
        ;(() /* is anonymous */ => {
            // @ts-ignore
            (null).toString()
        })()
    }
    try {
        await Bun.sleep(1)
        return await wrapping()
    } catch (err) {
        console.error('Test logging stacktrace: ', err)
    }
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
        // await Bun.sleep(1)
        return wrapping()
    } catch (err) {
        console.error('Test logging stacktrace: ', err)
    }
}