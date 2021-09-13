import { HrTime, SpanAttributes } from "@opentelemetry/api"

/**
 * Represents a timed event.
 * A timed event is an event with a timestamp.
 */
export interface TimedEvent {
    time: HrTime
    /** The name of the event. */
    name: string
    /** The attributes of the event. */
    attributes?: SpanAttributes
}

export default class NrTimedEvent implements TimedEvent {
    attributes: SpanAttributes
    name: string
    time: HrTime

    constructor(name: string, attributes: SpanAttributes, time: HrTime) {
        this.name = name
        this.attributes = attributes
        this.time = time
        return this
    }
}
