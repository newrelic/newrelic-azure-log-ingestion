const flatten = (obj: Record<string, any>, concatenator = "."): Record<string, any> =>
    Object.keys(obj).reduce((acc, key) => {
        if (typeof obj[key] !== "object") {
            return {
                ...acc,
                [key]: obj[key],
            }
        }

        const flattenedChild = flatten(obj[key], concatenator)

        return {
            ...acc,
            ...Object.keys(flattenedChild).reduce(
                (childAcc, childKey) => ({
                    ...childAcc,
                    [`${key}${concatenator}${childKey}`]: flattenedChild[childKey],
                }),
                {},
            ),
        }
    }, {})

export default flatten
