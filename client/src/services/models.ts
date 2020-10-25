import { format } from 'date-fns';

export class GpsDetails {
    latitude: number;
    longitude: number;
    radius: number;
    altitude: number;
    speed: number;
    dateTime: string
}

export class CashierRequest {
    customerIpAddress?: string;
    deviceGPS?: GpsDetails;
}

export class CashierResponse {
    error?: boolean;
    paymentId: string;
    cashierScript: string;
}