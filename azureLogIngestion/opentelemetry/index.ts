import { Context as AzureContext } from "@azure/functions"
import {
    diag,
    DiagConsoleLogger,
    DiagLogger,
    DiagAPI,
    DiagLogLevel,
    DiagLogFunction,
    Span,
    SpanAttributes,
    SpanContext,
    SpanKind,
    SpanStatus,
    SpanStatusCode,
    TraceFlags,
    TraceState,
} from "@opentelemetry/api"
import { BatchSpanProcessor, ConsoleSpanExporter, ReadableSpan, SimpleSpanProcessor } from "@opentelemetry/tracing"
import { Resource } from "@opentelemetry/resources"
import { ResourceAttributes } from "@opentelemetry/semantic-conventions"

import { CollectorTraceExporter, CollectorMetricExporter } from "@opentelemetry/exporter-collector-grpc"
import * as grpc from "@grpc/grpc-js"

import { NRTracerProvider } from "./provider"
import { endTimeHrFromDuration, timeStampToHr } from "../utils/time"
import {
    normalizeAppAvailabilityResult,
    normalizeAppBrowserTiming,
    normalizeAppDependency,
    normalizeAppEvent,
    normalizeAppException,
    normalizeAppPageView,
    normalizeAppRequest,
} from "../mappings"
import * as _ from "lodash"
import { opentelemetryProto } from "@opentelemetry/exporter-collector/build/esm/types"
import { parse } from "../utils/resource"
import NrSpanContext from "./nrSpanContext"

const debug = process.env["DEBUG"] || false

interface Records {
    records: Record<string, any>[]
}

const traceMap = {
    name: "name",
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

const getSpanKind = (type: string): SpanKind => {
    if (type === "AppRequest") {
        return SpanKind.SERVER
    }
    return SpanKind.SERVER
}
const getSpanTrigger = (type: string): string => {
    // if (type === "AppRequest") {
    return "http"
    // }
    // datasource
    // pubsub
    // timer
    // other
}

export default class OpenTelemetryAdapter {
    defaultServiceName: string
    spanProcessor: BatchSpanProcessor
    traceProvider: NRTracerProvider
    currentBatch: Array<ReadableSpan>
    resourceAttrs: any
    exporter: CollectorTraceExporter
    consoleExporter: ConsoleSpanExporter

    constructor(apiKey: string, azContext: AzureContext) {
        // diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG)
        this.defaultServiceName = "newrelic-azure-log-ingestion"

        const metadata = new grpc.Metadata()
        metadata.set("api-key", apiKey)
        this.exporter = new CollectorTraceExporter({
            url:
                process.env.NEW_RELIC_REGION === "eu"
                    ? "grpc://otlp.eu01.nr-data.net:4317"
                    : process.env.NEW_RELIC_REGION === "staging"
                    ? "grpc://staging.otlp.nr-data.net:4317"
                    : "grpc://otlp.nr-data.net:4317",
            metadata,
            credentials: grpc.credentials.createSsl(),
        })
        this.resourceAttrs = {
            [ResourceAttributes.SERVICE_NAME]: this.defaultServiceName,
            [ResourceAttributes.TELEMETRY_SDK_LANGUAGE]: "nodejs",
            [ResourceAttributes.TELEMETRY_SDK_NAME]: "opentelemetry",
            [ResourceAttributes.TELEMETRY_SDK_VERSION]: "0.23.0",
        }

        // initializing with a service name which we'll override for each span
        this.traceProvider = new NRTracerProvider({
            resource: new Resource(this.resourceAttrs),
        })
        this.spanProcessor = new BatchSpanProcessor(this.exporter, {
            // The maximum queue size. After the size is reached spans are dropped.
            maxQueueSize: 100,
            maxExportBatchSize: 10,
        })
        // this.spanProcessor = new SimpleSpanProcessor(this.exporter)

        // const consoleExporter = new ConsoleSpanExporter()
        // const consoleProcessor = new SimpleSpanProcessor(consoleExporter)

        this.traceProvider.addSpanProcessor(this.spanProcessor)
        // this.traceProvider.addSpanProcessor(consoleProcessor)

        this.traceProvider.register()
        this.currentBatch = []

        const signals = ["SIGINT", "SIGTERM"]
        signals.forEach((signal) => {
            process.on(signal, () => this.traceProvider.shutdown().catch(azContext.log))
        })
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

    private createContext(appSpan: Record<string, any>, ctx: AzureContext): NrSpanContext {
        ctx.log("create context, setting parent")
        ctx.log(`id: ${appSpan.id} parent id: ${appSpan.parentId} traceparent: ${ctx.traceContext.traceparent}`)
        return new NrSpanContext({
            traceId: appSpan.parentId || ctx.traceContext.traceparent,
            spanId: appSpan.id,
            traceFlags: 0,
            traceState: ctx.traceContext.tracestate,
            attributes: ctx.traceContext.attributes,
        })
    }

    addSpan(appSpan: Record<any, any>, context: AzureContext): void {
        const resourceId = _.get(appSpan, "resourceId", null)
        // Much of the time, the resourceId is for the log ingestion function, not the calling function
        // operation name is least-bad, but needs to be processed, at least for web requests
        const serviceName = appSpan.operationName
            ? this.sanitizeOpName(appSpan.operationName)
            : appSpan.appRoleName
            ? appSpan.appRoleName
            : this.defaultServiceName

        // resourceId ? parse(resourceId).resourceName

        const resourceAttrs = {
            ...this.resourceAttrs,
            [ResourceAttributes.SERVICE_NAME]: this.defaultServiceName,
            [ResourceAttributes.FAAS_ID]: appSpan.id,
            [ResourceAttributes.FAAS_INSTANCE]: appSpan.operationId,
            [ResourceAttributes.FAAS_NAME]: appSpan.name,
            [ResourceAttributes.FAAS_VERSION]: appSpan.sdkVersion,
        }
        this.traceProvider.resource = new Resource(resourceAttrs)

        const span = this.traceProvider.getTracer("default").startSpan(
            appSpan.name,
            {
                startTime: timeStampToHr(appSpan.timestamp),
                kind: getSpanKind(appSpan.type),
                attributes: appSpan,
                root: _.isUndefined(appSpan.parentId) || _.isNull(appSpan.parentId),
            },
            this.createContext(appSpan, context),
        )

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
                span.setAttribute(traceMap[prop], appSpan[prop]) // still not setting parentid
            }
        }

        // We need to reset id and parent id here

        span.end(endTimeHrFromDuration(appSpan.timestamp, appSpan.durationMs))

        context.log("----- appspan ------")
        context.log(appSpan)
        context.log("----- span ------")
        context.log(span)
        context.log("----- span done ------")

        // OT batch processor doesn't give access to current batch size
        // or batch content. This lets us do snapshot tests.
        // const spanRecord = process.env["otelJestTests"] ? loggableSpan(span) : appSpan.id
        //this.currentBatch.push(spanRecord)
        this.currentBatch.push(loggableSpan(span))

        // this.sendBatches(context)
        // this.traceProvider.forceFlush()
    }

    private sanitizeOpName(name: string): string {
        const ptn = /.*\/api\/(.*)/
        const opCheck = name.match(ptn)
        if (opCheck) {
            return opCheck[1]
        }
        return name
    }

    sendBatches(context: AzureContext): void {
        const processors = []
        processors.push(this.traceProvider.shutdown())
        context.log("in sendBatches")
        // const send = this.exporter.send(
        //     this.currentBatch,
        //     () => {
        //         context.log(`*******************************`)
        //         context.log(`exporter send, on success`)
        //     },
        //     (err) => {
        //         context.log(`!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!`)
        //         context.log(`EXPORTER ERROR`, err)
        //     },
        // )
        // processors.push(send)
        Promise.allSettled(processors).then((results) => {
            context.log(`++++++ Sending batches of traces; haven't yet seen this logged.`)
            context.log(results)
            context.log(`filtering results`)
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
