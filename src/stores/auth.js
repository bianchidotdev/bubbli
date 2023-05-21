import { writable, type Writable } from 'svelte/store'

export const loginSession = <Writable<User>> writable(undefined)
