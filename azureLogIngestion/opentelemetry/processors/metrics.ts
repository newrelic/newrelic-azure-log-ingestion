import { Context as AzureContext } from "@azure/functions"
import { Meter, MeterProvider } from "@opentelemetry/sdk-metrics-base"
import { ValueObserver, MetricOptions } from "@opentelemetry/api-metrics"
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions"

import { CollectorMetricExporter } from "@opentelemetry/exporter-collector-grpc"
import * as grpc from "@grpc/grpc-js"

import flatten from "../../utils/flatten"
import { convertToMs } from "../../utils/time"
import { sanitizeOpName } from "../../utils/resource"
import { Resource } from "@opentelemetry/resources"
import { Processor } from "@opentelemetry/sdk-metrics-base/build/src/export/Processor"
import { InstrumentationLibrary } from "@opentelemetry/core"

const debug = process.env["DEBUG"] || false

/*
        "_startTime": 1630092579043000000,
        "attributes": undefined,
        "grpcQueue": Array [],
        "metadata": Metadata {
        "internalRepr": Map {
            "api-key" => Array [
                "mock-insert-key",
                ],
        },
        "options": Object {},
    },
    "serviceClient": undefined,
        "shutdown": [Function],
        "url": "otlp.nr-data.net:4317",
},

    instrumentationLibrary: InstrumentationLibrary
    meter: Meter
    resource: Resource
 */

const loggableObserver = (observer: ValueObserver, ctx?: AzureContext): any => {
    if (ctx) {
        ctx.log("*** observer", observer)
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const r: {
        name: string
        options: MetricOptions
        _processor: Processor
        resource: Resource
        instrumentationLibrary: InstrumentationLibrary
    } = { ...observer }
    return {
        name: r.name,
        options: r.options,
        _processor: r._processor,
        resource: r.resource,
        instrumentationLibrary: r.instrumentationLibrary,
    }
}

export default class MetricProcessor {
    defaultServiceName: string
    providers: { string?: MeterProvider }
    batch: Array<any>
    resourceAttrs: any
    observers: any // tracking bound observers to unbind later
    exporter: CollectorMetricExporter
    context: AzureContext

    constructor(apiKey: string, azContext: AzureContext) {
        this.defaultServiceName = "newrelic-azure-log-ingestion"

        const metadata = new grpc.Metadata()
        metadata.set("api-key", apiKey)

        const metricExporterOptions = {
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
            azContext.log("metricExporterOptions")
            azContext.log(CollectorMetricExporter)
            azContext.log("metadata:", metricExporterOptions.metadata)
        }
        this.exporter = new CollectorMetricExporter(metricExporterOptions)
        this.resourceAttrs = {
            [SemanticResourceAttributes.SERVICE_NAME]: this.defaultServiceName,
            [SemanticResourceAttributes.TELEMETRY_SDK_LANGUAGE]: "nodejs",
            [SemanticResourceAttributes.TELEMETRY_SDK_NAME]: "opentelemetry",
            [SemanticResourceAttributes.TELEMETRY_SDK_VERSION]: "0.25.0",
        }
        this.batch = []
        this.providers = {}
        this.observers = {}
        this.context = azContext
    }

    private createBoundObserver = (meter, name, options, labels) => {
        let value
        const observer = meter.createValueObserver(name, { options }, (observerResult) => {
            if (value === undefined) return
            observerResult.observe(value, labels)
            value = undefined
        })
        observer.observation = function (val) {
            value = val
        }
        const boundObserver = observer.bind(labels)
        this.observers[name] = { labels, observer: boundObserver } // for later unbinding
    }

    private performanceCounter(message: any, provider: MeterProvider): void {
        const { name, value, type, category, timestamp, properties, ...rest } = message
        const epochDate = new Date(timestamp).getTime()
        const attributes = {
            ...flatten({ name, value, type, category, ...properties, ...rest, timestamp: epochDate }),
        }

        const meter = provider.getMeter(name)

        if (!this.observers[name]) {
            const options = { description: `Azure function performance counter for ${name}`, ...attributes }
            const labels = { ...attributes }
            this.context.log("DEFINING performanceCounter OBSERVER", options)
            this.createBoundObserver(meter, name, options, labels)
        }
        const observer = this.observers[name].observer
        observer.update(value)
        this.batch.push(observer)
        this.context.log("did timeout in perf counter, pushed observer", value, observer)
        // this.batch.push(loggableObserver(observer, context))
    }

    private genericMeter(message: any, provider: MeterProvider): void {
        const { name, value, min, max, sum, itemCount, interval, timestamp, properties, ...rest } = message
        let { count } = message
        let intervalMs
        // example AppMetrics we've seen use itemCount instead of count
        if (!count) {
            count = itemCount
        }
        const epochDate = new Date(timestamp).getTime()
        if (interval) {
            intervalMs = convertToMs(interval)
        } else {
            // otherwise, assume default 10s.
            intervalMs = 10000
        }
        const attributes = {
            ...flatten({ name, ...properties, ...rest, timestamp: epochDate, intervalMs }),
        }
        if (value !== undefined) attributes.value = value
        if (sum !== undefined) attributes.sum = sum
        if (min !== undefined) attributes.min = min
        if (max !== undefined) attributes.max = max

        const meter = provider.getMeter(name)
        if (!this.observers[name]) {
            const options = { description: `Azure function meter for ${name}`, ...attributes }
            const labels = { attributes }
            this.createBoundObserver(meter, name, options, labels)
        }

        const observer = this.observers[name].observer

        if (count) {
            observer.update(count)
            this.context.log("did timeout, in generic count, pushed observer", count, observer)
            // observer.update({ count, sum, min, max })
        }
        if (value) {
            observer.update(value)
            this.context.log("did timeout, in generic value, pushed observer", value, observer)
        }
        this.batch.push(observer)
        // this.batch.push(loggableObserver(observer, context))
    }

    private getProvider(message: any): MeterProvider {
        // get function name
        // Much of the time, the resourceId is for the log ingestion function, not the calling function
        // operation name is least-bad, but needs to be processed, at least for web requests
        const serviceName = message.operationName
            ? sanitizeOpName(message.operationName)
            : message.appRoleName
            ? message.appRoleName
            : this.defaultServiceName

        if (!this.providers[serviceName]) {
            const resourceAttrs = {
                ...this.resourceAttrs,
                [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
            }
            // Register the exporter (TODO: make interval an env var)
            this.providers[serviceName] = new MeterProvider({
                resource: new Resource(resourceAttrs),
                exporter: this.exporter,
                interval: 1000,
            })
        }
        return this.providers[serviceName]
    }

    private createMeter(message: any): void {
        const { type } = message
        const provider = this.getProvider(message)

        if (["AppPerformanceCounter", "appPerformanceCounter"].includes(type)) {
            this.performanceCounter(message, provider)
        } else {
            this.genericMeter(message, provider)
        }
    }

    /**
     * Processes a metric and add to current batch
     */
    processMessage(message: Record<string, any>): void {
        // Deleting attributes we do not want to send to New Relic
        // TODO: Make this a part of a processor attribute filter method
        delete message.iKey
        this.createMeter(message)
        if (debug) {
            this.context.log(`Processing message:`, message)
        }
    }

    sendBatch(ctx?: AzureContext): Promise<void> {
        const context = !ctx ? this.context : ctx
        if (debug) {
            context.log(`In metrics.sendBatch. Batch length: ${this.batch.length}`)
        }
        return new Promise<void>((resolve, reject) => {
            try {
                // unbind bound observers
                for (const o in this.observers) {
                    const obs = this.observers[o]
                    obs.observer.unbind(obs.labels)
                }
                this.observers = {} // reset
                setTimeout(() => {
                    this.exporter.shutdown()
                    if (debug) {
                        context.log("this.exporter.shutdown succeeded")
                    }
                    this.batch.length = 0 // reset
                    resolve()
                }, 2000)
            } catch (e) {
                context.log("!!!! this.exporter.shutdown rejected")
                reject(e)
            }
        })
    }
}
