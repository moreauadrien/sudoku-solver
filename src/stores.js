import { writable } from "svelte/store"
import { calculateCandidates } from './solver/utils'



export const currentFocus = writable(undefined)

export const activeTask = writable(undefined)

export const hint = writable(undefined)

export const highlightCase = writable(undefined)


let board = JSON.parse("[{\"index\":0,\"candidates\":[3,4,6,7,8,9]},{\"index\":1,\"candidates\":[1,3,4,7,9]},{\"index\":2,\"candidates\":[1,3,4,6,8,9]},{\"index\":3,\"candidates\":[1,2,3,5,7]},{\"index\":4,\"candidates\":[1,2,4,5,6]},{\"index\":5,\"candidates\":[1,2,4,6,7,9]},{\"index\":6,\"candidates\":[1,3,4,5]},{\"index\":7,\"candidates\":[1,2,6]},{\"index\":8,\"candidates\":[2,3,6]},{\"index\":9,\"value\":2,\"candidates\":[]},{\"index\":10,\"candidates\":[1,3,4,7]},{\"index\":11,\"candidates\":[1,3,4,6]},{\"index\":12,\"candidates\":[1,3,5,7]},{\"index\":13,\"candidates\":[1,4,5,6]},{\"index\":14,\"candidates\":[1,4,6,7]},{\"index\":15,\"candidates\":[1,3,4,5]},{\"index\":16,\"value\":8,\"candidates\":[]},{\"index\":17,\"value\":9,\"candidates\":[]},{\"index\":18,\"value\":5,\"candidates\":[]},{\"index\":19,\"candidates\":[1,3,4,9]},{\"index\":20,\"candidates\":[1,3,4,6,9]},{\"index\":21,\"candidates\":[1,2,3]},{\"index\":22,\"candidates\":[1,2,4,6]},{\"index\":23,\"value\":8,\"candidates\":[]},{\"index\":24,\"value\":7,\"candidates\":[]},{\"index\":25,\"candidates\":[1,2,6]},{\"index\":26,\"candidates\":[2,3,6]},{\"index\":27,\"candidates\":[6,7,8]},{\"index\":28,\"candidates\":[1,7]},{\"index\":29,\"value\":5,\"candidates\":[]},{\"index\":30,\"candidates\":[1,7,8]},{\"index\":31,\"value\":9,\"candidates\":[]},{\"index\":32,\"candidates\":[1,6,7]},{\"index\":33,\"value\":2,\"candidates\":[]},{\"index\":34,\"value\":3,\"candidates\":[]},{\"index\":35,\"value\":4,\"candidates\":[]},{\"index\":36,\"candidates\":[4,8]},{\"index\":37,\"candidates\":[1,2,4]},{\"index\":38,\"candidates\":[1,4,8]},{\"index\":39,\"candidates\":[1,2,8]},{\"index\":40,\"value\":3,\"candidates\":[]},{\"index\":41,\"value\":5,\"candidates\":[]},{\"index\":42,\"value\":6,\"candidates\":[]},{\"index\":43,\"value\":9,\"candidates\":[]},{\"index\":44,\"value\":7,\"candidates\":[]},{\"index\":45,\"candidates\":[3,6,7,9]},{\"index\":46,\"candidates\":[2,3,7,9]},{\"index\":47,\"candidates\":[3,6,9]},{\"index\":48,\"value\":4,\"candidates\":[]},{\"index\":49,\"candidates\":[2,6]},{\"index\":50,\"candidates\":[2,6,7]},{\"index\":51,\"value\":8,\"candidates\":[]},{\"index\":52,\"value\":5,\"candidates\":[]},{\"index\":53,\"value\":1,\"candidates\":[]},{\"index\":54,\"candidates\":[3,4,9]},{\"index\":55,\"candidates\":[3,4,5,9]},{\"index\":56,\"value\":7,\"candidates\":[]},{\"index\":57,\"candidates\":[1,2,5,8]},{\"index\":58,\"candidates\":[1,2,4,5,8]},{\"index\":59,\"candidates\":[1,2,4]},{\"index\":60,\"candidates\":[1,3]},{\"index\":61,\"candidates\":[1,2,6]},{\"index\":62,\"candidates\":[2,3,6]},{\"index\":63,\"value\":1,\"candidates\":[]},{\"index\":64,\"value\":8,\"candidates\":[]},{\"index\":65,\"value\":2,\"candidates\":[]},{\"index\":66,\"value\":6,\"candidates\":[]},{\"index\":67,\"value\":7,\"candidates\":[]},{\"index\":68,\"value\":3,\"candidates\":[]},{\"index\":69,\"value\":9,\"candidates\":[]},{\"index\":70,\"value\":4,\"candidates\":[]},{\"index\":71,\"value\":5,\"candidates\":[]},{\"index\":72,\"candidates\":[3,4]},{\"index\":73,\"value\":6,\"candidates\":[]},{\"index\":74,\"candidates\":[3,4]},{\"index\":75,\"value\":9,\"candidates\":[]},{\"index\":76,\"candidates\":[1,2,4,5]},{\"index\":77,\"candidates\":[1,2,4]},{\"index\":78,\"candidates\":[1,3]},{\"index\":79,\"candidates\":[1,2,7]},{\"index\":80,\"value\":8,\"candidates\":[]}]")

for (let i = 0; i < 81; i++) {
    let cell = board[i]
    board[i] = { index: cell.index, value: cell.value, candidates: cell.candidates }
}


const generateEmptyGrid = () => {
    let grid = []
    for (let i = 0; i < 81; i++) {
        grid.push({ index: i, value: undefined, candidates: [1, 2, 3, 4, 5, 6, 7, 8, 9] })
    }
    return grid
}

const createSudokuStore = () => {
    const { subscribe, update } = writable(board)

    return {
        subscribe,
        setCellValue: (index, value) => {
            update(currentGrid => {
                currentGrid[index].value = value
                return currentGrid
            })
        },
        updateCandidates: () => {
            update(currentGrid => calculateCandidates(currentGrid))
        }
    }
}


export let sudoku = createSudokuStore()

//console.log("sudoku store: ", sudoku.updateCandidates)