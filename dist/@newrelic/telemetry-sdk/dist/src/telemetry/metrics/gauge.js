"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const metric_1 = require("./metric");
class GaugeMetric extends metric_1.MetricBase {
    constructor(name, value, attributes, timestamp = Date.now()) {
        super(name, metric_1.MetricType.Gauge, value, attributes, timestamp);
    }
    record(value) {
        this.value = value;
        this.timestamp = Date.now();
        return this;
    }
}
exports.GaugeMetric = GaugeMetric;
//# sourceMappingURL=gauge.js.map