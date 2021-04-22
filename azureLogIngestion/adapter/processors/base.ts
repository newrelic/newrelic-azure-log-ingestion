import { Message } from "../messages"
import { Context } from "@azure/functions"

export interface Processor {
    processMessage(message: Message, context: Context): void
    sendBatch(): Promise<void>
}
