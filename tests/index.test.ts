import { test } from 'ava';
import { Receiver, Messenger, createReceiver, createMessenger } from '../src';
import { join } from 'path';
import { tmpdir } from 'os';
import { randomBytes } from 'crypto';
import { createServer } from 'net';
import { EventEmitter } from 'events';

enum MESSAGE_SUBJECTS {
  SAY_HELLO = 'say_hello',
  SAY_GOODBYE = 'say_goodbye',
  RETURN_ERROR = 'return_error'
};

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

test('First Test', async t => {
  let pathToSock = join(tmpdir(), 'messenger-test-' + randomBytes(8).toString('hex'));
  let receiver = createReceiver();
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
  let messenger = createMessenger();
  // await listener.listen(1337);
  await receiver.listen(pathToSock);
  // await client.connect(1337);
  // when specifying a path, if it is a shared network folder on a VM you will
  // get an EPERM error...
  // http://samplacette.com/node-js-net-module-server-listen-socket-eperm-error/
    await messenger.connect(pathToSock);
    let result = messenger.send(MESSAGE_SUBJECTS.SAY_HELLO, {
    speak: 'hello'
  });
  console.log(await messenger.send(MESSAGE_SUBJECTS.SAY_HELLO, {
    speak: 'good day'
  }));
  let result2 = messenger.send(MESSAGE_SUBJECTS.SAY_GOODBYE, {
    speak: 'goodbye'
  });
  try {
    await messenger.send(MESSAGE_SUBJECTS.RETURN_ERROR, {
      speak: 'Will you send me an error?'
    });
  } catch (error) {
    console.error('Excellent, we caught the error: ' + error.message);
  }
  console.log(await result);
  console.log(await result2);
  await messenger.disconnect();
  await receiver.close();
  t.pass();
});
