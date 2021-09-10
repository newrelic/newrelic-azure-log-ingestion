import { telemetry } from "@newrelic/telemetry-sdk"
import { Context } from "@azure/functions"

import { Processor } from "./base"
import flatten from "../../utils/flatten"

export default class EventProcessor implements Processor {
    client: telemetry.events.EventClient
    batch: telemetry.events.EventBatch

    constructor(apiKey: string) {
        const host =
            process.env.NEW_RELIC_REGION === "eu"
                ? "insights-collector.eu01.nr-data.net"
                : "insights-collector.nr-data.net"
        this.client = new telemetry.events.EventClient({ apiKey, host })
        this.startNewBatch()
    }

    /**
     * Starts a new batch, setting common attributes
     */
    private startNewBatch(): void {
        this.batch = new telemetry.events.EventBatch({ "cloud.provider": "azure" })
    }

    /**
     * Processes an event message and adds event to current batch
     */
    processMessage(message: Record<string, any>, context: Context): void {
        // Deleting attributes we do not want to send to New Relic
        // TODO: Make this a part of a processor attribute filter method
        delete message.iKey

        const { type, timestamp, properties = {}, ...rest } = message
        const eventType = `Azure${type}`
        const epochDate = new Date(timestamp).getTime()
        const attributes = {
            ...flatten({ ...properties, ...rest }),
        }

        const event = new telemetry.events.Event(eventType, attributes, epochDate)
        this.batch.addEvent(event)
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
