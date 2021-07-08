import { telemetry } from "@newrelic/telemetry-sdk"
import { Context } from "@azure/functions"

import { Processor } from "./base"
import flatten from "../utils/flatten"
import { parse } from "../utils/resource"

const debug = process.env["DEBUG"] || false

export default class SpanProcessor implements Processor {
    client: telemetry.spans.SpanClient
    batch: telemetry.spans.SpanBatch

    constructor(apiKey: string) {
        const host = process.env.NEW_RELIC_REGION === "eu" ? "trace-api.eu.newrelic.com" : "trace-api.newrelic.com"
        this.client = new telemetry.spans.SpanClient({ apiKey, host })
        this.startNewBatch()
    }

    /**
     * Starts a new span batch, setting common attributes
     */
    private startNewBatch(): void {
        this.batch = new telemetry.spans.SpanBatch({ "cloud.provider": "azure" })
    }

    /**
     * Processes a span message and adds span to current batch
     */
    processMessage(message: Record<string, any>, context: Context): void {
        const { durationMs, id, name, operationId, parentId, properties = {}, resourceId, timestamp, ...rest } = message
        const epochDate = new Date(timestamp).getTime()
        const attributes = flatten({ ...properties, ...rest, resourceId })
        const resource = parse(resourceId)

        if (debug) {
            context.log("id: ", id)
            context.log("name: ", name)
            context.log("parentId: ", parentId)
            context.log("resourceId: ", resourceId)
            context.log("resourceName: ", resource.resourceName)
            context.log("traceId: ", operationId)
        }

        const span = new telemetry.spans.Span(
            id,
            operationId,
            epochDate,
            name,
            parentId,
            resource.resourceName,
            durationMs,
            attributes,
        )

        this.batch.addSpan(span)

        if (parentId) {
            const rootSpan = new telemetry.spans.Span(
                parentId,
                operationId,
                epochDate,
                null,
                null,
                resource.resourceName,
            )
            this.batch.addSpan(rootSpan)
        }
    }

    /**
     * Sends span telemetry batches to New Relic
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
