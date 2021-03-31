import { AzureFunction, Context } from "@azure/functions"
import { spans, metrics } from "@newrelic/telemetry-sdk/dist/src/telemetry"

const eventHubTrigger: AzureFunction = async function (context: Context, eventHubMessages: any[]): Promise<void> {
    const apiKey = process.env["NEW_RELIC_INSERT_KEY"]
    const metricClient = new metrics.MetricClient({
        apiKey,
    })
    const spansClient = new spans.SpanClient({
        apiKey,
    })
    const spanBatch = new spans.SpanBatch()
    const metricBatch = new metrics.MetricBatch()

    const messages = JSON.parse(eventHubMessages[0])
    messages.records.forEach((message) => {
        const {
            Id,
            ParentId,
            OperationId,
            time,
            Name,
            DurationMs,
            OperationName,
            Type,
            AppRoleInstance,
            ClientIP,
            SDKVersion,
            Success,
            ResourceGUID,
            _BilledSize,
            Properties = null,
        } = message

        const epochDate = new Date(time).getTime()

        const attributes = {
            Type,
            AppRoleInstance,
            ClientIP,
            SDKVersion,
            Success,
            ResourceGUID,
            BilledSize: _BilledSize,
        }

        if (Properties) {
            for (const x in Properties) {
                attributes[x] = Properties[x]
            }
        }

        const span = new spans.Span(
            Id,
            OperationId,
            epochDate,
            Name,
            ParentId,
            OperationName,
            DurationMs,
            attributes,
        )

        spanBatch.addSpan(span)
    })

    spansClient.send(spanBatch, (err) => {
        if (err) context.log(`Error occurred while sending telemetry to New Relic: ${err}`)
    })
}

export default eventHubTrigger
