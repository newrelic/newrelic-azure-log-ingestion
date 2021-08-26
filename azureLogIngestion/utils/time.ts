import { Context as AzureContext } from "@azure/functions"
import { timeInputToHrTime } from "@opentelemetry/core"
import { HrTime } from "@opentelemetry/api"

// performance counter intervals come with a scale string appended
export const convertToMs = (interval: string): number => {
    const scale = String(interval).match(/[a-zA-Z]+/g)
    const intervalNumber = String(interval).match(/[0-9.]+/g)
    let ms
    if (!interval) {
        return 0
    }
    if (!scale) {
        return Number(interval)
    }
    const units = scale[0].toLowerCase()
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

export const endTimeFromDuration = (timestamp: string, duration: string): HrTime => {
    const dateTime = new Date(timestamp).getTime()
    const elapsed = convertToMs(duration)
    const endTime = new Date(dateTime + elapsed)
    return timeInputToHrTime(endTime)
}
