import { AzureFunction, Context } from "@azure/functions"
import { SpanClient, SpanBatch, Span } from "@newrelic/telemetry-sdk/dist/src/telemetry/spans"

import Adapter from "./adapter"

const apiKey = process.env["NEW_RELIC_INSERT_KEY"]

const adapter = new Adapter(apiKey)

const eventHubTrigger: AzureFunction = async function (context: Context, eventHubMessages: any[]): Promise<void> {
    context.log(`Eventhub trigger function called for message array ${eventHubMessages}`)

    eventHubMessages.forEach(adapter.processMessages)

    adapter.sendBatches(context)
}

export default eventHubTrigger
