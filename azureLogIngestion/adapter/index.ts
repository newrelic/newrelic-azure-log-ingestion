import { Context } from "@azure/functions"

import { Message, MessageType, Records } from "./messages"
import { SpanProcessor } from "./processors"

export default class Adapter {
    spanProcessor: SpanProcessor

    constructor(apiKey: string) {
        this.spanProcessor = new SpanProcessor(apiKey)
    }

    /**
     * Determines the type of telemetry based on the message properties
     *
     * Not yet implemented as there is only one message type implemented.
     * As there is no runtime type checking in TypeScript, the message type
     * will need to be determined by checking for distinct properties/values for
     * that type.
     */
    private determineMessageTypeProcessor(message: Message, context: Context): void {
        switch (message.Type) {
            case "AppRequests":
                return this.spanProcessor.processMessage(message, context)
            case "AppDependencies":
                return this.spanProcessor.processMessage(message, context)
            default:
                return this.spanProcessor.processMessage(message, context)
        }
    }

    /**
     * Identifies messages and hands them off to the appropriate processor
     *
     * There may be situations where a message corresponds to more than one
     * type of telemetry. In this case, the switch/case may not make sense.
     */
    processMessages(messages: string, context: Context): void {
        const records: Records = JSON.parse(messages)

        context.log("All messages: ", records.records)
        context.log("All messages length: ", records.records.length)

        records.records.forEach((message) => {
            return this.determineMessageTypeProcessor(message, context)
        })
    }

    /**
     * Sends processed batches to New Relic
     *
     * Promise.allSettled() is used as we want to make a best effort to send all
     * batches instead of failing on the first reject. We only log promise rejections.
     */
    sendBatches(context: Context): void {
        context.log("What is being sent to NR: ", this.spanProcessor.batch)
        const batches = []
        batches.push(this.spanProcessor.sendBatch())
        Promise.allSettled(batches).then((results) => {
            results
                .filter((result) => result.status === "rejected")
                .map((result: PromiseRejectedResult) =>
                    context.log(`Error occurred while sending telemetry to New Relic: ${result.reason}`),
                )
        })
    }
}
