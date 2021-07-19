import { TimedEvent } from "@opentelemetry/tracing/build/src/TimedEvent"
import { HrTime, SpanAttributes } from "@opentelemetry/api"

export default class NrTimedEvent implements TimedEvent {
    attributes: SpanAttributes
    name: string
    time: HrTime
    constructor(name, attributes, time) {
        this.name = name
        this.attributes = attributes
        this.time = time
        return this
    }
}
