import { Context as AzureContext } from "@azure/functions"

import {
    normalizeAppAvailabilityResult,
    normalizeAppBrowserTiming,
    normalizeAppDependency,
    normalizeAppEvent,
    normalizeAppException,
    normalizeAppPageView,
    normalizeAppRequest,
} from "../mappings"
import * as _ from "lodash"
import { SpanProcessor } from "./processors"

const debug = process.env["DEBUG"] || false

interface Records {
    records: Record<string, any>[]
}

export default class OpenTelemetryAdapter {
    spanProcessor: SpanProcessor

    constructor(apiKey: string, azContext: AzureContext) {
        this.spanProcessor = new SpanProcessor(apiKey, azContext)
    }

    sendBatches(context: AzureContext): void {
        const exporters = []
        const sendSpans = this.spanProcessor.batch.length > 0

        if (debug) {
            sendSpans && context.log("Spans being sent to NR: ", JSON.stringify(this.spanProcessor.batch))
        }

        sendSpans && exporters.push(this.spanProcessor.sendBatch(context))

        Promise.allSettled(exporters).then((results) => {
            context.log(`++++++ Sending shutdown to exporters.`)
            context.log(results)
            results
                .filter((result) => result.status === "rejected")
                .map((result: PromiseRejectedResult) =>
                    context.log(`Error occurred while sending telemetry to New Relic: ${result.reason}`),
                )
        })
    }

    /**
     * Identifies messages and hands them off to the appropriate processor
     *
     * There may be situations where a message corresponds to more than one
     * type of telemetry. In this case, the switch/case may not make sense.
     */
    processMessages(messages: string | string[], context: AzureContext): void {
        const messageArray = _.isArray(messages) ? messages : [messages]
        messageArray.forEach((message) => {
            let records: Records

            try {
                records = JSON.parse(message)
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

            records.records.forEach((m) => {
                return this.determineMessageTypeProcessor(m, context)
            }, this)
        }, this)
    }

    private determineMessageTypeProcessor(message: any, context: AzureContext): void {
        const type = message.Type || message.itemType

        if (!type) {
            return
        }

        if (["AppRequests", "requests"].includes(type)) {
            const request = normalizeAppRequest(message)
            this.spanProcessor.processMessage(request, context)
        }

        if (["AppDependencies", "dependencies"].includes(type)) {
            const request = normalizeAppDependency(message)
            this.spanProcessor.processMessage(request, context)
        }

        if (["AppEvents", "customEvents"].includes(type)) {
            const event = normalizeAppEvent(message)
            this.spanProcessor.processMessage(event, context)
        }

        if (["AppExceptions", "exceptions"].includes(type)) {
            const exception = normalizeAppException(message)
            this.spanProcessor.processMessage(exception, context)
        }

        if (["AppPageViews", "pageViews"].includes(type)) {
            const pageView = normalizeAppPageView(message)
            this.spanProcessor.processMessage(pageView, context)
        }

        if (["AppAvailabilityResults", "availabilityResults"].includes(type)) {
            const availabilityResult = normalizeAppAvailabilityResult(message)
            this.spanProcessor.processMessage(availabilityResult, context)
        }

        if (["AppBrowserTimings", "browserTimings"].includes(type)) {
            const browserTiming = normalizeAppBrowserTiming(message)
            this.spanProcessor.processMessage(browserTiming, context)
        }
    }
}
