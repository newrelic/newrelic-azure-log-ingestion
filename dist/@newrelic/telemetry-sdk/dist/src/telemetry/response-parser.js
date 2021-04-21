"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_client_1 = require("./base-client");
var RecommendedAction;
(function (RecommendedAction) {
    RecommendedAction[RecommendedAction["Success"] = 0] = "Success";
    RecommendedAction[RecommendedAction["Discard"] = 1] = "Discard";
    RecommendedAction[RecommendedAction["Retry"] = 2] = "Retry";
    RecommendedAction[RecommendedAction["SplitRetry"] = 3] = "SplitRetry";
    RecommendedAction[RecommendedAction["RetryAfter"] = 4] = "RetryAfter";
    RecommendedAction[RecommendedAction["Backoff"] = 5] = "Backoff";
})(RecommendedAction = exports.RecommendedAction || (exports.RecommendedAction = {}));
const discardCodes = new Set([
    400,
    401,
    403,
    404,
    405,
    409,
    410,
    411
]);
/**
 * Returns the recommended action to take based on the response
 * from the New Relic endpoint.
 * @param err
 * @param res
 */
function parseResponse(err, res) {
    if (err) {
        return parseError(err);
    }
    return parseStatus(res.statusCode, res.headers);
}
exports.parseResponse = parseResponse;
function parseStatus(status, headers) {
    const parsedResponse = {
        recommendedAction: RecommendedAction.Backoff
    };
    if (status < 300) {
        parsedResponse.recommendedAction = RecommendedAction.Success;
    }
    else if (discardCodes.has(status)) {
        parsedResponse.recommendedAction = RecommendedAction.Discard;
    }
    else if (status === 408) {
        parsedResponse.recommendedAction = RecommendedAction.Retry;
    }
    else if (status === 413) {
        parsedResponse.recommendedAction = RecommendedAction.SplitRetry;
    }
    else if (status === 429) {
        parsedResponse.recommendedAction = RecommendedAction.RetryAfter;
        const retryTimeInMs = parseInt(headers['retry-after'].toString(), 10) * 1000;
        parsedResponse.retryAfterMs = retryTimeInMs;
    }
    return parsedResponse;
}
function parseError(error) {
    const parsedResponse = {
        recommendedAction: RecommendedAction.Discard,
        error: error
    };
    if (error instanceof base_client_1.RequestResponseError) {
        parsedResponse.recommendedAction = RecommendedAction.Backoff;
        parsedResponse.error = error.innerError;
    }
    return parsedResponse;
}
//# sourceMappingURL=response-parser.js.map