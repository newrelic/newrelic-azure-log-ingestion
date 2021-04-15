"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
const telemetry_sdk_1 = require("@newrelic/telemetry-sdk");
const dbs = ["sql", "mariadb", "postgresql", "cosmos", "table", "storage"];
const nrFormattedAttributes = {
    // Dependency attributes
    DependencyType: "dependency.type",
    Target: "xxx.target",
    Data: {
        db: "db.statement",
        http: "http.url",
    },
    // Request attributes
    HttpMethod: "http.method",
    HttpPath: "http.path",
    Source: "http.source",
    ResultCode: "xxx.responseCode",
    Url: "http.url",
    // General attributes
    Type: "log.type",
};
// TODO: Make this a processor method
const formatAttributes = (message) => {
    const formattedAttributes = {};
    const { DependencyType = "" } = message;
    const attributePrefix = dbs.includes(DependencyType.toLowerCase()) ? "db" : "http";
    Object.entries(message).forEach(([key, value]) => {
        if (nrFormattedAttributes[key]) {
            if (key === "Data") {
                formattedAttributes[nrFormattedAttributes[key][attributePrefix]] = value;
                return;
            }
            const keyWithPrefix = nrFormattedAttributes[key].replace("xxx", attributePrefix);
            formattedAttributes[keyWithPrefix] = value;
            return;
        }
        formattedAttributes[key] = value;
    });
    return formattedAttributes;
};
class SpanProcessor {
    constructor(apiKey) {
        this.client = new telemetry_sdk_1.telemetry.spans.SpanClient({ apiKey });
        this.startNewBatch();
    }
    startNewBatch() {
        this.batch = new telemetry_sdk_1.telemetry.spans.SpanBatch({ "cloudProvider.source": "azure" });
    }
    processMessage(message) {
        // Deleting attributes we do not want to send to New Relic
        // TODO: Make this a part of a processor attribute filter method
        delete message.IKey;
        const { Id, ParentId, OperationId, time, Name, DurationMs, OperationName, Properties = {} } = message, rest = __rest(message, ["Id", "ParentId", "OperationId", "time", "Name", "DurationMs", "OperationName", "Properties"]);
        const epochDate = new Date(time).getTime();
        const attributes = Object.assign({}, formatAttributes(Object.assign(Object.assign({}, rest), Properties)));
        const span = new telemetry_sdk_1.telemetry.spans.Span(Id, OperationId, epochDate, Name, ParentId === OperationId ? null : ParentId, // Determining if this is the root span or not and formatting accordingly
        OperationName, DurationMs, attributes);
        this.batch.addSpan(span);
    }
    // TODO: Make this return a promise
    sendBatch(context) {
        this.client.send(this.batch, (err) => {
            if (err)
                context.log(`Error occurred while sending telemetry to New Relic: ${err}`);
        });
        this.startNewBatch();
    }
}
exports.default = SpanProcessor;
//# sourceMappingURL=spans.js.map