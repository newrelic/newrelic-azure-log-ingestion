import mapper from "./mapper"

describe("mapper", () => {
    it("will map keys of an object", () => {
        const mapped = mapper({ foo: "bar", nested: { bar: "baz" } }, { foo: "bar", bar: "baz" })
        expect(mapped).toMatchObject({ bar: "bar", nested: { baz: "baz" } })
    })
})
