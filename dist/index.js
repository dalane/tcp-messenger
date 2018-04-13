"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const receiver_1 = require("./receiver");
exports.Listener = receiver_1.Receiver;
exports.Receiver = receiver_1.Receiver;
const messenger_1 = require("./messenger");
exports.Client = messenger_1.Messenger;
exports.Messenger = messenger_1.Messenger;
const net_1 = require("net");
function createListener(options) {
    console.log('Deprecation Warning: This method is being deprecated in favour of createReceiver');
    return new receiver_1.Receiver(options);
}
exports.createListener = createListener;
function createClient(options) {
    console.log('Deprecation Warning: This method is being deprecated in favour of createMessenger');
    return new messenger_1.Messenger(options);
}
exports.createClient = createClient;
function createReceiver() {
    let server = new net_1.Server();
    server.setMaxListeners(Infinity);
    return new receiver_1.Receiver(server);
}
exports.createReceiver = createReceiver;
function createMessenger() {
    let socket = new net_1.Socket();
    return new messenger_1.Messenger(socket);
}
exports.createMessenger = createMessenger;
