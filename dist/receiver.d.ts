/// <reference types="node" />
import { Server } from "net";
import { MessageTokenizer } from "./message-tokenizer";
export declare class Receiver extends MessageTokenizer {
    private _subjectCallbacks;
    private _server;
    private _socketPath;
    constructor(server: Server);
    listen(path: string): any;
    listen(port: number, host?: string): any;
    close(): Promise<{}>;
    on(subject: string, callback: (message, data) => void): void;
    private _onConnection(socket);
    private _prepareOutgoingMessage(message);
    private _rejectMessage(message, error);
    private _rejectMessage(message, name, detail);
    private _dispatchMessage(message);
}
