"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const https_1 = __importDefault(require("https"));
const common_1 = require("../common");
const zlib_1 = __importDefault(require("zlib"));
const url_1 = __importDefault(require("url"));
const HTTP_METHOD = 'POST';
const _defaultHeaders = {
    'Connection': 'Keep-Alive',
    'Content-Type': 'application/json'
};
class RequestResponseError extends Error {
    constructor(message, innerError) {
        super(message); // 'Error' breaks prototype chain here
        Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
        this.innerError = innerError;
    }
}
exports.RequestResponseError = RequestResponseError;
class BaseClient {
    constructor(logger = new common_1.NoOpLogger()) {
        this.logger = logger;
    }
    addVersionInfo(product, productVersion) {
        this.product = product;
        this.productVersion = productVersion;
    }
    getUserAgentHeaderValue(name, version) {
        if (!this.userAgentHeader) {
            let header = name + '/' + version;
            if (this.product && this.productVersion) {
                header += ' ' + this.product + '/' + this.productVersion;
            }
            this.userAgentHeader = header;
        }
        return this.userAgentHeader;
    }
    static getPackageVersion() {
        if (!BaseClient.packageVersion) {
            try {
                BaseClient.packageVersion = require('../../../package.json').version;
            }
            catch (e) {
                BaseClient.packageVersion = require('../../package.json').version;
            }
        }
        return BaseClient.packageVersion;
    }
    _sendData(sendOptions, payload, callback) {
        zlib_1.default.gzip(payload, (err, compressed) => {
            if (err) {
                callback(err, null, null);
                return;
            }
            const headers = sendOptions.headers || {};
            Object.assign(headers, _defaultHeaders);
            headers.Host = sendOptions.host;
            headers['Content-Encoding'] = 'gzip';
            headers['Content-Length'] = compressed.length;
            headers['User-Agent'] = this.getUserAgentHeaderValue('NewRelic-nodejs-TelemetrySDK', BaseClient.getPackageVersion());
            const agentKeepAlive = new https_1.default.Agent({ keepAlive: true });
            const options = {
                agent: agentKeepAlive,
                method: HTTP_METHOD,
                setHost: false,
                host: sendOptions.host,
                port: sendOptions.port,
                path: url_1.default.format({ pathname: sendOptions.pathname, query: sendOptions.query }),
                headers
            };
            const req = https_1.default.request(options);
            req.on('error', (error) => {
                callback(new RequestResponseError(error.message, error), null, null);
            });
            req.on('response', (res) => {
                res.setEncoding('utf8');
                let rawBody = '';
                res.on('data', (data) => {
                    rawBody += data;
                });
                res.on('error', (error) => {
                    callback(new RequestResponseError(error.message, error), res, null);
                });
                res.on('end', () => {
                    callback(null, res, rawBody);
                });
            });
            req.write(compressed);
            req.end();
        });
    }
}
exports.BaseClient = BaseClient;
//# sourceMappingURL=base-client.js.map