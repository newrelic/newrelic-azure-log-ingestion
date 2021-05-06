import flatten from "./flatten"
import snakecase from "./snakecase"

const normalize = (obj: Record<string, any>): Record<string, any> => {
    return flatten(snakecase(obj))
}

export default normalize
