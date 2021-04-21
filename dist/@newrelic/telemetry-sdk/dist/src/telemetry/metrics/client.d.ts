import { BaseClient, SendCallback } from '../base-client';
import { MetricBatch } from './batch';
import { Logger } from '../../common';
export interface MetricClientOptions {
    /**
     * API key with insert access used to authenticate the request.
     * For more information on creating keys, please see:
     * https://docs.newrelic.com/docs/insights/insights-data-sources/custom-data/introduction-event-api#register
     */
    apiKey: string;
    /**
     * Optional host override for metrics endpoint.
     */
    host?: string;
}
export declare class MetricClient extends BaseClient<MetricBatch> {
    private readonly _hasValidKey;
    private readonly _sendDataOptions;
    constructor(options: MetricClientOptions, logger?: Logger);
    private _isValidKey;
    /**
     * Sends a MetricBatch to the New Relic Metrics endpoint.
     * @param data
     * @param  callback
     */
    send(data: MetricBatch, callback: SendCallback<MetricBatch>): void;
}
