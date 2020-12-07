import { readable, writable } from 'svelte/store';
import { WalletService } from "../services/wallet-service";

export const route = writable('/');
export const currentUser = writable('Guest');
export const balance = writable(0);
export const loggedIn = writable(false);
export const loading = writable(false);
export const displayMode = writable('menuMode'); //menuMode, panelMode, frameMode

let counter = 0;
export const walletService = readable(new WalletService(), (set) => {
    console.log(`Store Sub Count: ${counter++}`);
    /*initialize?*/
    /*set?*/
    return () => { /*clean-up*/};
});