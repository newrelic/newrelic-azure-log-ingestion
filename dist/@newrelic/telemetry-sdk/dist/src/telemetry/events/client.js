"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_client_1 = require("../base-client");
const EVENT_HOST = 'insights-collector.nr-data.net';
const EVENT_PORT = 443;
const EVENT_PATH = '/v1/accounts/events';
const INVALID_KEY_MESSAGE = 'A valid key must be provided for inserting events.';
class EventClient extends base_client_1.BaseClient {
    constructor(options, logger) {
        super(logger);
        this._hasValidKey = this._isValidKey(options && options.apiKey);
        const headers = {
            'Api-Key': options && options.apiKey,
        };
        this._sendDataOptions = {
            headers: headers,
            host: (options && options.host) || EVENT_HOST,
            pathname: EVENT_PATH,
            port: (options && options.port) || EVENT_PORT
        };
    }
    _isValidKey(insertKey) {
        return !!insertKey;
    }
    /**
     * Sends a EventBatch to the New Relic Event endpoint.
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
        const payload = JSON.stringify(data.flattenData());
        this._sendData(this._sendDataOptions, payload, (err, res, body) => {
            callback(err, res, body, retryData);
        });
    }
}
exports.EventClient = EventClient;
//# sourceMappingURL=client.js.map