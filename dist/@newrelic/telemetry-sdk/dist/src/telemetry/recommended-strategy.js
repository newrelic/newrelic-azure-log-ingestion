"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const response_parser_1 = require("./response-parser");
const RETRY_FACTOR = 1;
const MAX_RETRIES = 10;
const BACKOFF_MAX_INTERVAL = 16;
/**
 * Creates a recommended strategy response handling function for
 * Metric and Span clients that will invoke the provided
 * callback upon completion.
 * @param callback
 */
function createRecommendedStrategyHandler(options, callback) {
    return createdRecommendedStrategyHandler;
    function createdRecommendedStrategyHandler(error, response, body, requestData) {
        return recommendedStrategyHandler(error, response, body, requestData, options, callback);
    }
}
exports.createRecommendedStrategyHandler = createRecommendedStrategyHandler;
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
// eslint-disable-next-line max-params
function recommendedStrategyHandler(error, response, body, requestData, options, callback) {
    options = options || {};
    options.retryFactor = options.retryFactor || RETRY_FACTOR;
    options.maxRetries = options.maxRetries || MAX_RETRIES;
    options.backoffMaxInterval = options.backoffMaxInterval || BACKOFF_MAX_INTERVAL;
    if (response) {
        requestData.client.logger.debug('Response status: ', response.statusCode);
    }
    const parsedResponse = response_parser_1.parseResponse(error, response);
    if (parsedResponse.error) {
        requestData.client.logger.debug('Encountered error: ', parsedResponse.error);
    }
    const recommendedAction = parsedResponse.recommendedAction;
    switch (recommendedAction) {
        case response_parser_1.RecommendedAction.Success: {
            return success(requestData, callback);
        }
        case response_parser_1.RecommendedAction.Discard: {
            return dropData(requestData, parsedResponse.error, callback);
        }
        case response_parser_1.RecommendedAction.Retry: {
            return retry(requestData, options, callback);
        }
        case response_parser_1.RecommendedAction.SplitRetry: {
            return splitAndRetry(requestData, options, callback);
        }
        case response_parser_1.RecommendedAction.RetryAfter: {
            return retryAfter(parsedResponse.retryAfterMs, requestData, options, callback);
        }
        case response_parser_1.RecommendedAction.Backoff: {
            return retryWithBackoff(requestData, parsedResponse.error, options, callback);
        }
        default: {
            const unexpectedError = new Error(`Unexpected action: ${response_parser_1.RecommendedAction[recommendedAction]}`);
            requestData.client.logger.error(unexpectedError.message);
            return dropData(requestData, unexpectedError, callback);
        }
    }
}
exports.recommendedStrategyHandler = recommendedStrategyHandler;
function success(requestData, cb) {
    const { client, originalData } = requestData;
    const dataCount = originalData.getBatchSize();
    client.logger.debug(`Successfully sent ${dataCount} data points.`);
    if (cb) {
        setImmediate(cb, null, response_parser_1.RecommendedAction.Success);
    }
}
function dropData(requestData, error, cb) {
    const { client, originalData } = requestData;
    const discardedDataCount = originalData.getBatchSize();
    client.logger.error(`Send failed. Discarding ${discardedDataCount} data points.`);
    if (cb) {
        setImmediate(cb, error, response_parser_1.RecommendedAction.Discard);
    }
}
function retry(requestData, options, cb) {
    const { client, originalData } = requestData;
    const retryCount = requestData.retryCount || 1;
    if (retryCount > options.maxRetries) {
        client.logger.info('Maximum retries reached.');
        return dropData(requestData, null, cb);
    }
    const retryMs = options.retryFactor * 1000;
    client.logger.info(`Send failed. Retrying in ${retryMs}ms.`);
    setTimeout(() => {
        const handler = createRetryHandler(retryCount, options, cb);
        client.send(originalData, handler);
    }, retryMs);
}
function splitAndRetry(requestData, options, cb) {
    const { client, originalData } = requestData;
    const retryCount = requestData.retryCount || 1;
    if (retryCount > options.maxRetries) {
        client.logger.info('Maximum retries reached.');
        return dropData(requestData, null, cb);
    }
    const retryMs = options.retryFactor * 1000;
    client.logger.info(`Batch size too large, splitting and retrying in ${retryMs}ms.`);
    const batches = originalData.split();
    const batchCount = batches.length;
    setTimeout(() => {
        for (let i = 0; i < batchCount; i++) {
            const smallBatch = batches[0];
            const handler = createRetryHandler(retryCount, options, onAllBatchesHandled);
            client.send(smallBatch, handler);
        }
    }, retryMs);
    let sentBatches = 0;
    let lastError = null;
    let hasDiscard = false;
    function onAllBatchesHandled(finalError, finalAction) {
        lastError = finalError || lastError;
        if (finalAction === response_parser_1.RecommendedAction.Discard) {
            hasDiscard = true;
        }
        sentBatches++;
        if (sentBatches >= batchCount) {
            const action = hasDiscard ? response_parser_1.RecommendedAction.Discard : response_parser_1.RecommendedAction.Success;
            cb(lastError, action);
        }
    }
}
function retryAfter(retryAfterMs, requestData, options, cb) {
    const { client, originalData } = requestData;
    const retryCount = requestData.retryCount || 1;
    if (retryCount > options.maxRetries) {
        client.logger.info('Maximum retries reached.');
        return dropData(requestData, null, cb);
    }
    client.logger.error(`Send failed. Retrying in ${retryAfterMs}ms.`);
    setTimeout(() => {
        const handler = createRetryHandler(retryCount, options, cb);
        client.send(originalData, handler);
    }, retryAfterMs);
}
function retryWithBackoff(requestData, error, options, cb) {
    const { client, originalData } = requestData;
    const retryCount = requestData.retryCount || 1;
    if (retryCount > options.maxRetries) {
        client.logger.info('Maximum retries reached.');
        return dropData(requestData, error, cb);
    }
    // If backoff occurs after other retry-types, it will schedule at the interval
    // as if it had been doing backoff retries the whole time.
    const newInterval = options.retryFactor * Math.pow(2, (retryCount - 1));
    const retryMs = Math.min(options.backoffMaxInterval, newInterval) * 1000;
    client.logger.info(`Send failed. Retrying with backoff in ${retryMs} milliseconds.`);
    setTimeout(() => {
        const handler = createRetryHandler(retryCount, options, cb);
        client.send(originalData, handler);
    }, retryMs);
}
function createRetryHandler(retryCount, options, cb) {
    return retryHandler;
    function retryHandler(err, res, body, retryData) {
        retryData.retryCount = retryCount + 1;
        return recommendedStrategyHandler(err, res, body, retryData, options, cb);
    }
}
//# sourceMappingURL=recommended-strategy.js.map