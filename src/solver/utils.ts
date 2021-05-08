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

export { getRows, getColumns, getSquares }