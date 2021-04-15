import { Context } from "@azure/functions"

import { Message, MessageType } from "./messages"
import { SpanProcessor } from "./processors"

export default class Adapter {
    spanProcessor: SpanProcessor

    constructor(apiKey: string) {
        this.spanProcessor = new SpanProcessor(apiKey)
    }

    private determineMessageType(message: Message): MessageType {
        return MessageType.Span
    }

    processMessages(messages: string): void {
        const records = JSON.parse(messages)

        records.records.forEach((message) => {
            switch (this.determineMessageType(message)) {
                case MessageType.Span:
                    return this.spanProcessor.processMessage(message)
            }
        })
    }

    sendBatches(context: Context): void {
        this.spanProcessor.sendBatch(context)
    }
}
