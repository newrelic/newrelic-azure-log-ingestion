import { AzureFunction, Context } from "@azure/functions"
import Adapter from "./adapter"
import OpenTelemetryAdapter from "./opentelemetry"
import * as _ from "lodash"

const apiKey = process.env["NEW_RELIC_INSERT_KEY"]
const debug = process.env["DEBUG"] || false
const otel = process.env["OTEL"] || false

const adapter = new Adapter(apiKey)
let otelAdapter: OpenTelemetryAdapter

const eventHubTrigger: AzureFunction = async function (context: Context, eventHubMessages: any): Promise<void> {
    if (debug) {
        context.log(`Eventhub trigger function called for message eventHubMessages ${eventHubMessages}`)
        context.log(`eventHubMessages type: ${typeof eventHubMessages}`)
    }
    if (otel) {
        const serviceName = _.get(eventHubMessages, "records.0.resourceId", null)
        console.log("serviceName", serviceName)
        otelAdapter = new OpenTelemetryAdapter(apiKey, serviceName)
        otelAdapter.processMessages(eventHubMessages, context)
        otelAdapter.sendBatches(context)
    }
    adapter.processMessages(eventHubMessages, context)
    adapter.sendBatches(context)
}

export default eventHubTrigger
