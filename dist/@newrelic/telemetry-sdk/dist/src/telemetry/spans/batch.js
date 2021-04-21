"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LIMIT = 2000;
class SpanBatch {
    constructor(attributes, spans) {
        if (attributes) {
            const common = {};
            common.attributes = attributes;
            this.common = common;
        }
        this.spans = spans || [];
        // if the client programmer passed us an array that's
        // too big, keep the first `LIMIT` items and
        // then use addSpan to add the rest (making the later
        // items subject to the adaptive sampling)
        if (this.spans.length > exports.LIMIT) {
            const remnant = this.spans.splice(exports.LIMIT);
            this.addSpan(...remnant);
        }
    }
    addSpan(...spans) {
        for (let span of spans) {
            this.spans.push(span);
            const len = this.spans.length;
            // keep spans array at its limited value
            if (len > exports.LIMIT) {
                const indexToDrop = this.getRandomInt(0, len - 1);
                const droppedSpan = this.spans[indexToDrop];
                this.spans[indexToDrop] = this.spans[len - 1];
                this.spans[len - 1] = droppedSpan;
                this.spans.pop();
            }
        }
        return this;
    }
    // get a random number between min and max, inclusive
    getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * ((max + 1) - min)) + min;
    }
    getBatchSize() {
        return this.spans.length;
    }
    split() {
        if (this.spans.length === 0) {
            return [];
        }
        if (this.spans.length === 1) {
            const spans = [this.spans[0]];
            const batch = SpanBatch.createNew(this.common, spans);
            return [batch];
        }
        const midpoint = Math.floor(this.spans.length / 2);
        const leftSpans = this.spans.slice(0, midpoint);
        const rightSpans = this.spans.slice(midpoint);
        const leftBatch = SpanBatch.createNew(this.common, leftSpans);
        const rightBatch = SpanBatch.createNew(this.common, rightSpans);
        return [leftBatch, rightBatch];
    }
    static createNew(common, spans) {
        const batch = new SpanBatch(common && common.attributes, spans);
        return batch;
    }
}
exports.SpanBatch = SpanBatch;
//# sourceMappingURL=batch.js.map