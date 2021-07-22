import { Context, TraceFlags, TraceState } from "@opentelemetry/api"

export default class NrSpanContext implements Context {
    traceId: string
    spanId: string
    traceFlags: TraceFlags
    traceState: TraceState
    attributes: any

    constructor(config: any) {
        this.traceId = config.traceId
        this.spanId = config.spanId
        this.traceFlags = config.traceFlags
        this.traceState = config.traceState
        this.attributes = config.attributes
    }

    deleteValue(key: symbol): NrSpanContext {
        delete this[key]
        return this
    }

    getValue(key: symbol): any {
        return this[key]
    }

    setValue(key: symbol, value: unknown): NrSpanContext {
        this[key] = value
        return this
    }
}
