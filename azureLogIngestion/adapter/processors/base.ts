import { Context } from "@azure/functions"

export interface Processor {
    processMessage(message: Record<string, any>, context: Context): void
    sendBatch(): Promise<void>
}
