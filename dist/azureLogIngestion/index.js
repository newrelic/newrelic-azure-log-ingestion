"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const adapter_1 = require("./adapter");
const apiKey = process.env["NEW_RELIC_INSERT_KEY"];
const adapter = new adapter_1.default(apiKey);
const eventHubTrigger = async function (context, eventHubMessages) {
    context.log(`Eventhub trigger function called for message array ${eventHubMessages}`);
    const records = JSON.parse(eventHubMessages);
    context.log(`Eventhub trigger function called for message array ${records.records}`);
    adapter.processMessages(records.records, context);
    //records.forEach(adapter.processMessages)
    adapter.sendBatches(context);
};
exports.default = eventHubTrigger;
//# sourceMappingURL=index.js.map