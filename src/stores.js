import { writable } from "svelte/store"

export const currentFocus = writable(undefined)

export const activeTask = writable(undefined)



const generateEmptyGrid = () => {
    let grid = []
    for (let i = 0; i < 81; i++) {
        grid.push({ index: i, value: undefined, candidates: [1, 2, 3, 4, 5, 6, 7, 8, 9] })
    }
    return grid
}

const createSudokuStore = () => {
    const { subscribe, set, update } = writable(generateEmptyGrid())

    return {
        subscribe,
        setCellValue: (index, value) => {
            update(currentGrid => {
                currentGrid[index].value = value
                return currentGrid
            })
        }
    }
}


export let sudoku = createSudokuStore()