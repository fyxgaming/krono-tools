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
    private async getIp() {
        const ip: any = await fetch('https://api.ipify.org/?format=json');
        return ip;
    }

    // Collect geo location from browser
    private async getGps(): Promise<GpsDetails> {
        const geoInfo: any = await this.getGeoInfo();
        const geoloc: GpsDetails = {
            latitude: geoInfo.latitude,
            longitude: geoInfo.longitude,
            radius: geoInfo.accuracy,
            altitude: geoInfo.altitude,
            speed: geoInfo.speed,
            dateTime: format(Date.now(), 'MM-dd-yyyy ppp')
        };
        return geoloc;
    }

    private async getGeoInfo() {
        const p = new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                maximumAge: 20 * 60 * 10000,
                timeout: 20000,
                enableHighAccuracy: true
            });
        });
        return p;
    }



}