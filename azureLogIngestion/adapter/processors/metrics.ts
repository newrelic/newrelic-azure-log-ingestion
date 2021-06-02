import { telemetry } from "@newrelic/telemetry-sdk"
import { Context } from "@azure/functions"

import { Processor } from "./base"
import flatten from "../utils/flatten"
import { GaugeMetric, CountMetric, SummaryMetric } from "@newrelic/telemetry-sdk/dist/src/telemetry/metrics"

export default class MetricsProcessor implements Processor {
    client: telemetry.metrics.MetricClient
    batch: telemetry.metrics.MetricBatch

    constructor(apiKey: string) {
        const host = process.env.NEW_RELIC_REGION === "eu" ? "log-api.eu.newrelic.com" : "log-api.newrelic.com"
        this.client = new telemetry.metrics.MetricClient({ apiKey, host })
        this.startNewBatch()
    }

    /**
     * Starts a new batch, setting common attributes
     */
    private startNewBatch(): void {
        this.batch = new telemetry.metrics.MetricBatch({ "cloud.provider": "azure" })
    }

    private createMetric(message: any): GaugeMetric | CountMetric | SummaryMetric {
        const gaugeCategories = ["Logical Disk", "Memory", "Network", "Physical Disk", "Process", "Processor", "System"]
        const { name, value, type, category, timestamp, properties, ...rest } = message
        const epochDate = new Date(timestamp).getTime()
        const attributes = {
            ...flatten({ name, value, type, category, ...properties, ...rest, timestamp: epochDate }),
        }

        if (gaugeCategories.includes(category)) {
            return new telemetry.metrics.GaugeMetric(name, value, attributes, epochDate)
        }
        if (rest && rest.interval) {
            const intervalMs = 10000 /// TODO: convert to ms, as this could be in ms, s, m, h, etc.
            return new telemetry.metrics.CountMetric(name, value, attributes, epochDate, intervalMs)
        }
        return new telemetry.metrics.SummaryMetric(name, value, attributes, epochDate)
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
