import 'whatwg-fetch';
import { format } from 'date-fns';
export default class ApiService {
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
    static async getIp() {
        const ip = await fetch('https://api.ipify.org/?format=json');
        return ip;
    }
    // Collect geo location from browser
    static async getGps() {
        var _a, _b, _c, _d, _e;
        const geoInfo = await this.getGeoInfo();
        const geoloc = {
            latitude: (_a = geoInfo.coords.latitude) !== null && _a !== void 0 ? _a : 0.0,
            longitude: (_b = geoInfo.coords.longitude) !== null && _b !== void 0 ? _b : 0.0,
            radius: (_c = geoInfo.coords.accuracy) !== null && _c !== void 0 ? _c : 0.0,
            altitude: (_d = geoInfo.coords.altitude) !== null && _d !== void 0 ? _d : 0.0,
            speed: (_e = geoInfo.coords.speed) !== null && _e !== void 0 ? _e : 0.0,
            dateTime: format(geoInfo.timestamp, 'MM-dd-yyyy ppp')
        };
        return geoloc;
    }
    static async getGeoInfo() {
        const p = new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition((data) => {
                console.log('GPS:', data);
                resolve(data);
            }, reject, {
                maximumAge: 20 * 60 * 10000,
                timeout: 20000,
                enableHighAccuracy: true
            });
        });
        return p;
    }
}
//# sourceMappingURL=api-service.js.map