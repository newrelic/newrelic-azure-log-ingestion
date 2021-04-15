import { Context } from "@azure/functions"
import { telemetry } from "@newrelic/telemetry-sdk"

import { SpanMessage } from "../messages"

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

export default class SpanProcessor {
    client: telemetry.spans.SpanClient
    batch: telemetry.spans.SpanBatch

    constructor(apiKey: string) {
        this.client = new telemetry.spans.SpanClient({ apiKey })
        this.startNewBatch()
    }

    private startNewBatch(): void {
        this.batch = new telemetry.spans.SpanBatch({ "cloudProvider.source": "azure" })
    }

    processMessage(message: SpanMessage): void {
        // Deleting attributes we do not want to send to New Relic
        // TODO: Make this a part of a processor attribute filter method
        delete message.IKey

        const { Id, ParentId, OperationId, time, Name, DurationMs, OperationName, Properties = {}, ...rest } = message
        const epochDate = new Date(time).getTime()
        const attributes = {
            ...formatAttributes({ ...rest, ...Properties }),
        }

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

    // TODO: Make this return a promise
    sendBatch(context: Context): void {
        this.client.send(this.batch, (err) => {
            if (err) context.log(`Error occurred while sending telemetry to New Relic: ${err}`)
        })
        this.startNewBatch()
    }
}
