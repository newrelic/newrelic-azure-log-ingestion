import { AzureFunction, Context } from "@azure/functions"
import { SpanClient, SpanBatch, Span } from "@newrelic/telemetry-sdk/dist/src/telemetry/spans"

const apiKey = process.env["NEW_RELIC_INSERT_KEY"]

const spansClient = new SpanClient({
    apiKey,
})

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

const eventHubTrigger: AzureFunction = async function (context: Context, eventHubMessages: any[]): Promise<void> {
    context.log(`Eventhub trigger function called for message array ${eventHubMessages}`)

    const spanBatch = new SpanBatch()
    spanBatch.common = {
        attributes: {
            "cloudProvider.source": "azure",
        },
    }

    eventHubMessages.forEach((messages) => {
        const records = JSON.parse(messages)

        records.records.forEach((message) => {
            context.log("Single event hub records message: ", message)

            // Deleting attributes we do not want to send to New Relic
            delete message.IKey

            const {
                Id,
                ParentId,
                OperationId,
                time,
                Name,
                DurationMs,
                OperationName,
                Properties = {},
                ...rest
            } = message

            const epochDate = new Date(time).getTime()

            const attributes = {
                ...attributeFormatting({ ...rest, ...Properties }),
            }

            const span = new Span(
                Id,
                OperationId,
                epochDate,
                Name,
                ParentId === OperationId ? null : ParentId, // Determining if this is the root span or not and formatting accordingly
                OperationName,
                DurationMs,
                attributes,
            )
            spanBatch.addSpan(span)
        })
    })

    spansClient.send(spanBatch, (err) => {
        if (err) context.log(`Error occurred while sending telemetry to New Relic: ${err}`)
    })
}

const attributeFormatting = (message) => {
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

export default eventHubTrigger
