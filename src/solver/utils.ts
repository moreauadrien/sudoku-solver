const getRows = (grid) => {
    let rows = []

    for (let i = 0; i < 9; i++) {
        rows = [...rows, grid.slice(i * 9, 9 + i * 9)]
    }

    return rows
}

const getColumns = (grid) => {
    let columns = []

    for (let i = 0; i < 9; i++) {
        columns = [
            ...columns,
            [
                grid[i + 9 * 0],
                grid[i + 9 * 1],
                grid[i + 9 * 2],
                grid[i + 9 * 3],
                grid[i + 9 * 4],
                grid[i + 9 * 5],
                grid[i + 9 * 6],
                grid[i + 9 * 7],
                grid[i + 9 * 8],
            ],
        ]
    }

    return columns
}



const getSquares = (grid) => {
    let squares = []

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            squares = [
                ...squares,
                [
                    grid[0 + j * 3 + i * 27],
                    grid[1 + j * 3 + i * 27],
                    grid[2 + j * 3 + i * 27],

                    grid[9 + j * 3 + i * 27],
                    grid[10 + j * 3 + i * 27],
                    grid[11 + j * 3 + i * 27],

                    grid[18 + j * 3 + i * 27],
                    grid[19 + j * 3 + i * 27],
                    grid[20 + j * 3 + i * 27],
                ],
            ]

        }
    }

    return squares
}

const isCandidate = (grid, index, value) => {
    const rows = getRows(grid)
    const cellRow = Math.floor(index / 9)

    for (let cell of rows[cellRow]) {
        if (cell.value === value) return false
    }


    const columns = getColumns(grid)
    const cellColum = index % 9

    for (let cell of columns[cellColum]) {
        if (cell.value === value) return false
    }


    const squares = getSquares(grid)
    const x = Math.floor(cellRow / 3)
    const y = Math.floor(cellColum / 3)
    const cellSquare = x * 3 + y

    for (let cell of squares[cellSquare]) {
        if (cell.value === value) return false
    }

    return true



}

const copyGrid = (grid) => {
    let newGrid = []
    grid.forEach(cell => {
        newGrid.push({ ...cell })
    })

    return newGrid
}

const consoleLog = false

const reducer = (accumulator, cell) => (cell.value) ? [...accumulator, cell.value] : accumulator

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
        //@ts-ignore
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
            //@ts-ignore
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

export { getRows, getColumns, getSquares, isCandidate, copyGrid, calculateCandidates }