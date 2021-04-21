import { Event, EventData } from "./event"
import { AttributeMap } from "../attributeMap"
interface CommonEventData {
    attributes?: AttributeMap
}
interface EventBatchPayload {
    events?: EventData[]
    common?: CommonEventData
}
export declare const LIMIT = 2000
export declare class EventBatch implements EventBatchPayload {
    common?: CommonEventData
    events: Event[]
    constructor(attributes?: AttributeMap, events?: EventData[])
    addEvent(...events: Event[]): EventBatch
    protected getRandomInt(min: number, max: number): number
    getBatchSize(): number
    split(): EventBatch[]
    private static createNew
    flattenData(): AttributeMap[]
}
export {}
