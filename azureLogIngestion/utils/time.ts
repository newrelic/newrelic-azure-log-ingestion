export const convertToMs = (interval: string): number => {
    const scale = String(interval).match(/[a-zA-Z]+/g)
    const intervalNumber = String(interval).match(/[0-9.]+/g)
    let ms
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
    }
    return ms
}

export const endTimeFromDuration = (timestamp: string, duration: string): Date => {
    const dateTime = new Date(timestamp).getTime()
    const elapsed = convertToMs(duration)
    const endMs = dateTime + elapsed
    return new Date(dateTime + elapsed)
}
