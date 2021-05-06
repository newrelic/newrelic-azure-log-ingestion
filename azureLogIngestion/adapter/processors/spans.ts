import { telemetry } from "@newrelic/telemetry-sdk"
import { Context } from "@azure/functions"

import { SpanMessage } from "../messages"
import { Processor } from "./base"
import normalize from "../utils/normalize"

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
        this.batch = new telemetry.spans.SpanBatch({ "cloudProvider.source": "azure" })
    }

    /**
     * Processes a span message and adds span to current batch
     */
    processMessage(message: SpanMessage, context: Context): void {
        // Deleting attributes we do not want to send to New Relic
        // TODO: Make this a part of a processor attribute filter method
        delete message.IKey

        const { Id, ParentId, OperationId, time, Name, DurationMs, OperationName, Properties = {}, ...rest } = message
        const epochDate = new Date(time).getTime()
        const attributes = {
            ...normalize(formatAttributes({ ...rest, ...Properties })),
        }

        context.log("TraceId: ", OperationId)
        context.log("id: ", Id)
        context.log("ParentId: ", ParentId)
        context.log("Name: ", Name)
        context.log("OperationName: ", OperationName)

        const span = new telemetry.spans.Span(
            Id,
            OperationId,
            epochDate,
            Name,
            ParentId === OperationId ? null : ParentId, // Determining if this is the root span or not and formatting accordingly
            OperationName,
            DurationMs,
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
