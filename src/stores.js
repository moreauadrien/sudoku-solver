import { writable } from "svelte/store"

export const currentFocus = writable(undefined)

export const activeTask = writable(undefined)

export const hint = writable(undefined)

export const highlightCase = writable(undefined)


let board = JSON.parse("[{\"index\":0,\"value\":4,\"candidates\":[1,2,3,4,5,6,7,8,9]},{\"index\":1,\"candidates\":[1,2,3,4,5,6,7,8,9]},{\"index\":2,\"value\":1,\"candidates\":[1,2,3,4,5,6,7,8,9]},{\"index\":3,\"value\":2,\"candidates\":[1,2,3,4,5,6,7,8,9]},{\"index\":4,\"value\":9,\"candidates\":[1,2,3,4,5,6,7,8,9]},{\"index\":5,\"candidates\":[1,2,3,4,5,6,7,8,9]},{\"index\":6,\"candidates\":[1,2,3,4,5,6,7,8,9]},{\"index\":7,\"value\":7,\"candidates\":[1,2,3,4,5,6,7,8,9]},{\"index\":8,\"value\":5,\"candidates\":[1,2,3,4,5,6,7,8,9]},{\"index\":9,\"value\":2,\"candidates\":[1,2,3,4,5,6,7,8,9]},{\"index\":10,\"candidates\":[1,2,3,4,5,6,7,8,9]},{\"index\":11,\"candidates\":[1,2,3,4,5,6,7,8,9]},{\"index\":12,\"value\":3,\"candidates\":[1,2,3,4,5,6,7,8,9]},{\"index\":13,\"candidates\":[1,2,3,4,5,6,7,8,9]},{\"index\":14,\"candidates\":[1,2,3,4,5,6,7,8,9]},{\"index\":15,\"value\":8,\"candidates\":[1,2,3,4,5,6,7,8,9]},{\"index\":16,\"candidates\":[1,2,3,4,5,6,7,8,9]},{\"index\":17,\"candidates\":[1,2,3,4,5,6,7,8,9]},{\"index\":18,\"candidates\":[1,2,3,4,5,6,7,8,9]},{\"index\":19,\"candidates\":[1,2,3,4,5,6,7,8,9]},{\"index\":20,\"value\":7,\"candidates\":[1,2,3,4,5,6,7,8,9]},{\"index\":21,\"candidates\":[1,2,3,4,5,6,7,8,9]},{\"index\":22,\"value\":8,\"candidates\":[1,2,3,4,5,6,7,8,9]},{\"index\":23,\"candidates\":[1,2,3,4,5,6,7,8,9]},{\"index\":24,\"candidates\":[1,2,3,4,5,6,7,8,9]},{\"index\":25,\"candidates\":[1,2,3,4,5,6,7,8,9]},{\"index\":26,\"value\":6,\"candidates\":[1,2,3,4,5,6,7,8,9]},{\"index\":27,\"candidates\":[1,2,3,4,5,6,7,8,9]},{\"index\":28,\"candidates\":[1,2,3,4,5,6,7,8,9]},{\"index\":29,\"candidates\":[1,2,3,4,5,6,7,8,9]},{\"index\":30,\"value\":1,\"candidates\":[1,2,3,4,5,6,7,8,9]},{\"index\":31,\"candidates\":[1,2,3,4,5,6,7,8,9]},{\"index\":32,\"value\":3,\"candidates\":[1,2,3,4,5,6,7,8,9]},{\"index\":33,\"candidates\":[1,2,3,4,5,6,7,8,9]},{\"index\":34,\"value\":6,\"candidates\":[1,2,3,4,5,6,7,8,9]},{\"index\":35,\"value\":2,\"candidates\":[1,2,3,4,5,6,7,8,9]},{\"index\":36,\"value\":1,\"candidates\":[1,2,3,4,5,6,7,8,9]},{\"index\":37,\"candidates\":[1,2,3,4,5,6,7,8,9]},{\"index\":38,\"value\":5,\"candidates\":[1,2,3,4,5,6,7,8,9]},{\"index\":39,\"candidates\":[1,2,3,4,5,6,7,8,9]},{\"index\":40,\"candidates\":[1,2,3,4,5,6,7,8,9]},{\"index\":41,\"candidates\":[1,2,3,4,5,6,7,8,9]},{\"index\":42,\"value\":4,\"candidates\":[1,2,3,4,5,6,7,8,9]},{\"index\":43,\"candidates\":[1,2,3,4,5,6,7,8,9]},{\"index\":44,\"value\":3,\"candidates\":[1,2,3,4,5,6,7,8,9]},{\"index\":45,\"value\":7,\"candidates\":[1,2,3,4,5,6,7,8,9]},{\"index\":46,\"value\":3,\"candidates\":[1,2,3,4,5,6,7,8,9]},{\"index\":47,\"candidates\":[1,2,3,4,5,6,7,8,9]},{\"index\":48,\"value\":6,\"candidates\":[1,2,3,4,5,6,7,8,9]},{\"index\":49,\"candidates\":[1,2,3,4,5,6,7,8,9]},{\"index\":50,\"value\":8,\"candidates\":[1,2,3,4,5,6,7,8,9]},{\"index\":51,\"candidates\":[1,2,3,4,5,6,7,8,9]},{\"index\":52,\"candidates\":[1,2,3,4,5,6,7,8,9]},{\"index\":53,\"candidates\":[1,2,3,4,5,6,7,8,9]},{\"index\":54,\"value\":6,\"candidates\":[1,2,3,4,5,6,7,8,9]},{\"index\":55,\"candidates\":[1,2,3,4,5,6,7,8,9]},{\"index\":56,\"candidates\":[1,2,3,4,5,6,7,8,9]},{\"index\":57,\"candidates\":[1,2,3,4,5,6,7,8,9]},{\"index\":58,\"value\":2,\"candidates\":[1,2,3,4,5,6,7,8,9]},{\"index\":59,\"candidates\":[1,2,3,4,5,6,7,8,9]},{\"index\":60,\"candidates\":[1,2,3,4,5,6,7,8,9]},{\"index\":61,\"value\":3,\"candidates\":[1,2,3,4,5,6,7,8,9]},{\"index\":62,\"candidates\":[1,2,3,4,5,6,7,8,9]},{\"index\":63,\"candidates\":[1,2,3,4,5,6,7,8,9]},{\"index\":64,\"candidates\":[1,2,3,4,5,6,7,8,9]},{\"index\":65,\"value\":7,\"candidates\":[1,2,3,4,5,6,7,8,9]},{\"index\":66,\"candidates\":[1,2,3,4,5,6,7,8,9]},{\"index\":67,\"candidates\":[1,2,3,4,5,6,7,8,9]},{\"index\":68,\"value\":1,\"candidates\":[1,2,3,4,5,6,7,8,9]},{\"index\":69,\"candidates\":[1,2,3,4,5,6,7,8,9]},{\"index\":70,\"candidates\":[1,2,3,4,5,6,7,8,9]},{\"index\":71,\"value\":4,\"candidates\":[1,2,3,4,5,6,7,8,9]},{\"index\":72,\"value\":8,\"candidates\":[1,2,3,4,5,6,7,8,9]},{\"index\":73,\"value\":9,\"candidates\":[1,2,3,4,5,6,7,8,9]},{\"index\":74,\"candidates\":[1,2,3,4,5,6,7,8,9]},{\"index\":75,\"candidates\":[1,2,3,4,5,6,7,8,9]},{\"index\":76,\"value\":6,\"candidates\":[1,2,3,4,5,6,7,8,9]},{\"index\":77,\"value\":5,\"candidates\":[1,2,3,4,5,6,7,8,9]},{\"index\":78,\"value\":1,\"candidates\":[1,2,3,4,5,6,7,8,9]},{\"index\":79,\"candidates\":[1,2,3,4,5,6,7,8,9]},{\"index\":80,\"value\":7,\"candidates\":[1,2,3,4,5,6,7,8,9]}]")

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

const copyGrid = (grid) => {
    let newGrid = []
    grid.forEach(cell => {
        newGrid.push({ ...cell })
    })

    return newGrid
}

const reducer = (accumulator, cell) => (cell.value) ? [...accumulator, cell.value] : accumulator


const consoleLog = false

const calculateCandidates = (grid) => {
    grid = copyGrid(grid)

    if (consoleLog) console.groupCollapsed("candidates")
    if (consoleLog) console.groupCollapsed("lines")
    //lines work
    for (let i = 0; i < 9; i++) {

        let lineNumbers = grid.slice(i * 9, i * 9 + 9).reduce(reducer, [])
        if (consoleLog) console.log(`line n°${i}`, lineNumbers)


        let candidates = [1, 2, 3, 4, 5, 6, 7, 8, 9]
        candidates = candidates.filter(number => lineNumbers.indexOf(number) == -1)

        for (let index = 0; index < 9; index++) {
            let cell = grid[index + 9 * i]
            if (cell.value == undefined) {
                cell.candidates = candidates
            } else {
                cell.candidates = []
            }
        }

    }

    if (consoleLog) console.groupEnd()

    if (consoleLog) console.groupCollapsed("columns")
    //columns work
    for (let i = 0; i < 9; i++) {
        let columnNumbers = []
        for (let j = 0; j < 9; j++) {
            let value = grid[i + j * 9].value
            if (value != undefined) columnNumbers.push(value)
        }

        columnNumbers = [...new Set(columnNumbers)]

        if (consoleLog) console.log(`column n°${i}`, columnNumbers)

        for (let index = 0; index < 9; index++) {
            let cell = grid[i + index * 9]
            cell.candidates = cell.candidates.filter(number => columnNumbers.indexOf(number) == -1)
        }

    }

    if (consoleLog) console.groupEnd()


    //squares work
    if (consoleLog) console.groupCollapsed("squares")

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            let indexes = [
                0 + j * 3 + i * 27,
                1 + j * 3 + i * 27,
                2 + j * 3 + i * 27,

                9 + j * 3 + i * 27,
                10 + j * 3 + i * 27,
                11 + j * 3 + i * 27,

                18 + j * 3 + i * 27,
                19 + j * 3 + i * 27,
                20 + j * 3 + i * 27,
            ]

            let squareNumbers = indexes.map(index => grid[index].value)

            squareNumbers = [...new Set(squareNumbers)].filter(number => number != undefined)

            if (consoleLog) console.log(`square n°${j + 3 * i}`, squareNumbers)


            for (let iter = 0; iter < 9; iter++) {
                let index = indexes[iter]
                let cell = grid[index]
                cell.candidates = cell.candidates.filter(number => squareNumbers.indexOf(number) == -1)

            }
        }
    }

    if (consoleLog) console.groupEnd()

    if (consoleLog) console.groupEnd()


    return grid
}

const createSudokuStore = () => {
    const { subscribe, update } = writable(generateEmptyGrid())

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