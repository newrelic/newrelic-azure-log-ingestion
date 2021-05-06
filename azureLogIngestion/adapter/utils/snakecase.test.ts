import snakecase from "./snakecase"

describe("snakecase", () => {
    it("will snake case keys", () => {
        const snakeCased = snakecase({ fooBar: "barbaz", BarBaz: "blahbloo", nestedObj: { blingBlong: "test" } })
        expect(snakeCased).toMatchObject({
            foo_bar: "barbaz",
            bar_baz: "blahbloo",
            nested_obj: { bling_blong: "test" },
        })
    })
})
