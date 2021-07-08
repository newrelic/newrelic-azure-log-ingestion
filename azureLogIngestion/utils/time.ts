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

export const timeStampToHr = (timestamp: string): number => {
    const dateTime = new Date(timestamp)
    return dateTime.getTime() * 1000
}

export const endTimeHrFromDuration = (timestamp: string, duration: string): number => {
    const dateTime = new Date(timestamp)
    const elapsed = convertToMs(duration)
    return (dateTime.getTime() + elapsed) * 1000
}
