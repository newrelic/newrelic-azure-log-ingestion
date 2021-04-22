"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LIMIT = 2000;
class EventBatch {
    constructor(attributes, events) {
        this.common = { attributes: attributes || {} };
        this.events = events || [];
        // if the client programmer passed us an array that's
        // too big, keep the first `LIMIT` items and
        // then use addEvent to add the rest (making the later
        // items subject to the adaptive sampling)
        if (this.events.length > exports.LIMIT) {
            const remnant = this.events.splice(exports.LIMIT);
            this.addEvent(...remnant);
        }
    }
    addEvent(...events) {
        for (let event of events) {
            this.events.push(event);
            const len = this.events.length;
            // keep events array at its limited value
            if (len > exports.LIMIT) {
                const indexToDrop = this.getRandomInt(0, len - 1);
                const droppedEvent = this.events[indexToDrop];
                this.events[indexToDrop] = this.events[len - 1];
                this.events[len - 1] = droppedEvent;
                this.events.pop();
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
        return this.events.length;
    }
    split() {
        if (this.events.length === 0) {
            return [];
        }
        if (this.events.length === 1) {
            const events = [this.events[0]];
            const batch = EventBatch.createNew(this.common, events);
            return [batch];
        }
        const midpoint = Math.floor(this.events.length / 2);
        const leftEvents = this.events.slice(0, midpoint);
        const rightEvents = this.events.slice(midpoint);
        const leftBatch = EventBatch.createNew(this.common, leftEvents);
        const rightBatch = EventBatch.createNew(this.common, rightEvents);
        return [leftBatch, rightBatch];
    }
    static createNew(common, events) {
        const batch = new EventBatch(common && common.attributes, events);
        return batch;
    }
    flattenData() {
        return this.events.map((event) => {
            return Object.assign(Object.assign(Object.assign({}, this.common.attributes), event.attributes), { eventType: event.eventType, timestamp: event.timestamp });
        });
    }
}
exports.EventBatch = EventBatch;
//# sourceMappingURL=batch.js.map