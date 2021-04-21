import { AttributeMap } from "../attributeMap"
export interface SpanData {
    id: string
    "trace.id": string
    timestamp: number
    attributes?: AttributeMap
}
export declare class Span implements SpanData {
    id: string
    "trace.id": string
    timestamp: number
    attributes?: AttributeMap
    constructor(
        id: string,
        traceId: string,
        timestamp: number,
        name?: string,
        parentId?: string,
        serviceName?: string,
        durationMs?: number,
        attributes?: AttributeMap,
    )
}
