import { Context as AzureContext } from "@azure/functions"

export const convertToMs = (interval: string, ctx?: AzureContext): number => {
    const scale = String(interval).match(/[a-zA-Z]+/g)
    const intervalNumber = String(interval).match(/[0-9.]+/g)
    let ms
    if (!interval) {
        return 0
    }
    if (!scale) {
        // ctx.log("no scale", interval)
        return Number(interval)
    }
    const units = scale[0].toLowerCase()
    // ctx.log(`UNITS ${units}`, interval, scale[0])
    if (units === "ms") {
        ms = Number(intervalNumber[0])
    } else if (units === "s") {
        ms = Number(intervalNumber[0]) * 1000
    } else if (units === "m") {
        ms = Number(intervalNumber[0]) * 1000 * 60
    } else {
        return Number(interval)
    }
    return ms
}

export const endTimeFromDuration = (timestamp: string, duration: string, ctx?: AzureContext): Date => {
    const dateTime = new Date(timestamp).getTime()
    const elapsed = convertToMs(duration, ctx)
    return new Date(dateTime + elapsed)
}
