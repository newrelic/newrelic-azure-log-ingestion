import { telemetry } from "@newrelic/telemetry-sdk"
import { Context } from "@azure/functions"

import { Processor } from "./base"
import flatten from "../utils/flatten"

const dbs = ["sql", "mariadb", "postgresql", "cosmos", "table", "storage"]

const nrFormattedAttributes = {
    // Dependency attributes
    DependencyType: "dependency.type",
    Target: "xxx.target",
    Data: {
        db: "db.statement",
        http: "http.url",
    },
    // Request attributes
    HttpMethod: "http.method",
    HttpPath: "http.path",
    Source: "http.source",
    ResultCode: "xxx.responseCode",
    Url: "http.url",
    // General attributes
    Type: "log.type",
}

// TODO: Make this a processor method
const formatAttributes = (message) => {
    const formattedAttributes = {}
    const { DependencyType = "" } = message

    const attributePrefix = dbs.includes(DependencyType.toLowerCase()) ? "db" : "http"
    Object.entries(message).forEach(([key, value]) => {
        if (nrFormattedAttributes[key]) {
            if (key === "Data") {
                formattedAttributes[nrFormattedAttributes[key][attributePrefix]] = value
                return
            }
            const keyWithPrefix = nrFormattedAttributes[key].replace("xxx", attributePrefix)
            formattedAttributes[keyWithPrefix] = value
            return
        }
        formattedAttributes[key] = value
    })
    return formattedAttributes
}

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
        // Deleting attributes we do not want to send to New Relic
        // TODO: Make this a part of a processor attribute filter method
        delete message.iKey

        const { id, parentId, operationId, timestamp, name, durationMs, operationName, ...rest } = message
        const epochDate = new Date(timestamp).getTime()
        const attributes = {
            ...flatten(rest),
        }

        context.log("traceId: ", operationId)
        context.log("id: ", id)
        context.log("parentId: ", parentId)
        context.log("name: ", name)
        context.log("operationName: ", operationName)

        const span = new telemetry.spans.Span(
            id,
            operationId,
            epochDate,
            name,
            parentId === operationId ? null : parentId, // Determining if this is the root span or not and formatting accordingly
            operationName,
            durationMs,
            attributes,
        )

        this.batch.addSpan(span)
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
