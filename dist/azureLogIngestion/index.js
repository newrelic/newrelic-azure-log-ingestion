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
const telemetry_1 = require("@newrelic/telemetry-sdk/dist/src/telemetry");
const eventHubTrigger = function (context, eventHubMessages) {
    return __awaiter(this, void 0, void 0, function* () {
        const apiKey = process.env["NEW_RELIC_INSERT_KEY"];
        const metricClient = new telemetry_1.metrics.MetricClient({
            apiKey,
        });
        const spansClient = new telemetry_1.spans.SpanClient({
            apiKey,
        });
        const spanBatch = new telemetry_1.spans.SpanBatch();
        const metricBatch = new telemetry_1.metrics.MetricBatch();
        const messages = JSON.parse(eventHubMessages[0]);
        messages.records.forEach((message) => {
            const { Id, ParentId, OperationId, time, Name, DurationMs, AppRoleName, OperationName, Type, AppRoleInstance, ClientIP, SDKVersion, Success, ResourceGUID, _BilledSize, Properties = null, } = message;
            const epochDate = new Date(time).getTime();
            const attributes = {
                Type,
                AppRoleInstance,
                ClientIP,
                SDKVersion,
                Success,
                ResourceGUID,
                BilledSize: _BilledSize,
            };
            if (Properties) {
                for (const x in Properties) {
                    attributes[x] = Properties[x];
                }
            }
            const span = new telemetry_1.spans.Span(Id, OperationId, epochDate, Name, OperationId, OperationName, DurationMs, attributes);
            spanBatch.addSpan(span);
        });
        spansClient.send(spanBatch, (err, res, body) => {
            context.log("NR RES");
            context.log(res.statusCode);
            context.log(body);
            context.log(err);
        });
    });
};
exports.default = eventHubTrigger;
//# sourceMappingURL=index.js.map