import type Hint from './Hint'
import { nakedSingle, hiddenSingle } from './SolvingTechniques'
import { copyGrid, isCandidate, getRows } from './utils'

const getHint = (grid): Hint => {

    let hint

    hint = nakedSingle(grid)
    if (hint != undefined) return hint

    hint = hiddenSingle(grid)
    if (hint != undefined) return hint


    return undefined
}


let solutions = 0
const bruteForce = (grid) => {
    //grid = copyGrid(grid)
    for (let cell of grid) {
        if (cell.value == undefined) {
            for (let n = 1; n <= 9; n++) {
                if (isCandidate(grid, cell.index, n)) {
                    cell.value = n
                    bruteForce(grid)
                    cell.value = undefined
                }
            }

            return
        }
    }
    solutions++
    console.log(solutions)
}

export { getHint, bruteForce }