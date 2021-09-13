import { Context as AzureContext } from "@azure/functions"
import { Span, SpanAttributes, SpanContext, SpanKind, SpanStatus, SpanStatusCode } from "@opentelemetry/api"
import { BatchSpanProcessor, ReadableSpan } from "@opentelemetry/sdk-trace-base"
import { Resource } from "@opentelemetry/resources"
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions"

import { CollectorTraceExporter } from "@opentelemetry/exporter-collector-grpc"
import * as grpc from "@grpc/grpc-js"

import { NRTracerProvider } from "../nrTracerProvider"
import { endTimeFromDuration } from "../../utils/time"

import * as _ from "lodash"
import { opentelemetryProto } from "@opentelemetry/exporter-collector/build/esm/types"
import NrSpanContext from "../nrSpanContext"
import { sanitizeOpName } from "../../utils/resource"

const debug = process.env["DEBUG"] || false

interface Records {
    records: Record<string, any>[]
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
        endTime: any
        events: any
        status: SpanStatus
        spanId: string
    } = { ...span }
    return {
        spanId: s.spanId,
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
    // TODO: add other spanKinds
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

export default class SpanProcessor {
    defaultServiceName: string
    spanProcessor: BatchSpanProcessor
    batch: Array<ReadableSpan>
    resourceAttrs: any
    exporter: CollectorTraceExporter

    constructor(apiKey: string, azContext: AzureContext) {
        this.defaultServiceName = "newrelic-azure-log-ingestion"

        const metadata = new grpc.Metadata()
        metadata.set("api-key", apiKey)

        const traceExporterOptions = {
            metadata,
            url:
                process.env.NEW_RELIC_REGION === "eu"
                    ? "grpc://otlp.eu01.nr-data.net:4317"
                    : process.env.NEW_RELIC_REGION === "staging"
                    ? "grpc://staging.otlp.nr-data.net:4317"
                    : "grpc://otlp.nr-data.net:4317",
            credentials: grpc.credentials.createSsl(),
        }
        if (debug) {
            azContext.log("traceExporterOptions")
            azContext.log(traceExporterOptions)
            azContext.log("metadata:", traceExporterOptions.metadata)
        }
        this.exporter = new CollectorTraceExporter(traceExporterOptions)
        this.resourceAttrs = {
            [SemanticResourceAttributes.SERVICE_NAME]: this.defaultServiceName,
            [SemanticResourceAttributes.TELEMETRY_SDK_LANGUAGE]: "nodejs",
            [SemanticResourceAttributes.TELEMETRY_SDK_NAME]: "opentelemetry",
            [SemanticResourceAttributes.TELEMETRY_SDK_VERSION]: "0.25.0",
        }

        this.spanProcessor = new BatchSpanProcessor(this.exporter, {
            // The maximum queue size. After the size is reached spans are dropped.
            maxQueueSize: 1000,
            // The maximum batch size of every export. It must be smaller or equal to maxQueueSize.
            maxExportBatchSize: 100,
            // The interval between two consecutive exports
            scheduledDelayMillis: 500,
            // How long the export can run before it is cancelled
            exportTimeoutMillis: 30000,
        })

        this.batch = []

        // // CollectorExporterBase has the shutDown interface, rather than the traceProvider
        // const signals = ["SIGINT", "SIGTERM"]
        // signals.forEach((signal) => {
        //     process.on(signal, () => this.exporter.shutdown().catch(azContext.log))
        // })
    }

    processMessage(message: Record<string, any>, context: AzureContext): void {
        this.addSpan(message, context)
    }

    sendBatch(ctx: AzureContext): Promise<void> {
        if (debug) {
            ctx.log(`In spans.sendBatch. Batch length: ${this.batch.length}`)
        }
        return new Promise<void>((resolve, reject) => {
            try {
                setTimeout(() => {
                    this.exporter.shutdown()
                    if (debug) {
                        ctx.log("this.exporter.shutdown succeeded")
                    }
                    this.batch.length = 0 // reset
                    resolve()
                }, 2000)
            } catch (e) {
                ctx.log("!!!! this.exporter.shutdown rejected")
                reject(e)
            }
        })
    }

    private createContext(appSpan: Record<string, any>, ctx: AzureContext, isRoot = false): NrSpanContext {
        const traceId = isRoot ? null : appSpan.parentId || ctx.traceContext.traceparent
        const spanId = isRoot ? appSpan.parentId : appSpan.id

        return new NrSpanContext({
            traceId,
            spanId,
            traceFlags: 0,
            traceState: ctx.traceContext.tracestate,
            attributes: ctx.traceContext.attributes,
        })
    }

    private addSpan(appSpan: Record<any, any>, context: AzureContext): void {
        // const resourceId = _.get(appSpan, "resourceId", null)
        // Much of the time, the resourceId is for the log ingestion function, not the calling function
        // operation name is least-bad, but needs to be processed, at least for web requests
        const serviceName = appSpan.operationName
            ? sanitizeOpName(appSpan.operationName)
            : appSpan.appRoleName
            ? appSpan.appRoleName
            : this.defaultServiceName

        // resourceId ? parse(resourceId).resourceName
        // [ResourceAttributes.FAAS_ID]: appSpan.id,
        // [ResourceAttributes.FAAS_INSTANCE]: appSpan.operationId,
        // [ResourceAttributes.FAAS_NAME]: appSpan.name,
        // [ResourceAttributes.FAAS_VERSION]: appSpan.sdkVersion,

        const resourceAttrs = {
            ...this.resourceAttrs,
            [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
        }

        const traceProvider = new NRTracerProvider({
            resource: new Resource(resourceAttrs),
        })

        traceProvider.addSpanProcessor(this.spanProcessor)
        traceProvider.register()
        const tracer = traceProvider.getTracer("default")

        // synthesize root span
        let parentSpan = null
        if (!_.isNil(appSpan.parentId)) {
            parentSpan = tracer.startSpan(
                `${appSpan.name}`,
                {
                    startTime: new Date(appSpan.timestamp),
                    kind: getSpanKind(appSpan.type),
                    attributes: appSpan,
                    root: true,
                },
                this.createContext(appSpan, context, true),
            )
            parentSpan.setStatus({ code: SpanStatusCode.OK })
        }

        const span = tracer.startSpan(
            appSpan.name,
            {
                startTime: new Date(appSpan.timestamp),
                kind: getSpanKind(appSpan.type),
                attributes: appSpan,
                root: false,
            },
            this.createContext(appSpan, context),
        )

        if (appSpan.type === "AppExceptions" || appSpan.ExceptionType) {
            const message = appSpan.innermostMessage || appSpan.outerMessage
            span.setStatus({ code: SpanStatusCode.ERROR, message })
            span.recordException(
                { message: message, name: appSpan.assembly, stack: appSpan.details },
                new Date(appSpan.timestamp),
            )
        } else {
            span.setStatus({ code: SpanStatusCode.OK })
        }

        // TODO: We need to reset id and parent id here

        span.end(endTimeFromDuration(appSpan.timestamp, appSpan.durationMs))

        if (parentSpan) {
            parentSpan.end(endTimeFromDuration(appSpan.timestamp, appSpan.durationMs))
            const logParentSpan = loggableSpan(parentSpan)
            const pSpanRecord = process.env["otelJestTests"]
                ? logParentSpan
                : { azureId: appSpan.parentId, spanId: logParentSpan.spanId }
            this.batch.push(pSpanRecord)
        }

        // OT batch processor doesn't give access to current batch size
        // or batch content. This lets us do snapshot tests.
        const logSpan = loggableSpan(span)
        const spanRecord = process.env["otelJestTests"] ? logSpan : { azureId: appSpan.id, spanId: logSpan.spanId }
        this.batch.push(spanRecord)
        if (debug) {
            context.log("batch: ")
            context.log(this.batch)
            context.log("----- appspan ------")
            context.log(appSpan)
            context.log("----- span ------")
            context.log(span)
            context.log("----- span done ------")
        }
    }
}
