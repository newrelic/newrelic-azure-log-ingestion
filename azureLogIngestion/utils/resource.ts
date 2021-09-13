// import { hash64 } from "farmhash"
// TODO: replace with platform-independent hashing, or update build pipeline for farmhash
const hash64 = (input: Buffer) => ""
const urlSafeChars = { "+": "-", "/": "_", "=": "" }

/**
 * Hashes an Azure Resource ID into  a New Relic Entity GUID
 */
export function hash(accountId: number, domain: string, type: string, resourceId: string): string {
    const resourceHash = hash64(new Buffer(resourceId))
    return new Buffer(`${accountId}|${domain}|${type}|${resourceHash}`)
        .toString("base64")
        .replace(/[\+\/=]/, (c) => urlSafeChars[c])
}

export interface Resource {
    subscription: string
    resourceGroup: string
    provider: string
    resourceType: string
    resourceName: string
}

/**
 * Parses an Azure Resource ID into its respective parts
 */
export function parse(resourceId: string): Resource {
    const [, , subscription, , resourceGroup, , provider, resourceType, resourceName] = resourceId.split("/")
    return { subscription, resourceGroup, provider, resourceType, resourceName }
}

export function sanitizeOpName(name: string): string {
    const ptn = /^.*\/api\/([a-zA-Z0-9_-]+)/
    const opCheck = name.match(ptn)
    if (opCheck) {
        return opCheck[1]
    }
    return name
}
