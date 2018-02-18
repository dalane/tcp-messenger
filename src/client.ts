import { AbstractMessenger } from "./abstract-messenger";
import { randomBytes } from "crypto";
import { Socket } from "net";

class SocketAdapter {
  private _socket;
  constructor(options: object = null) {
    this._socket = new Socket(options);
  }
  connect(pathOrPort: string | number, host: string = null) {
    return new Promise((resolve, reject) => {
      this._socket.on('connect', () => {
        resolve();
      });
      this._socket.on('error', error => {
        reject(error);
      });
      this._socket.connect(pathOrPort, host);
    });
  }
}

export class Client extends AbstractMessenger {
  private _resolvers: Map<string, Function>;
  private _socket: Socket;
  constructor(options = null) {
    super();
    options = options || {};
    options = Object.assign({}, options, {
      encoding: 'utf8',
      noDelay: true,
      maxListeners: Infinity
    });
    this._resolvers = new Map();
    let socket = new Socket();
    socket.setEncoding(options.encoding);
    socket.setNoDelay(options.noDelay);
    socket.setMaxListeners(options.maxListeners);
    socket.on('data', this._onData.bind(this));
    socket.on('error', this._onError.bind(this));
    socket.on('close', this._onClose.bind(this));
    this._socket = socket;
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
  request(subject, data) {
    return new Promise(resolve => {
      let message = {
        id: this._generateUniqueId(),
        subject: subject,
        data: data
      };
      this._socket.write(this._stringifyMessageObject(message));
      this._resolvers.set(message.id, resolve);
    });
  }
  _onData(data) {
    let ref = this._tokenizeData(data);
    for (let i = 0; i < ref.length; i++) {
      let messageText = ref[i];
      let message = this._parseMessageText(messageText);
      if (!this._resolvers.has(message.id)) {
        continue;
      }
      let resolve = this._resolvers.get(message.id);
      this._resolvers.delete(message.id);
      resolve(message.data);
    }
  }
  _onError(error) {
    console.error(error);
  }
  _onClose() {
    this._socket.destroy();
  }
  _generateUniqueId() {
    return randomBytes(16).toString('hex');
  }
}
