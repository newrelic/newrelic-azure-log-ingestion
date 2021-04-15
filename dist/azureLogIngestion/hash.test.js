"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hash_1 = require("./hash");
describe("farm hash 64", () => {
    it("should hash an entity", () => {
        expect(hash_1.default(123456, "INFRA", "AZUREFUNCTIONAPP", 
        // /subscriptions/{guid}/resourceGroups/{resource-group-name}/{resource-provider-namespace}/{resource-type}/{resource-name}
        "/subscriptions/62767007-2c55-4c76-926e-e8482f4e7f25/resourceGroups/test-group/providers/Microsoft.Web/sites/test-function")).toBe("MTIzNDU2fElORlJBfEFaVVJFRlVOQ1RJT05BUFB8MTE3MjcxOTQ5MTAyOTQ5MTc0MjM");
    });
});
//# sourceMappingURL=hash.test.js.map