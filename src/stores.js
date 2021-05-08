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