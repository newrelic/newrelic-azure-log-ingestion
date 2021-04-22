import { Span, SpanData } from "./span"
import { AttributeMap } from "../attributeMap"
interface CommonSpanData {
    attributes?: AttributeMap
}
interface SpanBatchPayload {
    spans?: SpanData[]
    common?: CommonSpanData
}
export declare const LIMIT = 2000
export declare class SpanBatch implements SpanBatchPayload {
    common?: CommonSpanData
    spans: Span[]
    constructor(attributes?: AttributeMap, spans?: SpanData[])
    addSpan(...spans: Span[]): SpanBatch
    protected getRandomInt(min: number, max: number): number
    getBatchSize(): number
    split(): SpanBatch[]
    private static createNew
}
export {}
