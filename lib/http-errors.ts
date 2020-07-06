export class HttpError extends Error {
    constructor(public statusCode: any, public message: any = '') {
        super(message);
    }
}