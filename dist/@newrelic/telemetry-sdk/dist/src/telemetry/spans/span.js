"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Span {
    // eslint-disable-next-line max-params
    constructor(id, traceId, timestamp, name, parentId, serviceName, durationMs, attributes) {
        this.id = id;
        this['trace.id'] = traceId;
        this.timestamp = timestamp;
        if (name || parentId || serviceName || durationMs != null || attributes) {
            this.attributes = attributes || {};
            if (name) {
                this.attributes.name = name;
            }
            if (parentId) {
                this.attributes['parent.id'] = parentId;
            }
            if (serviceName) {
                this.attributes['service.name'] = serviceName;
            }
            if (durationMs != null) {
                this.attributes['duration.ms'] = durationMs;
            }
        }
    }
}
exports.Span = Span;
//# sourceMappingURL=span.js.map