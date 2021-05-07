import flatten from "./flatten"
import camelcase from "./camelcase"

const normalize = (obj: Record<string, any>): Record<string, any> => {
    return flatten(camelcase(obj))
}

export default normalize
