/// <reference types="node" />
import { MessageTokenizer } from "./message-tokenizer";
import { Socket } from "net";
export declare class Messenger extends MessageTokenizer {
    private _messagePromises;
    private _socket;
    constructor(socket: Socket);
    connect(path: string): any;
    connect(port: number, host?: string): any;
    disconnect(): Promise<{}>;
    send(subject: any, data: any): Promise<{}>;
    request(subject: any, data: any): Promise<{}>;
    private _onData(data);
    private _onError(error);
    private _onClose();
    private _generateUniqueId();
}
