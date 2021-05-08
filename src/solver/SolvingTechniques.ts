import Hint from './Hint'

const nakedSingle = (grid): Hint => {
    for (let cell of grid) {
        if (cell.candidates.length == 1) {
            let value = cell.candidates[0]
            return new Hint(cell.index, value, `La case mise en valeur ne peut contenir que un ${value}`)
        }
    }
    return undefined
}

export { nakedSingle }