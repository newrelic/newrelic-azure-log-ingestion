"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any */
Object.defineProperty(exports, "__esModule", { value: true });
const _noOp = () => { };
class NoOpLogger {
    constructor() {
        this.error = _noOp;
        this.info = _noOp;
        this.debug = _noOp;
    }
}
exports.NoOpLogger = NoOpLogger;
//# sourceMappingURL=logger.js.map