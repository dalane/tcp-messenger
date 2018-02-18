import { AbstractMessenger } from "./abstract-messenger";
import { createServer, Server } from "net";

export class Listener extends AbstractMessenger {
  private _subjectCallbacks: object;
  private _server: Server;
  constructor(options = null) {
    super();
    options = options || {};
    options = Object.assign({}, options, {
      maxListeners: Infinity
    });
    this._subjectCallbacks = {};
    this._server = createServer(this._onConnection.bind(this));
    this._server.setMaxListeners(options.maxListeners);
  }
  listen(path: string);
  listen(port: number);
  listen(port: number, host: string);
  listen(pathOrPort: string | number, host: string = null) {
    return new Promise((resolve, reject) => {
      this._server.on('listening', () => {
        resolve();
      });
      this._server.on('error', (error) => {
        reject(error);
      });
      if (typeof pathOrPort === 'string') {
        this._server.listen(pathOrPort);
      } else {
        host = (host === null) ? '127.0.0.1' : host;
        this._server.listen(pathOrPort, host);
      }
    });
  }
  close() {
    return new Promise(resolve => {
      this._server.close(() => {
        resolve();
      });
    });
  }
  on(subject: string, callback: Function) {
    if (subject in this._subjectCallbacks === false) {
      this._subjectCallbacks[subject] = [];
    }
    this._subjectCallbacks[subject].push(callback);
  }
  _onConnection(socket) {
    socket.on('data', (data) => {
      let ref = this._tokenizeData(data);
      for (let i = 0; i < ref.length; i++) {
        let messageText = ref[i];
        let message = this._parseMessageText(messageText);
        message.socket = socket;
        message = this._prepareMessage(message);
        this._dispatchMessage(message);
      }
    });
  }
  _prepareMessage(message) {
    let subject = message.subject;
    let i = 0;
    message.reply = (data) => {
      var payload;
      payload = {
        id: message.id,
        data: data
      };
      return message.socket.write(this._stringifyMessageObject(payload));
    };
    message.next = () => {
      var ref;
      return (ref = this._subjectCallbacks[subject]) !== null ? ref[i++](message, message.data) : void 0;
    };
    return message;
  }
  _dispatchMessage(message) {
    return message.next();
  }
}
