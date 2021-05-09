import { writable, get } from 'svelte/store'
import { sudoku, highlightCase } from './stores'
import { notificationManager } from './notification_manager'
import { getHint } from './solver/solver.js'
import { copyGrid, calculateCandidates } from './solver/utils.js'

export const activeTask = writable(undefined)

activeTask.subscribe((task) => {
    switch (task) {
        case 'hint':
            manageHint()
            break

        case 'check':
            manageCheck()
            break
    }
})


const manageHint = async () => {
    activeTask.set(undefined)
    await sudoku.updateCandidates()

    let hint = getHint(get(sudoku))?.getAsObject()
    if (hint != undefined) {
        highlightCase.set(hint.index)
        notificationManager.notify(hint.hint, 'success', 'hint')
    } else {
        notificationManager.notify("Pas d'indice disponible", 'danger', 'hint')
    }
}


const manageCheck = () => {
    activeTask.set(undefined)


    let hint

    let grid = copyGrid(get(sudoku))

    do {
        grid = calculateCandidates(grid)
        hint = getHint(grid)?.getAsObject()
        if (hint != undefined) {
            grid[hint.index].value = hint.value
        }
    } while (hint != undefined)

    for (let i = 0; i < 81; i++) {
        if (grid[i].value == undefined) {
            notificationManager.notify('Je ne peux pas résoudre le sudoku', 'danger')

            return
        }
    }

    notificationManager.notify('Le sudoku peut être résolu', 'success')


}