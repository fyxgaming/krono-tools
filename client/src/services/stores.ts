import { writable } from 'svelte/store';

export const route = writable('/');
export const currentUser = writable('Guest');
export const loggedIn = writable(false);
export const loading = writable(false);

