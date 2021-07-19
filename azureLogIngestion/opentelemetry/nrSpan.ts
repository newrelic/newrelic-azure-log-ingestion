import {
    Exception,
    HrTime,
    Link,
    Span,
    SpanAttributes,
    SpanAttributeValue,
    SpanContext,
    SpanKind,
    SpanStatus,
    TimeInput,
} from "@opentelemetry/api"
import { Resource } from "@opentelemetry/resources"
import { InstrumentationLibrary } from "@opentelemetry/core"
import NrSpanContext from "./nrSpanContext"
import NrTimedEvent from "./nrTime"
import { MultiSpanProcessor } from "@opentelemetry/tracing/build/src/MultiSpanProcessor"

export class NrSpan implements Span {
    name: string
    kind: SpanKind
    _spanContext: NrSpanContext
    parentSpanId?: string
    startTime: HrTime
    endTime: HrTime
    status: SpanStatus
    attributes: SpanAttributes
    links: Link[]
    events: NrTimedEvent[]
    duration: HrTime
    ended: boolean
    resource: Resource
    instrumentationLibrary: InstrumentationLibrary
    _spanLimits: any
    _spanProcessor: MultiSpanProcessor
    _isRecording: boolean

    addEvent(name: string, attributesOrStartTime?: SpanAttributes | TimeInput, startTime?: TimeInput): this {
        const event = new NrTimedEvent(name, attributesOrStartTime, startTime)
        this.events.push(event)
        return this
    }

    end(endTime?: TimeInput): void {
        this.endTime = [Number(endTime), 0]
        this._isRecording = false
    }

    isRecording(): boolean {
        return this._isRecording
    }

    recordException(exception: Exception, time?: TimeInput): void {
        ///
    }

    setAttribute(key: string, value: SpanAttributeValue): this {
        this[key] = value
        return this
    }

    setAttributes(attributes: SpanAttributes): this {
        return undefined
    }

    setStatus(status: SpanStatus): this {
        return undefined
    }

    spanContext(): SpanContext {
        return undefined
    }

    updateName(name: string): this {
        return undefined
    }
}

/*

class NrSpan implements Span {
    parentSpanId: string
    _spanContext: ContextImpl
    updateSpanId(id: string): void {
        this._spanContext.spanId = id
    }
    updateParentSpanId(id: string): void {
        this._spanContext.spanId = id
    }
}

*/
