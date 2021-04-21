/// <reference types="node" />
import { IncomingMessage } from 'http';
export declare enum RecommendedAction {
    Success = 0,
    Discard = 1,
    Retry = 2,
    SplitRetry = 3,
    RetryAfter = 4,
    Backoff = 5
}
interface ParsedResponse {
    recommendedAction: RecommendedAction;
    retryAfterMs?: number;
    error?: Error;
}
/**
 * Returns the recommended action to take based on the response
 * from the New Relic endpoint.
 * @param err
 * @param res
 */
export declare function parseResponse(err: Error, res: IncomingMessage): ParsedResponse;
export {};
