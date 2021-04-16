import { Message } from "../messages"

export interface Processor {
    processMessage(message: Message): void
    sendBatch(): Promise<void>
}
