import { Listener, Client, createListener, createClient } from '../src';
import { join } from 'path';

(async function(){
  try {
    let listener = new Listener();
    listener.on('say_hello', (message, data) => {
      message.reply({
        you_said: data.speak
      });
    });
    listener.on('say_goodbye', (message, data) => {
      message.reply({
        you_said: data.speak
      });
    });
    // await listener.listen(1337);
    await listener.listen('/tmp/myserver.sock');
    let client = new Client();
    // await client.connect(1337);
    // when specifying a path, if it is a shared network folder on a VM you will
    // get an EPERM error...
    // http://samplacette.com/node-js-net-module-server-listen-socket-eperm-error/
    await client.connect('/tmp/myserver.sock');
    let result = client.request('say_hello', {
      speak: 'hello'
    });
    console.log(await client.request('say_hello', {
      speak: 'g\'day'
    }));
    let result2 = client.request('say_goodbye', {
      speak: 'goodbye'
    });
    console.log(await result);
    console.log(await result2);
    await client.disconnect();
    await listener.close();
  } catch (error) {
    console.error(error);
  }
})();
