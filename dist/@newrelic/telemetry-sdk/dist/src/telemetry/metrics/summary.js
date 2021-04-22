"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const metric_1 = require("./metric");
class SummaryMetric extends metric_1.MetricBase {
    constructor(name, value = {
        count: 0,
        sum: 0,
        min: Infinity,
        max: -Infinity
    }, attributes, timestamp, intervalMs) {
        super(name, metric_1.MetricType.Summary, value, attributes, timestamp, intervalMs);
    }
    record(value) {
        ++this.value.count;
        this.value.sum += value;
        this.value.min = Math.min(this.value.min, value);
        this.value.max = Math.max(this.value.max, value);
        return this;
    }
}
exports.SummaryMetric = SummaryMetric;
//# sourceMappingURL=summary.js.map