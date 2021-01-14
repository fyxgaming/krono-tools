// import 'whatwg-fetch';
import { format } from 'date-fns';
export class ApiService {
    // Collect IP address from service
    static async getIp() {
        const ip = await fetch('https://api.ipify.org/?format=json');
        return ip;
    }
    static deriveGpsDetails(data) {
        var _a, _b, _c;
        const datePattern = 'MM-dd-yyyy ppp';
        let ts = '';
        try {
            ts = format(data.timestamp, datePattern);
        }
        catch (err) {
            console.error(err);
            ts = format(Date.now(), datePattern);
        }
        const geoloc = {
            latitude: (_a = data.latitude) !== null && _a !== void 0 ? _a : 0.0,
            longitude: (_b = data.longitude) !== null && _b !== void 0 ? _b : 0.0,
            altitude: (_c = data.altitude) !== null && _c !== void 0 ? _c : 0.0,
            radius: 0.0,
            speed: 0.0,
            // radius: data.horizontalAccuracy ?? 0.0,
            // speed: data.verticalAccuracy ?? 0.0,
            dateTime: ts
        };
        return geoloc;
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