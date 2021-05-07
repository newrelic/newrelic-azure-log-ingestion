import * as _ from "lodash"

type Attributes = Record<string, any> | Record<string, any>[]

const toCamelCase = (obj: Attributes): Record<string, any> => {
    if (_.isArray(obj)) {
        return _.map(obj, toCamelCase)
    }

    if (_.isObject(obj)) {
        return _(obj)
            .mapKeys((v: any, k: string) => _.camelCase(k))
            .mapValues((v: any, k: string) => toCamelCase(v))
            .value()
    }

    return obj
}

export default toCamelCase
