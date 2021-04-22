"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_client_1 = require("../base-client");
const METRIC_HOST = 'metric-api.newrelic.com';
const METRIC_PATH = '/metric/v1';
const INVALID_KEY_MESSAGE = 'A valid key must be provided for inserting metrics.';
class MetricClient extends base_client_1.BaseClient {
    constructor(options, logger) {
        super(logger);
        this._hasValidKey = this._isValidKey(options && options.apiKey);
        const headers = {
            'Api-Key': options && options.apiKey
        };
        this._sendDataOptions = {
            host: (options && options.host) || METRIC_HOST,
            port: 443,
            pathname: METRIC_PATH,
            headers: headers
        };
    }
    _isValidKey(insertKey) {
        return !!insertKey;
    }
    /**
     * Sends a MetricBatch to the New Relic Metrics endpoint.
     * @param data
     * @param  callback
     */
    send(data, callback) {
        if (!this._hasValidKey) {
            const keyError = new Error(INVALID_KEY_MESSAGE);
            callback(keyError, null, null);
        }
        const retryData = {
            client: this,
            originalData: data
        };
        const payload = `[${JSON.stringify(data)}]`;
        this._sendData(this._sendDataOptions, payload, (err, res, body) => {
            callback(err, res, body, retryData);
        });
    }
}
exports.MetricClient = MetricClient;
//# sourceMappingURL=client.js.map