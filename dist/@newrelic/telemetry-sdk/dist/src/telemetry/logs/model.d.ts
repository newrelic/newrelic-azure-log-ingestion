import { AttributeMap } from "../attributeMap"
interface CommonLogAttrs {
    attributes: AttributeMap
}
interface LogMessage {
    message: string
    timestamp: number
    attributes?: AttributeMap
}
export declare class Log implements LogMessage {
    message: string
    attributes?: AttributeMap
    timestamp: number
    constructor(message: string, timestamp?: number, attributes?: AttributeMap)
}
export declare class LogBatch {
    common?: CommonLogAttrs
    logs: LogMessage[]
    constructor(logs: LogMessage[], attributes?: AttributeMap)
    append(message: LogMessage): void
}
export {}
