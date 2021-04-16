"use strict";
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
    /**
     * Starts a new span batch, setting common attributes
     */
    startNewBatch() {
        this.batch = new telemetry_sdk_1.telemetry.spans.SpanBatch({ "cloudProvider.source": "azure" });
    }
    /**
     * Processes a span message and adds span to current batch
     */
    processMessage(message) {
        // Deleting attributes we do not want to send to New Relic
        // TODO: Make this a part of a processor attribute filter method
        delete message.IKey;
        const { Id, ParentId, OperationId, time, Name, DurationMs, OperationName, Properties = {}, ...rest } = message;
        const epochDate = new Date(time).getTime();
        const attributes = {
            ...formatAttributes({ ...rest, ...Properties }),
        };
        const span = new telemetry_sdk_1.telemetry.spans.Span(Id, OperationId, epochDate, Name, ParentId === OperationId ? null : ParentId, // Determining if this is the root span or not and formatting accordingly
        OperationName, DurationMs, attributes);
        this.batch.addSpan(span);
    }
    /**
     * Sends span telemetry batches to New Relic
     *
     * Currently this doesn't create a new batch on failure, allowing for
     * reattempts. This will result in a memory leak for subsequent failures.
     * Should set a max attempt count and start new batch when reached.
     */
    sendBatch() {
        return new Promise((resolve, reject) => {
            this.client.send(this.batch, (err) => {
                if (err)
                    reject(err);
            });
            this.startNewBatch();
            resolve();
        });
    }
}
exports.default = SpanProcessor;
//# sourceMappingURL=spans.js.map