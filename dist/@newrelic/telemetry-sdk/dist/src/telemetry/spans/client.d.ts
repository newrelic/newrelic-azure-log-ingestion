import { BaseClient, SendCallback } from "../base-client"
import { SpanBatch } from "./batch"
import { Logger } from "../../common"
export interface SpanClientOptions {
    /**
     * API key with insert access used to authenticate the request.
     * For more information on creating keys, please see:
     * https://docs.newrelic.com/docs/insights/insights-data-sources/custom-data/introduction-event-api#register
     */
    apiKey: string
    /**
     * Optional host override for trace endpoint.
     */
    host?: string
    /**
     * Optional port override for trace endpoint.
     */
    port?: number
}
export declare class SpanClient extends BaseClient<SpanBatch> {
    private readonly _hasValidKey
    private readonly _sendDataOptions
    constructor(options: SpanClientOptions, logger?: Logger)
    private _isValidKey
    /**
     * Sends a SpanBatch to the New Relic Trace endpoint.
     * @param data
     * @param callback
     */
    send(data: SpanBatch, callback: SendCallback<SpanBatch>): void
}
