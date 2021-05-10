import { Context } from "@azure/functions"

import { normalizeAppDependency, normalizeAppRequest } from "./mappings"
import { EventProcessor, SpanProcessor } from "./processors"

const debug = process.env["DEBUG"] || false

interface Records {
    records: Record<string, any>[]
}

export default class Adapter {
    eventProcessor: EventProcessor
    spanProcessor: SpanProcessor

    constructor(apiKey: string) {
        this.eventProcessor = new EventProcessor(apiKey)
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
    private determineMessageTypeProcessor(message: any, context: Context): void {
        const type = message.Type || message.itemType
        if (!type) {
            return
        }

        if (["AppRequests", "requests"].indexOf(type) !== -1) {
            const request = normalizeAppRequest(message)
            this.eventProcessor.processMessage(request, context)
            this.spanProcessor.processMessage(request, context)
        }

        if (["AppDependencies", "dependencies"].indexOf(type) !== -1) {
            this.spanProcessor.processMessage(normalizeAppDependency(message), context)
        }
    }

    /**
     * Identifies messages and hands them off to the appropriate processor
     *
     * There may be situations where a message corresponds to more than one
     * type of telemetry. In this case, the switch/case may not make sense.
     */
    processMessages(messages: string, context: Context): void {
        let records: Records

        try {
            records = JSON.parse(messages)
        } catch (err) {
            context.log.error(`Error parsing JSON: ${err}`)
            if (debug) {
                context.log(messages)
            }

            return
        }

        if (debug) {
            context.log("All messages: ", records.records)
            context.log("All messages length: ", records.records.length)
        }

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
        if (debug) {
            context.log("What is being sent to NR: ", this.spanProcessor.batch)
        }
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
