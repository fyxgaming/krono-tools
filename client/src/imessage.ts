export interface IMessage {
    name: string;
    messageId?: any;
    payload?: any;
    success?: boolean;
    ts?: number;
    context?: string;
    target?: string;
}