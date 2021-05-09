import { writable } from 'svelte/store'

let current_id = 0

const createNotificationStore = () => {
    const { subscribe, set, update } = writable(undefined)

    return {
        subscribe,
        notify: (message, status, type = undefined) => {
            update(current => {
                if (current != undefined) {

                    setTimeout(() => {
                        set({ id: ++current_id, type, message, status })
                    }, 25)
                    return undefined
                }

                return { id: ++current_id, type, message, status }
            })
            return current_id
        },
        dismiss: (id) => {
            if (id == current_id) {
                update(current => ({ ...current, dismiss: true }))
                setTimeout(() => {
                    set(undefined)
                }, 200)
            }
        },
    }
}

export const notificationManager = createNotificationStore()