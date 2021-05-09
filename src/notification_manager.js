import { writable } from 'svelte/store'

let current_id = 0

const createNotificationStore = () => {
    const { subscribe, set, update } = writable(undefined)

    return {
        subscribe,
        notify: (type, message, status, seconds = 30) => {
            set({ id: ++current_id, type, message, status, seconds })
            return current_id
        },
        dismiss: (id) => {
            if (id == current_id) {
                update((object) => ({ ...object, dismiss: true }))
                setTimeout(() => {
                    set(undefined)
                }, 200)
            }
        },
    }
}

export const notificationManager = createNotificationStore()