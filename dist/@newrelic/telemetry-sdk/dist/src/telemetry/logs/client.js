"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_client_1 = require("../base-client");
const LOG_HOST = 'log-api.newrelic.com';
const LOG_PORT = 443;
const LOG_PATH = '/log/v1';
const INVALID_KEY_MESSAGE = 'A valid key must be provided for inserting logs.';
class LogClient extends base_client_1.BaseClient {
    constructor(options, logger) {
        super(logger);
        this._hasValidKey = LogClient._isValidKey(options && options.apiKey);
        const headers = {
            'Api-Key': options && options.apiKey,
        };
        this._sendDataOptions = {
            headers: headers,
            host: (options && options.host) || LOG_HOST,
            pathname: LOG_PATH,
            port: (options && options.port) || LOG_PORT
        };
    }
    static _isValidKey(insertKey) {
        return !!insertKey;
    }
    /**
       * Sends a LogBatch to the New Relic Logs endpoint.
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
exports.LogClient = LogClient;
//# sourceMappingURL=client.js.map