import { BaseClient, SendCallback } from "../base-client"
import { LogBatch } from "./model"
import { Logger } from "../../common"
export interface LogClientOptions {
    /**
     * API key with insert access used to authenticate the request.
     * For more information on creating keys, please see:
     * https://docs.newrelic.com/docs/logs/log-management/log-api/introduction-log-api/#compatibility-requirements
     */
    apiKey: string
    /**
     * Optional host override for log endpoint.
     */
    host?: string
    /**
     * Optional port override for log endpoint.
     */
    port?: number
}
export declare class LogClient extends BaseClient<LogBatch> {
    private readonly _hasValidKey
    private readonly _sendDataOptions
    constructor(options: LogClientOptions, logger?: Logger)
    private static _isValidKey
    /**
     * Sends a LogBatch to the New Relic Logs endpoint.
     * @param data
     * @param callback
     */
    send(data: LogBatch, callback: SendCallback<LogBatch>): void
}
