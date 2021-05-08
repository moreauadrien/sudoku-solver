import type Hint from './Hint'
import { nakedSingle } from './SolvingTechniques'
import { getRows, getColumns, getSquares } from './utils'

const getHint = (grid): Hint => {
    let hint

    hint = nakedSingle(grid)
    if (hint != undefined) return hint
    return undefined
}

export { getHint }