import Hint from './Hint'
import { getRows, getColumns, getSquares } from './utils'

const nakedSingle = (grid): Hint => {
    for (let cell of grid) {
        if (cell.candidates.length == 1) {
            let value = cell.candidates[0]
            return new Hint(cell.index, value, `La case mise en valeur ne peut contenir que un ${value}`)
        }
    }
    return undefined
}

const hiddenSingle = (grid): Hint => {
    const rows = getRows(grid)
    const columns = getColumns(grid)
    const squares = getSquares(grid)

    const searchHiddenSingleInArray = (array) => {
        for (let subarray of array) {
            let count = {
                1: { number: 0, index: -1 },
                2: { number: 0, index: -1 },
                3: { number: 0, index: -1 },
                4: { number: 0, index: -1 },
                5: { number: 0, index: -1 },
                6: { number: 0, index: -1 },
                7: { number: 0, index: -1 },
                8: { number: 0, index: -1 },
                9: { number: 0, index: -1 },
            }

            for (let cell of subarray) {
                for (let candidate of cell.candidates) {
                    count[candidate].number = count[candidate].number + 1
                    count[candidate].index = cell.index
                }
            }

            for (let i = 1; i <= 9; i++) {
                if (count[i].number == 1) return { index: count[i].index, value: i }
            }
        }

        return undefined
    }

    let hint = searchHiddenSingleInArray(rows)
    if (hint != undefined) return new Hint(hint.index, hint.value, `La case mise en valeur est la seul de la ligne à pouvoir contenir le chiffre ${hint.value}`)



    hint = searchHiddenSingleInArray(columns)
    if (hint != undefined) return new Hint(hint.index, hint.value, `La case mise en valeur est la seul de la colones à pouvoir contenir le chiffre ${hint.value}`)



    hint = searchHiddenSingleInArray(squares)
    if (hint != undefined) return new Hint(hint.index, hint.value, `La case mise en valeur est la seul du carré à pouvoir contenir le chiffre ${hint.value}`)




    return undefined
}

export { nakedSingle, hiddenSingle }