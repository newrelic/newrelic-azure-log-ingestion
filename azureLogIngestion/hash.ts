import { hash64 } from "farmhash"

const urlSafeChars = { "+": "-", "/": "_", "=": "" }

function hash(accountId: number, domain: string, type: string, resourceId: string): string {
    const resourceHash = hash64(new Buffer(resourceId))
    return new Buffer(`${accountId}|${domain}|${type}|${resourceHash}`)
        .toString("base64")
        .replace(/[\+\/=]/, (c) => urlSafeChars[c])
}

export default hash
