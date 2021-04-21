"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Event {
    constructor(eventType, attributes, timestamp) {
        this.eventType = eventType;
        this.attributes = attributes || {};
        this.timestamp = timestamp;
    }
}
exports.Event = Event;
//# sourceMappingURL=event.js.map