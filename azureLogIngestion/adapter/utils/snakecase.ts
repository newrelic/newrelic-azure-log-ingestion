import * as _ from "lodash"

const toSnakeCase = (obj: Record<string, any>): Record<string, any> => {
    if (_.isObject(obj)) {
        return _(obj)
            .mapKeys((v: any, k: string) => _.snakeCase(k))
            .mapValues((v: any, k: string) => toSnakeCase(v))
            .value()
    }

    return obj
}

export default toSnakeCase
