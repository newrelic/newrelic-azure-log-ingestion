/// <reference types="node" />
import { IncomingMessage } from 'http';
import { RequestData, SendCallback } from './base-client';
import { RecommendedAction } from './response-parser';
import { MetricBatch } from './metrics';
import { SpanBatch } from './spans';
interface Callback {
    (finalError?: Error, finalAction?: RecommendedAction): void;
}
export declare type Batch = MetricBatch | SpanBatch;
export interface RecommendedStrategyOptions {
    /**
     * Factor in seconds by which retry intervals are calculated.
     * A 408 retry will retry exactly by the value. Backoff retries will
     * exponentially increase time of next backoff using this value as the base.
     * For example: a value of 1 (one second) will retry similar to: [1, 2, 4, 8, 16, ...]
     */
    retryFactor?: number;
    /**
     * Maximum number of retries before failing and discarding data.
     * All retries, regardless of type (retry-after, backoff, etc.),
     * will count towards this maximum.
     * For example: a 5 retry maximum when using expontential backoff will retry
     * similar to [1, 2, 4, 8, 16] and then stop retrying and discard data.
     */
    maxRetries?: number;
    /**
     * Maximum backoff retry interval in seconds.
     * For example: 1s factor with 16s maximum will
     * retry similar to: [1, 2, 4, 8, 16, 16, 16, ...]
     */
    backoffMaxInterval?: number;
}
/**
 * Creates a recommended strategy response handling function for
 * Metric and Span clients that will invoke the provided
 * callback upon completion.
 * @param callback
 */
export declare function createRecommendedStrategyHandler<T extends Batch>(options?: RecommendedStrategyOptions, callback?: Callback): SendCallback<T>;
/**
 * Recommended strategy response handling function for Metric and Span clients.
 * Typically based to the callback argument for Metric and Span clients.
 * May be invoked manually.
 * @param error
 * @param response
 * @param body
 * @param requestData
 * @param options Optional options that can be manually provided to the function.
 * @param callback Optional callback that can be manually provided to the function.
 */
export declare function recommendedStrategyHandler<T extends Batch>(error: Error, response: IncomingMessage, body: string, requestData: RequestData<T>, options?: RecommendedStrategyOptions, callback?: Callback): void;
export {};
