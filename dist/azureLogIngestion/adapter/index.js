"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const messages_1 = require("./messages");
const processors_1 = require("./processors");
class Adapter {
    constructor(apiKey) {
        this.spanProcessor = new processors_1.SpanProcessor(apiKey);
    }
    /**
     * Determines the type of telemetry based on the message properties
     *
     * Not yet implemented as there is only one message type implemented.
     * As there is no runtime type checking in TypeScript, the message type
     * will need to be determined by checking for distinct properties/values for
     * that type.
     */
    determineMessageType(message) {
        return messages_1.MessageType.Span;
    }
    /**
     * Identifies messages and hands them off to the appropriate processor
     *
     * There may be situations where a message corresponds to more than one
     * type of telemetry. In this case, the switch/case may not make sense.
     */
    processMessages(messages) {
        const records = JSON.parse(messages);
        records.records.forEach((message) => {
            switch (this.determineMessageType(message)) {
                case messages_1.MessageType.Span:
                    return this.spanProcessor.processMessage(message);
            }
        });
    }
    /**
     * Sends processed batches to New Relic
     *
     * Promise.allSettled() is used as we want to make a best effort to send all
     * batches instead of failing on the first reject. We only log promise rejections.
     */
    sendBatches(context) {
        const batches = [];
        batches.push(this.spanProcessor.sendBatch());
        Promise.allSettled(batches).then((results) => {
            results
                .filter((result) => result.status === "rejected")
                .map((result) => context.log(`Error occurred while sending telemetry to New Relic: ${result.reason}`));
        });
    }
}
exports.default = Adapter;
//# sourceMappingURL=index.js.map