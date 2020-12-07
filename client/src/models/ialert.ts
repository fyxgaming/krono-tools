export interface IAlert {
    body: string;
    type?: 'warn' | 'ok';
    duration?: number;
    dismissable?: boolean;
}