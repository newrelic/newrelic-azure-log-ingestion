import { telemetry } from "@newrelic/telemetry-sdk"
import { Context } from "@azure/functions"

import { Processor } from "./base"
import flatten from "../utils/flatten"

export default class EventProcessor implements Processor {
    client: telemetry.logs.LogClient
    batch: telemetry.logs.LogBatch
    ctx: Context // for debugging

    constructor(apiKey: string) {
        const host = process.env.NEW_RELIC_REGION === "eu" ? "log-api.eu.newrelic.com" : "log-api.newrelic.com/log/v1"
        this.client = new telemetry.logs.LogClient({ apiKey, host })
        this.startNewBatch()
    }

    /**
     * Starts a new batch, setting common attributes
     */
    private startNewBatch(): void {
        this.batch = new telemetry.logs.LogBatch([], {})
    }

    /**
     * Processes a log message and adds event to current batch
     */
    processMessage(message: Record<string, any>, context: Context): void {
        // TODO: delete this
        this.ctx = context

        // Deleting attributes we do not want to send to New Relic
        // TODO: Make this a part of a processor attribute filter method
        delete message.iKey

        const { type, timestamp, properties = {}, ...rest } = message
        const logtype = `Azure${type}`
        const epochDate = new Date(timestamp).getTime()
        const attributes = {
            ...flatten({ logtype, ...properties, ...rest }),
        }

        const log = new telemetry.logs.Log(attributes.message, epochDate, attributes)
        // context.log("LOG", JSON.stringify(log))
        this.batch.append(log)
        // context.log("log added to batch")
    }

    /**
     * Sends event telemetry batches to New Relic
     *
     * Currently this doesn't create a new batch on failure, allowing for
     * reattempts. This will result in a memory leak for subsequent failures.
     * Should set a max attempt count and start new batch when reached.
     */
    sendBatch(): Promise<void> {
        this.ctx.log("In log sendBatch", JSON.stringify(this.batch))
        return new Promise<void>((resolve, reject) => {
            this.ctx.log("%%%% about to send log to NR")
            this.client.send(this.batch, (err) => {
                this.ctx.log("^^^^ logs sent! Any error?", err)
                if (err) reject(err)
            })
            this.ctx.log("!!!! Sent log batch to logs API", JSON.stringify(this.batch))
            this.startNewBatch()
            resolve()
        })
    }
}
