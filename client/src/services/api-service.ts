// import 'whatwg-fetch';
import { format } from 'date-fns';
import { GpsDetails } from '../models/gps-details';
import { UnityGpsData } from '../models/unity-gps-data';

export class ApiService {

    // Collect IP address from service
    private static async getIp() {
        const ip: any = await fetch('https://api.ipify.org/?format=json');
        return ip;
    }

    public static deriveGpsDetails(data: UnityGpsData) : GpsDetails {
        const datePattern = 'MM-dd-yyyy ppp';
        let ts = '';
        try {
            ts = format(data.timestamp, datePattern);
        } catch (err) {
            console.error(err);
            ts = format(Date.now(), datePattern);
        }
        const geoloc: GpsDetails = {
            latitude: data.latitude ?? 0.0,
            longitude: data.longitude ?? 0.0,
            altitude: data.altitude ?? 0.0,
            radius: 0.0,
            speed: 0.0,
            // radius: data.horizontalAccuracy ?? 0.0,
            // speed: data.verticalAccuracy ?? 0.0,
            dateTime: ts
        };
        return geoloc;
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