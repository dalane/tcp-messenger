import { Receiver } from "./receiver";
import { Messenger } from "./messenger";
declare function createListener(options?: any): Receiver;
declare function createClient(options?: any): Messenger;
declare function createReceiver(): Receiver;
declare function createMessenger(): Messenger;
export { Receiver as Listener, Messenger as Client, Receiver, Messenger, createListener, createClient, createReceiver, createMessenger };
