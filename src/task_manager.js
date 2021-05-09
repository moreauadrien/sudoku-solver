import { writable } from 'svelte/store'

export const activeTask = writable(undefined)

activeTask.subscribe((task) => {

})