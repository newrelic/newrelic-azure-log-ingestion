import { Context } from "@azure/functions"
import { BasicTracerProvider, BatchSpanProcessor } from "@opentelemetry/tracing"
import { CollectorTraceExporter } from "@opentelemetry/exporter-collector"

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

    addSpan(): void {
        const span = this.traceProvider.getTracer("default").startSpan("foo")
        span.setAttribute("key", "value")
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
