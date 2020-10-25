import 'whatwg-fetch';
import { GpsDetails, CashierRequest, CashierResponse } from './models';
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
    private static async getIp() {
        const ip: any = await fetch('https://api.ipify.org/?format=json');
        return ip;
    }

    // Collect geo location from browser
    public static async getGps(): Promise<GpsDetails> {
        const geoInfo: any = await this.getGeoInfo();
        const geoloc: GpsDetails = {
            latitude: geoInfo.coords.latitude ?? 0.0,
            longitude: geoInfo.coords.longitude ?? 0.0,
            radius: geoInfo.coords.accuracy ?? 0.0,
            altitude: geoInfo.coords.altitude ?? 0.0,
            speed: geoInfo.coords.speed ?? 0.0,
            dateTime: format(geoInfo.timestamp, 'MM-dd-yyyy ppp')
        };
        return geoloc;
    }

    private static async getGeoInfo() { 
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