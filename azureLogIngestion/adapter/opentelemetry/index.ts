import { Context } from "@azure/functions"
import opentelemetry, { SpanStatusCode, SpanKind, TraceFlags } from "@opentelemetry/api"
import { BasicTracerProvider, BatchSpanProcessor } from "@opentelemetry/tracing"
import { CollectorTraceExporter } from "@opentelemetry/exporter-collector"
import { timeStampToHr, endTimeHrFromDuration, convertToMs } from "../utils/time"

interface Records {
    records: Record<string, any>[]
}

const traceMap = {
    name: "name",
    attributes: "spanAttributes",
    parentId: "parentSpanId",
}

export class OpenTelemetryAdapter {
    spanProcessor: BatchSpanProcessor
    traceProvider: BasicTracerProvider

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
    }

    private convertContext(appSpan: Record<string, any>, ctx: Context): any {
        let obj: { traceId: string; spanId: string; traceFlags: TraceFlags; traceState: any }
        // eslint-disable-next-line prefer-const
        obj = {
            traceId: appSpan.parentId,
            spanId: appSpan.id,
            traceFlags: 0,
            traceState: ctx.traceContext.tracestate,
        }
        return obj
    }

    addSpan(appSpan: Record<any, any>, context: Context): void {
        const span = opentelemetry.trace.getTracer("default").startSpan(appSpan.name)
        span.setAttribute("spanKind", SpanKind.INTERNAL) // TODO: determine whether CLIENT, SERVER, PRODUCER, CONSUMER, INTERNAL
        span.setAttribute("spanContext", this.convertContext(appSpan, context))
        span.setAttribute("startTime", timeStampToHr(appSpan.timestamp))
        if (appSpan.durationMs) {
            span.setAttribute("endTime", endTimeHrFromDuration(appSpan.timestamp, appSpan.durationMs))
            span.setAttribute("duration", convertToMs(appSpan.durationMs) * 1000)
        }
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
        span.end()
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

    shutdown(): void {
        const processors = []
        processors.push(this.traceProvider.shutdown())
        Promise.allSettled(processors)
    }
}
