import flatten from "./flatten"

describe("flatten", () => {
    it("will flatten an object", () => {
        const flattened = flatten({ a: { b: { c: { d: "test" } } } })
        expect(flattened).toMatchObject({ "a.b.c.d": "test" })
    })
})
