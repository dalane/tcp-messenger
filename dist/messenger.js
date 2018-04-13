"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const message_tokenizer_1 = require("./message-tokenizer");
const crypto_1 = require("crypto");
class Messenger extends message_tokenizer_1.MessageTokenizer {
    constructor(socket) {
        super();
        this._socket = socket;
        this._socket.on('data', this._onData.bind(this));
        this._socket.on('error', this._onError.bind(this));
        this._socket.on('close', this._onClose.bind(this));
        this._messagePromises = new Map();
    }
    connect(pathOrPort, host) {
        return new Promise((resolve, reject) => {
            this._socket.on('connect', () => {
                resolve();
            });
            this._socket.on('error', error => {
                reject(error);
            });
            if (typeof pathOrPort === 'string') {
                this._socket.connect(pathOrPort);
            }
            else {
                host = (host) ? '127.0.0.1' : host;
                this._socket.connect(pathOrPort, host);
            }
        });
    }
    disconnect() {
        return new Promise(resolve => {
            this._socket.on('close', () => {
                resolve();
            });
            this._socket.destroy();
        });
    }
    send(subject, data) {
        return new Promise((resolve, reject) => {
            let message = {
                id: this._generateUniqueId(),
                subject: subject,
                data: data
            };
            this._socket.write(this._stringifyMessageObject(message));
            this._messagePromises.set(message.id, {
                resolve: resolve,
                reject: reject
            });
        });
    }
    request(subject, data) {
        console.log('Deprecation Warning: This method is being deprecated in favour of send(subject, data).');
        return this.send(subject, data);
    }
    _onData(data) {
        let ref = this._tokenizeData(data);
        for (let i = 0; i < ref.length; i++) {
            let messageText = ref[i];
            let message = this._parseMessageText(messageText);
            if (!this._messagePromises.has(message.id)) {
                continue;
            }
            let promise = this._messagePromises.get(message.id);
            this._messagePromises.delete(message.id);
            if (message.status === 'ok') {
                promise.resolve(message.data);
            }
            else {
                let error = new Error(message.error.message);
                error.name = message.error.name;
                promise.reject(error);
            }
        }
    }
    _onError(error) {
        console.error(error);
    }
    _onClose() {
        this._socket.destroy();
    }
    _generateUniqueId() {
        return crypto_1.randomBytes(16).toString('hex');
    }
}
exports.Messenger = Messenger;
