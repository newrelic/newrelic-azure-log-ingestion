"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LIMIT = 2000;
class MetricBatch {
    constructor(attributes, timestamp, interval, metrics) {
        const common = {};
        if (attributes) {
            common.attributes = attributes;
        }
        if (interval != null) {
            common['interval.ms'] = interval;
        }
        if (timestamp != null) {
            common.timestamp = timestamp;
        }
        if (Object.keys(common).length) {
            this.common = common;
        }
        this.metrics = metrics || [];
        if (this.metrics.length > exports.LIMIT) {
            const remnant = this.metrics.splice(exports.LIMIT);
            for (const idAndRemnant of remnant.entries()) {
                this.addMetric(idAndRemnant[1]);
            }
        }
    }
    getBatchSize() {
        return this.metrics.length;
    }
    split() {
        if (this.metrics.length === 0) {
            return [];
        }
        if (this.metrics.length === 1) {
            const metrics = [this.metrics[0]];
            const batch = MetricBatch.createNew(this.common, metrics);
            return [batch];
        }
        const midpoint = Math.floor(this.metrics.length / 2);
        const leftMetrics = this.metrics.slice(0, midpoint);
        const rightMetrics = this.metrics.slice(midpoint);
        const leftBatch = MetricBatch.createNew(this.common, leftMetrics);
        const rightBatch = MetricBatch.createNew(this.common, rightMetrics);
        return [leftBatch, rightBatch];
    }
    static createNew(common, metrics) {
        const batch = new MetricBatch(common && common.attributes, common && common.timestamp, common && common['interval.ms'], metrics);
        return batch;
    }
    computeInterval(endTime) {
        this.common['interval.ms'] = endTime - this.common.timestamp;
        return this;
    }
    addMetric(metric) {
        this.metrics.push(metric);
        const len = this.metrics.length;
        if (len > exports.LIMIT) {
            const indexToDrop = this.getRandomInt(0, len - 1);
            const droppedMetric = this.metrics[indexToDrop];
            this.metrics[indexToDrop] = this.metrics[len - 1];
            this.metrics[len - 1] = droppedMetric;
            this.metrics.pop();
        }
        return this;
    }
    // get a random number between min and max, inclusive
    getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * ((max + 1) - min)) + min;
    }
}
exports.MetricBatch = MetricBatch;
//# sourceMappingURL=batch.js.map