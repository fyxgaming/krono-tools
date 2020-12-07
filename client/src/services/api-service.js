"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.ApiService = void 0;
require("whatwg-fetch");
var date_fns_1 = require("date-fns");
var ApiService = /** @class */ (function () {
    function ApiService() {
    }
    // async createCashier(wallet: Wallet, req: CashierRequest): Promise<CashierResponse> {
    //     console.log('createCashier:Start');
    //     console.log(`REQUEST: ${JSON.stringify(req)}`);
    //     const response: any = await fetch(`https://dev.aws.kronoverse.io/cashier/${domain}/${id}`, {
    //         method: 'POST',
    //         //headers: { api_key: API_KEY, 'Content-Type': 'application/json' },
    //         body: JSON.stringify(req)
    //     });
    //     console.log('createCashier:Response');
    //     console.log(`RESPONSE: ${JSON.stringify(response)}`);
    //     return <CashierResponse>response;
    // }
    // Collect IP address from service
    ApiService.getIp = function () {
        return __awaiter(this, void 0, void 0, function () {
            var ip;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch('https://api.ipify.org/?format=json')];
                    case 1:
                        ip = _a.sent();
                        return [2 /*return*/, ip];
                }
            });
        });
    };
    // Collect geo location from browser
    ApiService.getGps = function () {
        var _a, _b, _c, _d, _e;
        return __awaiter(this, void 0, void 0, function () {
            var geoInfo, geoloc;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0: return [4 /*yield*/, this.getGeoInfo()];
                    case 1:
                        geoInfo = _f.sent();
                        geoloc = {
                            latitude: (_a = geoInfo.coords.latitude) !== null && _a !== void 0 ? _a : 0.0,
                            longitude: (_b = geoInfo.coords.longitude) !== null && _b !== void 0 ? _b : 0.0,
                            radius: (_c = geoInfo.coords.accuracy) !== null && _c !== void 0 ? _c : 0.0,
                            altitude: (_d = geoInfo.coords.altitude) !== null && _d !== void 0 ? _d : 0.0,
                            speed: (_e = geoInfo.coords.speed) !== null && _e !== void 0 ? _e : 0.0,
                            dateTime: date_fns_1.format(geoInfo.timestamp, 'MM-dd-yyyy ppp')
                        };
                        return [2 /*return*/, geoloc];
                }
            });
        });
    };
    ApiService.getGeoInfo = function () {
        return __awaiter(this, void 0, void 0, function () {
            var p;
            return __generator(this, function (_a) {
                p = new Promise(function (resolve, reject) {
                    navigator.geolocation.getCurrentPosition(function (data) {
                        console.log('GPS:', data);
                        resolve(data);
                    }, reject, {
                        maximumAge: 20 * 60 * 10000,
                        timeout: 20000,
                        enableHighAccuracy: true
                    });
                });
                return [2 /*return*/, p];
            });
        });
    };
    return ApiService;
}());
exports.ApiService = ApiService;
//# sourceMappingURL=api-service.js.map