import { writable, get } from 'svelte/store'
import { sudoku, highlightCase } from './stores'
import { notificationManager } from './notification_manager'
import { getHint } from './solver/solver.js'

export const activeTask = writable(undefined)

activeTask.subscribe((task) => {
    switch (task) {
        case 'hint':
            manageHint()
            break
    }
})


const manageHint = async () => {
    await sudoku.updateCandidates()

    let hint = getHint(get(sudoku))?.getAsObject()
    if (hint != undefined) {
        highlightCase.set(hint.index)
        notificationManager.notify('hint', hint.hint, 'success')
    } else {
        notificationManager.notify('hint', "Pas d'indice disponible", 'danger')
    }

    activeTask.set(undefined)
}