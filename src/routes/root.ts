import { URL } from 'node:url';
import { apiName } from '../macros/constants' with { type: 'macro' };

const API_NAME = apiName()

export function root(url: URL): Response | false {
    if (url.pathname === "/") return new Response(`${API_NAME}\n`)
    return false
}