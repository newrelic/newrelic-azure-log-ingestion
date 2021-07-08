import { telemetry } from "@newrelic/telemetry-sdk"
import { Context } from "@azure/functions"
import { Processor } from "./base"
import flatten from "../utils/flatten"
import { GaugeMetric, CountMetric, SummaryMetric } from "@newrelic/telemetry-sdk/dist/src/telemetry/metrics"

export default class MetricsProcessor implements Processor {
    client: telemetry.metrics.MetricClient
    batch: telemetry.metrics.MetricBatch

    constructor(apiKey: string) {
        const host = process.env.NEW_RELIC_REGION === "eu" ? "metric-api.eu.newrelic.com" : "metric-api.newrelic.com"
        this.client = new telemetry.metrics.MetricClient({ apiKey, host })
        this.startNewBatch()
    }

    /**
     * Starts a new batch, setting common attributes
     */
    private startNewBatch(): void {
        this.batch = new telemetry.metrics.MetricBatch({ "cloud.provider": "azure" })
    }

    // performance counter intervals come with a scale string appended
    private convertToMs(interval: string): number {
        const scale = String(interval).match(/[a-zA-Z]+/g)
        const intervalNumber = String(interval).match(/[0-9.]+/g)
        let ms
        if (!scale) {
            return Number(interval)
        }
        const units = scale[0].toLowerCase()
        if (units === "ms") {
            ms = Number(intervalNumber[0])
        } else if (units === "s") {
            ms = Number(intervalNumber[0]) * 1000
        } else if (units === "m") {
            ms = Number(intervalNumber[0]) * 1000 * 60
        }
        return ms
    }

    private performanceCounter(message: any): GaugeMetric | CountMetric {
        const { name, value, type, category, timestamp, properties, ...rest } = message
        const epochDate = new Date(timestamp).getTime()
        const attributes = {
            ...flatten({ name, value, type, category, ...properties, ...rest, timestamp: epochDate }),
        }
        if ((rest && rest.interval) || (properties && properties.interval)) {
            const intVal = (rest && rest.interval) || (properties && properties.interval)
            const intervalMs = this.convertToMs(intVal)
            return new telemetry.metrics.CountMetric(name, value, attributes, epochDate, intervalMs)
        }
        // Most performance counters are likely to be gauges.
        return new telemetry.metrics.GaugeMetric(name, value, attributes, epochDate)
    }

    private metric(message: any): GaugeMetric | CountMetric | SummaryMetric {
        const { name, value, min, max, sum, itemCount, interval, timestamp, properties, ...rest } = message
        let { count } = message
        let intervalMs
        // example AppMetrics we've seen use itemCount instead of count
        if (!count) {
            count = itemCount
        }
        const epochDate = new Date(timestamp).getTime()
        if (interval) {
            intervalMs = this.convertToMs(interval)
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

        // this could be a summary metric
        if (count || sum || min || max) {
            return new telemetry.metrics.SummaryMetric(
                name,
                { count, sum, min, max },
                attributes,
                epochDate,
                intervalMs,
            )
        }
        if (value) {
            return new telemetry.metrics.CountMetric(name, value, attributes, epochDate, intervalMs)
        }
    }

    private createMetric(message: any): GaugeMetric | CountMetric | SummaryMetric {
        const { type } = message
        if (["AppPerformanceCounter", "appPerformanceCounter"].includes(type)) {
            return this.performanceCounter(message)
        }
        return this.metric(message)
    }

    /**
     * Processes a metric and add to current batch
     */
    processMessage(message: Record<string, any>, context: Context): void {
        // Deleting attributes we do not want to send to New Relic
        // TODO: Make this a part of a processor attribute filter method
        delete message.iKey
        const metric = this.createMetric(message)
        this.batch.addMetric(metric)
    }

    /**
     * Sends event telemetry batches to New Relic
     *
     * Currently this doesn't create a new batch on failure, allowing for
     * reattempts. This will result in a memory leak for subsequent failures.
     * Should set a max attempt count and start new batch when reached.
     */
    sendBatch(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.client.send(this.batch, (err) => {
                if (err) reject(err)
            })
            this.startNewBatch()
            resolve()
        })
    }
}
