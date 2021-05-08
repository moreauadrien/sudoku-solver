import type Hint from './Hint'
import { nakedSingle } from './SolvingTechniques'

const getHint = (grid): Hint => {
    let hint

    hint = nakedSingle(grid)
    if (hint != undefined) return hint
    return undefined
}

export { getHint }