"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_client_1 = require("../base-client");
const SPAN_HOST = 'trace-api.newrelic.com';
const SPAN_PORT = 443;
const SPAN_PATH = '/trace/v1';
const SPAN_DATA_FORMAT = 'newrelic';
const SPAN_DATA_FORMAT_VERSION = 1;
const INVALID_KEY_MESSAGE = 'A valid key must be provided for inserting spans.';
class SpanClient extends base_client_1.BaseClient {
    constructor(options, logger) {
        super(logger);
        this._hasValidKey = this._isValidKey(options && options.apiKey);
        const headers = {
            'Api-Key': options && options.apiKey,
            'Data-Format': SPAN_DATA_FORMAT,
            'Data-Format-Version': SPAN_DATA_FORMAT_VERSION,
        };
        this._sendDataOptions = {
            headers: headers,
            host: (options && options.host) || SPAN_HOST,
            pathname: SPAN_PATH,
            port: (options && options.port) || SPAN_PORT
        };
    }
    _isValidKey(insertKey) {
        return !!insertKey;
    }
    /**
     * Sends a SpanBatch to the New Relic Trace endpoint.
     * @param data
     * @param callback
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
exports.SpanClient = SpanClient;
//# sourceMappingURL=client.js.map