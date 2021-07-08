import { Context } from "@azure/functions"
import opentelemetry, { SpanStatusCode, SpanKind, TraceFlags, Span } from "@opentelemetry/api"
import { BasicTracerProvider, BatchSpanProcessor } from "@opentelemetry/tracing"
import { CollectorTraceExporter } from "@opentelemetry/exporter-collector"
import { timeStampToHr, endTimeHrFromDuration, convertToMs } from "../utils/time"

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

interface Records {
    records: Record<string, any>[]
}

const traceMap = {
    name: "name",
    attributes: "spanAttributes",
    parentId: "parentSpanId",
}

export default class OpenTelemetryAdapter {
    spanProcessor: BatchSpanProcessor
    traceProvider: BasicTracerProvider
    currentBatch: Array<Span>

    constructor(apiKey: string) {
        const traceExporter = new CollectorTraceExporter({
            headers: { "api-key": apiKey },
            url:
                process.env.NEW_RELIC_REGION === "eu"
                    ? "https://otlp.eu01.nr-data.net:4317/v1/traces"
                    : "https://otlp.nr-data.net:4317/v1/traces",
        })

        this.traceProvider = new BasicTracerProvider()
        this.spanProcessor = new BatchSpanProcessor(traceExporter, {
            // The maximum queue size. After the size is reached spans are dropped.
            maxQueueSize: 1000,
        })
        this.traceProvider.addSpanProcessor(this.spanProcessor)
        this.traceProvider.register()
        this.currentBatch = []
    }

    private determineMessageTypeProcessor(message: any, context: Context): void {
        const type = message.Type || message.itemType

        if (!type) {
            return
        }

        if (["AppRequests", "requests"].includes(type)) {
            const request = normalizeAppRequest(message)
            this.addSpan(request, context)
        }

        if (["AppDependencies", "dependencies"].includes(type)) {
            this.addSpan(normalizeAppDependency(message), context)
        }

        if (["AppEvents", "customEvents"].includes(type)) {
            const event = normalizeAppEvent(message)
            this.addSpan(event, context)
        }

        if (["AppExceptions", "exceptions"].includes(type)) {
            const exception = normalizeAppException(message)
            this.addSpan(exception, context)
        }

        if (["AppPageViews", "pageViews"].includes(type)) {
            const pageView = normalizeAppPageView(message)
            this.addSpan(pageView, context)
        }

        if (["AppAvailabilityResults", "availabilityResults"].includes(type)) {
            const availabilityResult = normalizeAppAvailabilityResult(message)
            this.addSpan(availabilityResult, context)
        }

        if (["AppBrowserTimings", "browserTimings"].includes(type)) {
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
    processMessages(messages: string | string[], context: Context): void {
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

    private createContext(appSpan: Record<string, any>, ctx: Context): any {
        let obj: { traceId: string; spanId: string; traceFlags: TraceFlags; traceState: any; attributes: any }
        // eslint-disable-next-line prefer-const
        obj = {
            traceId: appSpan.parentId || ctx.traceContext.traceparent,
            spanId: appSpan.id,
            traceFlags: 0,
            traceState: ctx.traceContext.tracestate,
            attributes: ctx.traceContext.attributes,
        }
        return obj
    }

    addSpan(appSpan: Record<any, any>, context: Context): void {
        const span = this.traceProvider.getTracer("default").startSpan(appSpan.name, {
            startTime: timeStampToHr(appSpan.timestamp),
            kind: SpanKind.INTERNAL,
        })
        span.setAttribute("spanContext", this.createContext(appSpan, context))
        if (appSpan.type === "AppExceptions" || appSpan.ExceptionType) {
            const message = appSpan.innermostMessage || appSpan.outerMessage
            span.setStatus({ code: SpanStatusCode.ERROR, message })
        } else {
            span.setStatus({ code: SpanStatusCode.OK })
        }
        // TODO: handle Links and Events
        for (const prop in appSpan) {
            if (traceMap[prop] && appSpan.hasOwnProperty(prop)) {
                span.setAttribute(traceMap[prop], appSpan[prop])
            }
        }
        span.end(endTimeHrFromDuration(appSpan.timestamp, appSpan.durationMs))
        // OT batch processor doesn't give access to current batch size
        // or batch content. This lets us do snapshot tests.
        this.currentBatch.push(span)
    }

    sendBatches(context: Context): void {
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
