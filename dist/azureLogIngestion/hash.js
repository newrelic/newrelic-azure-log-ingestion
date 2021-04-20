"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const farmhash_1 = require("farmhash");
const urlSafeChars = { "+": "-", "/": "_", "=": "" };
function hash(accountId, domain, type, resourceId) {
    const resourceHash = farmhash_1.hash64(new Buffer(resourceId));
    return new Buffer(`${accountId}|${domain}|${type}|${resourceHash}`)
        .toString("base64")
        .replace(/[\+\/=]/, (c) => urlSafeChars[c]);
}
exports.default = hash;
//# sourceMappingURL=hash.js.map