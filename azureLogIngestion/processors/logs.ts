import { telemetry } from "@newrelic/telemetry-sdk"
import { Context } from "@azure/functions"

import { Processor } from "./base"
import flatten from "../utils/flatten"

export default class LogsProcessor implements Processor {
    client: telemetry.logs.LogClient
    batch: telemetry.logs.LogBatch

    constructor(apiKey: string) {
        const host = process.env.NEW_RELIC_REGION === "eu" ? "log-api.eu.newrelic.com" : "log-api.newrelic.com"
        this.client = new telemetry.logs.LogClient({ apiKey, host })
        this.startNewBatch()
    }

    /**
     * Starts a new batch, setting common attributes
     */
    private startNewBatch(): void {
        this.batch = new telemetry.logs.LogBatch([], { "cloud.provider": "azure" })
    }

    /**
     * Processes a log message and add to current batch
     */
    processMessage(message: Record<string, any>, context: Context): void {
        // Deleting attributes we do not want to send to New Relic
        // TODO: Make this a part of a processor attribute filter method
        delete message.iKey

        const { type, timestamp, properties = {}, operationId, ...rest } = message
        const logtype = `Azure${type}`
        const epochDate = new Date(timestamp).getTime()
        const traceId = operationId
        const attributes = {
            ...flatten({ logtype, ...properties, ...rest, timestamp: epochDate, operationId, "trace.id": traceId }),
        }

        const log = new telemetry.logs.Log(attributes.message, epochDate, attributes)
        this.batch.append(log)
    }

    /**
     * Sends log batches to New Relic
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
