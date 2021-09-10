import * as _ from "lodash"

type Attributes = Record<string, any> | Record<string, any>[]

const mapper = (obj: Attributes, map: Record<string, string>): Record<string, any> => {
    if (_.isArray(obj)) {
        return _.map(obj, (o) => mapper(o, map))
    }

    if (_.isObject(obj)) {
        return _(obj)
            .mapKeys((v: any, k: string) => (map[k] ? map[k] : k))
            .mapValues((v: any, k: string) => mapper(v, map))

            .value()
    }

    return obj
}

export default mapper
