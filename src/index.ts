import { Listener } from "./listener";
import { Client } from "./client";

export function createListener(options = null) {
  return new Listener(options);
}
export function createClient(options = null) {
  return new Client(options);
}

export {
  Listener as Listener,
  Client as Client
};
