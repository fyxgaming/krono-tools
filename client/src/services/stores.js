"use strict";
exports.__esModule = true;
exports.walletService = exports.displayMode = exports.loading = exports.loggedIn = exports.currentUser = exports.route = void 0;
var store_1 = require("svelte/store");
var wallet_service_1 = require("../services/wallet-service");
exports.route = store_1.writable('/');
exports.currentUser = store_1.writable('Guest');
exports.loggedIn = store_1.writable(false);
exports.loading = store_1.writable(false);
exports.displayMode = store_1.writable('menuMode'); //menuMode, panelMode, frameMode
var counter = 0;
exports.walletService = store_1.readable(new wallet_service_1.WalletService(), function (set) {
    console.log("Store Sub Count: " + counter++);
    /*initialize?*/
    /*set?*/
    return function () { };
});
//# sourceMappingURL=stores.js.map