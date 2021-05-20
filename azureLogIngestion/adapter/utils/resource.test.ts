import { hash, parse } from "./resource"

describe("hash", () => {
    it("will hash an entity", () => {
        expect(
            hash(
                123456,
                "INFRA",
                "AZUREFUNCTIONAPP",
                // /subscriptions/{subscription}/resourceGroups/{resourceGroup}/{provider}/{resourceType}/{resourceName}
                "/subscriptions/62767007-2c55-4c76-926e-e8482f4e7f25/resourceGroups/test-group/providers/Microsoft.Web/sites/test-function",
            ),
        ).toBe("MTIzNDU2fElORlJBfEFaVVJFRlVOQ1RJT05BUFB8")
    })
})

describe("parse", () => {
    it("will parse a resource id", () => {
        expect(
            parse(
                "/subscriptions/62767007-2c55-4c76-926e-e8482f4e7f25/resourceGroups/test-group/providers/Microsoft.Web/sites/test-function",
            ),
        ).toMatchObject({
            subscription: "62767007-2c55-4c76-926e-e8482f4e7f25",
            resourceGroup: "test-group",
            provider: "Microsoft.Web",
            resourceType: "sites",
            resourceName: "test-function",
        })
    })
})
