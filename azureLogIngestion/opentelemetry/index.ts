import { Context as AzureContext } from "@azure/functions"
import opentelemetry, {
    Context as OtContext,
    SpanStatusCode,
    SpanKind,
    TraceFlags,
    Span,
    SpanContext,
    HrTime,
    SpanStatus,
    SpanAttributes,
    Link,
    TraceState,
    ContextAPI,
} from "@opentelemetry/api"
import { BatchSpanProcessor } from "@opentelemetry/tracing"
import { Resource } from "@opentelemetry/resources"
import { ResourceAttributes } from "@opentelemetry/semantic-conventions"

import { CollectorTraceExporter } from "@opentelemetry/exporter-collector"

import { NRTracerProvider } from "./provider"
import { timeStampToHr, endTimeHrFromDuration } from "../utils/time"

const debug = process.env["DEBUG"] || false

import {
    normalizeAppAvailabilityResult,
    normalizeAppBrowserTiming,
    normalizeAppDependency,
    normalizeAppEvent,
    normalizeAppTrace,
    normalizeAppException,
    normalizeAppPageView,
    normalizeAppRequest,
    normalizeAppPerformanceCounter,
    normalizeAppMetrics,
} from "../mappings"
import * as _ from "lodash"
import { opentelemetryProto } from "@opentelemetry/exporter-collector/build/esm/types"
import { parse } from "../utils/resource"

interface Records {
    records: Record<string, any>[]
}

class ContextImpl implements OtContext {
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

    deleteValue(key: symbol): ContextImpl {
        delete this[key]
        return this
    }

    getValue(key: symbol): any {
        return this[key]
    }

    setValue(key: symbol, value: unknown): ContextImpl {
        this[key] = value
        return this
    }
}

class SpanContextImpl implements SpanContext {
    isRemote: boolean
    spanId: string
    traceFlags: number
    traceId: string
    traceState: TraceState
}

const traceMap = {
    name: "name",
    attributes: "spanAttributes",
    parentId: "parentSpanId",
}

const loggableSpan = (span: Span): any => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const s: {
        instrumentationLibrary: opentelemetryProto.common.v1.InstrumentationLibrary
        resource: Resource
        kind: SpanKind
        parentSpanId: string
        duration: [number, number]
        name: string
        ended: boolean
        spanContext: () => SpanContext
        startTime: [number, number]
        attributes: SpanAttributes
        links: any
        endTime: [number, number]
        events: any
        status: SpanStatus
    } = { ...span }
    return {
        name: s.name,
        kind: s.kind,
        spanContext: s.spanContext,
        parentSpanId: s.parentSpanId,
        startTime: s.startTime,
        endTime: s.endTime,
        status: s.status,
        attributes: s.attributes,
        links: s.links,
        events: s.events,
        duration: s.duration,
        ended: s.ended,
        resource: s.resource,
        instrumentationLibrary: s.instrumentationLibrary,
    }
}

export default class OpenTelemetryAdapter {
    spanProcessor: BatchSpanProcessor
    traceProvider: NRTracerProvider
    currentBatch: Array<Span>

    constructor(apiKey: string) {
        const traceExporter = new CollectorTraceExporter({
            headers: { "api-key": apiKey },
            url:
                process.env.NEW_RELIC_REGION === "eu"
                    ? "https://otlp.eu01.nr-data.net:4317/v1/traces"
                    : "https://otlp.nr-data.net:4317/v1/traces",
        })

        // initializing with a service name which we'll override for each span
        this.traceProvider = new NRTracerProvider({
            resource: new Resource({
                [ResourceAttributes.SERVICE_NAME]: "newrelic-azure-log-ingestion",
            }),
        })
        this.spanProcessor = new BatchSpanProcessor(traceExporter, {
            // The maximum queue size. After the size is reached spans are dropped.
            maxQueueSize: 1000,
        })
        this.traceProvider.addSpanProcessor(this.spanProcessor)
        this.traceProvider.register()
        this.currentBatch = []
    }

    private determineMessageTypeProcessor(message: any, context: AzureContext): void {
        const type = message.Type || message.itemType

        if (!type) {
            return
        }

        if (["AppRequests", "requests"].includes(type)) {
            context.log("App request")
            const request = normalizeAppRequest(message)
            this.addSpan(request, context)
        }

        if (["AppDependencies", "dependencies"].includes(type)) {
            context.log("App dependency")
            this.addSpan(normalizeAppDependency(message), context)
        }

        if (["AppEvents", "customEvents"].includes(type)) {
            context.log("App events")
            const event = normalizeAppEvent(message)
            this.addSpan(event, context)
        }

        if (["AppExceptions", "exceptions"].includes(type)) {
            context.log("App exceptions")
            const exception = normalizeAppException(message)
            this.addSpan(exception, context)
        }

        if (["AppPageViews", "pageViews"].includes(type)) {
            context.log("App page views")
            const pageView = normalizeAppPageView(message)
            this.addSpan(pageView, context)
        }

        if (["AppAvailabilityResults", "availabilityResults"].includes(type)) {
            context.log("App availability results")
            const availabilityResult = normalizeAppAvailabilityResult(message)
            this.addSpan(availabilityResult, context)
        }

        if (["AppBrowserTimings", "browserTimings"].includes(type)) {
            context.log("App browser timings")
            const browserTiming = normalizeAppBrowserTiming(message)
            this.addSpan(browserTiming, context)
        }
    }

    /**
     * Identifies messages and hands them off to the appropriate processor
     *
     * There may be situations where a message corresponds to more than one
     * type of telemetry. In this case, the switch/case may not make sense.
     */
    processMessages(messages: string | string[], context: AzureContext): void {
        const messageArray = _.isArray(messages) ? messages : [messages]
        messageArray.forEach((message) => {
            let records: Records

            try {
                records = JSON.parse(message)
            } catch (err) {
                context.log.error(`Error parsing JSON: ${err}`)
                if (debug) {
                    context.log(messages)
                }
                return
            }

            if (debug) {
                context.log("All messages: ", records.records)
                context.log("All messages length: ", records.records.length)
            }

            records.records.forEach((m) => {
                return this.determineMessageTypeProcessor(m, context)
            }, this)
        }, this)
    }

    private createContext(appSpan: Record<string, any>, ctx: AzureContext): ContextImpl {
        // let obj: { traceId: string; spanId: string; traceFlags: TraceFlags; traceState: any; attributes: any }
        // eslint-disable-next-line prefer-const
        ctx.log(`creating context ${appSpan.id} ${appSpan.parentId}`)
        return new ContextImpl({
            traceId: appSpan.parentId || ctx.traceContext.traceparent,
            spanId: appSpan.id,
            traceFlags: 0,
            traceState: ctx.traceContext.tracestate,
            attributes: ctx.traceContext.attributes,
        })
    }

    addSpan(appSpan: Record<any, any>, context: AzureContext): void {
        context.log(`In AddSpan ${appSpan.id}`)
        const resourceId = _.get(appSpan, "resourceId", null)
        const resourceName = resourceId ? parse(resourceId).resourceName : null
        context.log(`resource id ${resourceId}`)
        context.log(`resource name ${resourceName}`)
        this.traceProvider.resource = new Resource({
            [ResourceAttributes.SERVICE_NAME]: `${resourceName}_otlp`,
        })
        const ctx = this.createContext(appSpan, context)
        context.log(`createContext ${ctx}`)

        const span = this.traceProvider.getTracer("default").startSpan(
            appSpan.name,
            {
                startTime: timeStampToHr(appSpan.timestamp),
                kind: SpanKind.INTERNAL,
            },
            ctx,
        )
        context.log("SPAN CREATED ********")
        context.log(span)
        context.log("SPAN CREATED ********")

        if (appSpan.type === "AppExceptions" || appSpan.ExceptionType) {
            const message = appSpan.innermostMessage || appSpan.outerMessage
            span.setStatus({ code: SpanStatusCode.ERROR, message })
            span.recordException(
                { message: message, name: appSpan.assembly, stack: appSpan.details },
                timeStampToHr(appSpan.timestamp),
            )
        } else {
            span.setStatus({ code: SpanStatusCode.OK })
        }
        // TODO: handle Links and Events
        for (const prop in appSpan) {
            if (traceMap[prop] && appSpan.hasOwnProperty(prop)) {
                span.setAttribute(traceMap[prop], appSpan[prop])
            }
        }
        context.log("about to end span")
        span.end(endTimeHrFromDuration(appSpan.timestamp, appSpan.durationMs))
        // OT batch processor doesn't give access to current batch size
        // or batch content. This lets us do snapshot tests.
        const spanRecord = process.env["otelJestTests"] ? loggableSpan(span) : appSpan.id
        context.log(`span ended! ${span}`)
        this.currentBatch.push(spanRecord)
    }

    sendBatches(context: AzureContext): void {
        context.log("Sending batches")
        const processors = []
        processors.push(this.traceProvider.forceFlush())
        Promise.allSettled(processors).then((results) => {
            results
                .filter((result) => result.status === "rejected")
                .map((result: PromiseRejectedResult) =>
                    context.log(`Error occurred while sending telemetry to New Relic: ${result.reason}`),
                )
        })
    }

    getBatchSize(): number {
        return this.currentBatch.length
    }

    resetBatch(): void {
        this.currentBatch.length = 0 // truncate
    }

    shutdown(): void {
        const processors = []
        processors.push(this.traceProvider.shutdown())
        this.resetBatch()
        Promise.allSettled(processors)
    }
}
