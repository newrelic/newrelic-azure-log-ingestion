import { AzureFunction, Context } from "@azure/functions"

import Adapter from "./adapter"

const apiKey = process.env["NEW_RELIC_INSERT_KEY"]

const adapter = new Adapter(apiKey)

const eventHubTrigger: AzureFunction = async function (context: Context, eventHubMessages: any): Promise<void> {
    context.log(`Eventhub trigger function called for message array ${eventHubMessages}`)
    const messages = JSON.parse(eventHubMessages)
    adapter.processMessages(messages, context)
    adapter.sendBatches(context)
}

export default eventHubTrigger
