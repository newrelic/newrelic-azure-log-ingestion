import { AzureFunction, Context } from "@azure/functions"

import Adapter from "./adapter"

const apiKey = process.env["NEW_RELIC_INSERT_KEY"]

const adapter = new Adapter(apiKey)

const eventHubTrigger: AzureFunction = async function (context: Context, eventHubMessages: any): Promise<void> {
    context.log(`Eventhub trigger function called for message array ${eventHubMessages}`)

    const records = JSON.parse(eventHubMessages)
    context.log(`Eventhub trigger function called for message array ${records.records}`)
    adapter.processMessages(records.records, context)
    //records.forEach(adapter.processMessages)

    adapter.sendBatches(context)
}

export default eventHubTrigger
