import { AzureFunction, Context } from "@azure/functions"
import Adapter from "./adapter"
import OpenTelemetryAdapter from "./opentelemetry"

const apiKey = process.env["NEW_RELIC_INSERT_KEY"]
const debug = process.env["DEBUG"] || false
const otel = process.env["OTEL"] || false
const nrdt = process.env["NEW_RELIC_DISTRIBUTED_TRACING"] !== "false"

const adapter = new Adapter(apiKey)

const eventHubTrigger: AzureFunction = async function (context: Context, eventHubMessages: any): Promise<void> {
    if (debug) {
        context.log(`Eventhub trigger function called for message eventHubMessages ${eventHubMessages}`)
        context.log(`eventHubMessages type: ${typeof eventHubMessages}`)
    }
    if (otel) {
        context.log("*** Executing OTEL ***")
        const otelAdapter = new OpenTelemetryAdapter(apiKey, context)
        otelAdapter.processMessages(eventHubMessages, context)
        otelAdapter.sendBatches(context)
    }
    if (nrdt) {
        adapter.processMessages(eventHubMessages, context)
        adapter.sendBatches(context)
    }
}

export default eventHubTrigger
