import { AzureFunction, Context } from "@azure/functions"
import Adapter from "./adapter"
import OpenTelemetryAdapter from "./opentelemetry"
import { parse } from "./utils/resource"
import * as _ from "lodash"

const apiKey = process.env["NEW_RELIC_INSERT_KEY"]
const debug = process.env["DEBUG"] || false
const otel = process.env["OTEL"] || false
const nrdt = process.env["NEW_RELIC_DISTRIBUTED_TRACING"] === "false" ? false : true

const adapter = new Adapter(apiKey)
let otelAdapter: OpenTelemetryAdapter

const eventHubTrigger: AzureFunction = async function (context: Context, eventHubMessages: any): Promise<void> {
    if (debug) {
        context.log(`Eventhub trigger function called for message eventHubMessages ${eventHubMessages}`)
        context.log(`eventHubMessages type: ${typeof eventHubMessages}`)
    }
    if (otel) {
        context.log("*** Executing OTEL ***")
        otelAdapter = new OpenTelemetryAdapter(apiKey)
        otelAdapter.processMessages(eventHubMessages, context)
        otelAdapter.sendBatches(context)
    }
    if (nrdt) {
        adapter.processMessages(eventHubMessages, context)
        adapter.sendBatches(context)
    }
}

export default eventHubTrigger
