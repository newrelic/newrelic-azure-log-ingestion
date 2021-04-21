import { BaseClient, SendCallback } from '../base-client';
import { EventBatch } from './batch';
import { Logger } from '../../common';
export interface EventClientOptions {
    /**
     * API key with insert access used to authenticate the request.
     * For more information on creating keys, please see:
     * https://docs.newrelic.com/docs/insights/insights-data-sources/custom-data/introduction-event-api#register
     */
    apiKey: string;
    /**
     * Optional host override for event endpoint.
     */
    host?: string;
    /**
     * Optional port override for trace endpoint.
     */
    port?: number;
}
export declare class EventClient extends BaseClient<EventBatch> {
    private readonly _hasValidKey;
    private readonly _sendDataOptions;
    constructor(options: EventClientOptions, logger?: Logger);
    private _isValidKey;
    /**
     * Sends a EventBatch to the New Relic Event endpoint.
     * @param data
     * @param callback
     */
    send(data: EventBatch, callback: SendCallback<EventBatch>): void;
}
