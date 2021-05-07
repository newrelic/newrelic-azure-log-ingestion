import camelcase from "./camelcase"

describe("camelcase", () => {
    it("will camel case keys", () => {
        const camelCased = camelcase({ foo_bar: "barbaz", BarBaz: "blahbloo", nested_obj: { BlingBlong: "test" } })
        expect(camelCased).toMatchObject({
            fooBar: "barbaz",
            barBaz: "blahbloo",
            nestedObj: { blingBlong: "test" },
        })
    })
})
