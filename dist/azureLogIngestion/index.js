"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const adapter_1 = require("./adapter");
const apiKey = process.env["NEW_RELIC_INSERT_KEY"];
const adapter = new adapter_1.default(apiKey);
const eventHubTrigger = function (context, eventHubMessages) {
    return __awaiter(this, void 0, void 0, function* () {
        context.log(`Eventhub trigger function called for message array ${eventHubMessages}`);
        eventHubMessages.forEach(adapter.processMessages);
        adapter.sendBatches(context);
    });
};
exports.default = eventHubTrigger;
//# sourceMappingURL=index.js.map