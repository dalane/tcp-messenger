const { test } = require('ava');
const { Receiver, Messenger, createReceiver, createMessenger } = require('../dist');
const { join } = require('path');
const { tmpdir } = require('os');
const { randomBytes } = require('crypto');
const { createServer } = require('net');
const { EventEmitter } = require('events');

// TODO: Implement Tests...
/*
  receiver listen on port
  - port released on close
  - port released on crash
  receiver listen on socket
  - file created
  - file deleted on close
  - clean up file on crash
  messenger connect on port
  - port released on close
  - port released on crash
  messenger connect on socket
  - socket closed on close
  - socket closed on crash
  sending messages
  - sends messages


*/

class MockSocket extends EventEmitter {}

class MockServer extends EventEmitter {
  testReceiveMessage(message) {
    let socket = new MockSocket();
    this.emit('connection', socket);
    let data = Buffer.from("asssdf");
    socket.emit('data', data);
  }
}

(async function() {
  const MESSAGE_SUBJECTS = {
    SAY_HELLO: 'say_hello',
    SAY_GOODBYE: 'say_goodbye',
    RETURN_ERROR: 'return_error'
  };
  let receiver;
  let messenger;
  test.before(async () => {
    let pathToSock = join(tmpdir(), 'messenger-test-' + randomBytes(8).toString('hex'));
    receiver = createReceiver();
    receiver.on(MESSAGE_SUBJECTS.SAY_HELLO, (message, data) => {
      message.reply({
        you_said: data.speak
      });
    });
    receiver.on(MESSAGE_SUBJECTS.SAY_GOODBYE, (message, data) => {
      message.reply({
        you_said: data.speak
      });
    });
    receiver.on(MESSAGE_SUBJECTS.RETURN_ERROR, (message, data) => {
      message.reject('ENOGOOD', 'Your message was no good!');
    });
    messenger = createMessenger();
    // await listener.listen(1337);
    await receiver.listen(pathToSock);
    // await client.connect(1337);
    // when specifying a path, if it is a shared network folder on a VM you will
    // get an EPERM error...
    // http://samplacette.com/node-js-net-module-server-listen-socket-eperm-error/
    await messenger.connect(pathToSock);
  });
  test.after(async () => {
    await messenger.disconnect();
    await receiver.close();
  });
  test('successfully sends a message and receives a response', async t => {
    let result = await messenger.send(MESSAGE_SUBJECTS.SAY_HELLO, {
      speak: 'hello'
    });
    t.is(typeof result, 'object');
    t.is(result.you_said, 'hello');
  });
  test('sends a message and receives a promise rejection', async t => {
    let error = null;
    try {
      await messenger.send(MESSAGE_SUBJECTS.RETURN_ERROR, {
        speak: 'Will you send me an error?'
      });
    } catch (e) {
      error = e;
      t.is(error.message, 'Your message was no good!');
    }
    t.not(error, null);
  });
})();


