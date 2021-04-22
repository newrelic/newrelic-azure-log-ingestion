"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Log {
    constructor(message, timestamp, attributes) {
        this.message = message;
        this.timestamp = timestamp || Date.now();
        this.attributes = attributes;
    }
}
exports.Log = Log;
class LogBatch {
    constructor(logs, attributes) {
        this.logs = logs;
        if (attributes) {
            this.common = {
                attributes: attributes
            };
        }
    }
    append(message) {
        this.logs.push(message);
    }
}
exports.LogBatch = LogBatch;
//# sourceMappingURL=model.js.map