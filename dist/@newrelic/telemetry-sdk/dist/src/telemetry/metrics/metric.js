"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MetricType;
(function (MetricType) {
    MetricType["Summary"] = "summary";
    MetricType["Gauge"] = "gauge";
    MetricType["Count"] = "count";
})(MetricType = exports.MetricType || (exports.MetricType = {}));
class MetricBase {
    // eslint-disable-next-line max-params
    constructor(name, type = MetricType.Gauge, value, attributes, timestamp, intervalMs) {
        this.name = name;
        this.type = type;
        this.value = value;
        if (attributes && Object.keys(attributes).length > 0) {
            this.attributes = attributes;
        }
        this.timestamp = timestamp;
        this['interval.ms'] = intervalMs;
    }
}
exports.MetricBase = MetricBase;
//# sourceMappingURL=metric.js.map