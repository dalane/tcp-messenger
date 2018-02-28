import { MessageTokenizer } from "./message-tokenizer";
import { randomBytes } from "crypto";
import { Socket } from "net";

interface MessagePromises {
  resolve,
  reject
}

export class Messenger extends MessageTokenizer {
  private _messagePromises: Map<string, MessagePromises>;
  private _socket: Socket;
  constructor(socket: Socket) {
    super();
    this._socket = socket;
    this._socket.on('data', this._onData.bind(this));
    this._socket.on('error', this._onError.bind(this));
    this._socket.on('close', this._onClose.bind(this));
    this._messagePromises = new Map();
  }
  connect(path: string);
  connect(port: number);
  connect(port: number, host: string);
  connect(pathOrPort: string | number, host: string = null) {
    return new Promise((resolve, reject) => {
      this._socket.on('connect', () => {
        resolve();
      });
      this._socket.on('error', error => {
        reject(error);
      });
      if (typeof pathOrPort === 'string') {
        this._socket.connect(pathOrPort);
      } else {
        host = (host === null) ? '127.0.0.1' : host;
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
      this._socket.on('error', error => {
        reject(error);
      });
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
  private _onData(data) {
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
      } else {
        let error = new Error(message.error.message);
        error.name = message.error.name;
        promise.reject(error);
      }
    }
  }
  private _onError(error) {
    console.error(error);
  }
  private _onClose() {
    this._socket.destroy();
  }
  private _generateUniqueId() {
    return randomBytes(16).toString('hex');
  }
}
