import { MessageTokenizer } from "./message-tokenizer";
import { createServer, Server } from "net";
import { unlink, exists, unlinkSync, existsSync } from "fs";

export class Receiver extends MessageTokenizer {
  private _subjectCallbacks: object;
  private _server: Server;
  private _socketPath: string;
  constructor(server: Server) {
    super();
    this._server = server;
    this._server.on('connection', this._onConnection.bind(this));
    // holds the message subject callback handlers...
    this._subjectCallbacks = {};
  }
  listen(path: string)
  listen(port: number, host?: string)
  listen(pathOrPort: string | number, host?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this._server.on('listening', () => {
        resolve();
      });
      this._server.on('error', (error) => {
        reject(error);
      });
      if (typeof pathOrPort === 'string') {
        this._socketPath = pathOrPort;
        this._server.listen(pathOrPort);
      } else {
        host = (host) ? '127.0.0.1' : host;
        this._server.listen(pathOrPort, host);
      }
    });
  }
  close() {
    return new Promise((resolve, reject) => {
      this._server.on('error', error => {
        let exists = existsSync(this._socketPath);
        if (exists) {
          unlinkSync(this._socketPath);
        }
        reject(error);
      });
      this._server.close(() => {
        resolve();
      });
    });
  }
  on(subject: string, callback: (message, data) => void) {
    this._subjectCallbacks[subject] = callback;
  }
  private _onConnection(socket) {
    socket.on('data', data => {
      let ref = this._tokenizeData(data);
      for (let i = 0; i < ref.length; i++) {
        let messageText = ref[i];
        let message = this._parseMessageText(messageText);
        message.socket = socket;
        message = this._prepareOutgoingMessage(message);
        this._dispatchMessage(message);
      }
    });
  }
  private _prepareOutgoingMessage(message) {
    let self = this;
    let subject = message.subject;
    let i = 0;
    message.reply = (data) => {
      var payload;
      payload = {
        id: message.id,
        status: 'ok',
        data: data
      };
      return message.socket.write(this._stringifyMessageObject(payload));
    };
    function reject(error);
    function reject(name, message);
    function reject(errorOrName, errorMessage = null) {
      var payload;
      payload = {
        id: message.id,
        status: 'reject',
        error: {
          name: (errorOrName instanceof Error) ? errorOrName.name : errorOrName,
          message: (errorOrName instanceof Error) ? errorOrName.message : errorMessage
        }
      };
      return message.socket.write(this._stringifyMessageObject(payload));
    }
    message.reject = reject.bind(this);
    message.next = () => {
      let cb = this._subjectCallbacks[subject];
      return cb !== null ? cb(message, message.data) : void 0;
    };
    return message;
  }
  private _dispatchMessage(message) {
    return message.next();
  }
}
