"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const metric_1 = require("./metric");
class CountMetric extends metric_1.MetricBase {
    constructor(name, value = 0, attributes, timestamp, intervalMs) {
        super(name, metric_1.MetricType.Count, value, attributes, timestamp, intervalMs);
    }
    record(value = 1) {
        this.value += value;
        return this;
    }
}
exports.CountMetric = CountMetric;
//# sourceMappingURL=count.js.map