export interface IDialog {
    body: string;
    title?: string;
    theme?: undefined|'success'|'error';
    duration?: number;
}