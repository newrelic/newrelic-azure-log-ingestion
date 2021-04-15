"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const messages_1 = require("./messages");
const processors_1 = require("./processors");
class Adapter {
    constructor(apiKey) {
        this.spanProcessor = new processors_1.SpanProcessor(apiKey);
    }
    determineMessageType(message) {
        return messages_1.MessageType.Span;
    }
    processMessages(messages) {
        const records = JSON.parse(messages);
        records.records.forEach((message) => {
            switch (this.determineMessageType(message)) {
                case messages_1.MessageType.Span:
                    return this.spanProcessor.processMessage(message);
            }
        });
    }
    sendBatches(context) {
        this.spanProcessor.sendBatch(context);
    }
}
exports.default = Adapter;
//# sourceMappingURL=index.js.map