import { Receiver } from "./receiver";
import { Messenger } from "./messenger";
import { Server, Socket } from "net";

function createListener(options?) {
  console.log('Deprecation Warning: This method is being deprecated in favour of createReceiver');
  return new Receiver(options);
}

function createClient(options?) {
  console.log('Deprecation Warning: This method is being deprecated in favour of createMessenger');
  return new Messenger(options);
}

function createReceiver() {
  let server = new Server();
  server.setMaxListeners(Infinity);
  return new Receiver(server);
}
function createMessenger() {
  let socket = new Socket();
  return new Messenger(socket);
}

export {
  Receiver as Listener,
  Messenger as Client,
  Receiver,
  Messenger,
  createListener,
  createClient,
  createReceiver,
  createMessenger
};
