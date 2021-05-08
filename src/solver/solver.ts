import Hint from './Hint'

const getHint = (): Hint => {
    return new Hint(1, 1, "hint")
}

export { getHint }