# A promise based and message-oriented network communication library for node
Send messages to a listener and receive responses using promises.
## Usage
There are two components to the messenger service: a messenger; and a receiver.

The messenger connects to the receiver and sends messages to the receiver to 
action. The receiver listens for messages from the messenger and when it receives
a message it actions it and sends back a response.

Messages can be sent either via UNIX sockets or TCP. This is determined based on
whether you provide a file path for a socket file or a TCP port number.

### Setting up a receiver
In order to set up the receiver you can create it directly or use the factory 
function provided.

```javascript
  const {Receiver, createReceiver} = require('@dalane/net-messenger');
  let options = {...};
  let receiver = createReceiver(options);
  ...
  let receiver = new Receiver(options);
```

The options object is optional but it allows you to specify the maximum number of 
messengers that can connect to the receiver.

```javascript
let options = {
  maxMessengers: 10 // default is infinite if not provided
};
```


The following example uses async/await available from node version 8.
```javascript
const {createReceiver, createMessenger} = require('@dalane/net-messenger')
(async function(){
  let receiver = createReceiver();
  let messenger = createMessenger();
  const SUBJECTS = {
    MY_SUBJECT: 'my_subject'
  };
  receiver.on(SUBJECTS.MY_SUBJECT, (message, data) => {
    message.reply('got your message');
  });
  let path = '/tmp/myservice.sock'
  await receiver.listen(path); // or you could specify port and host
  await messenger.connect(path);
  let result = await messenger.send(SUBJECTS.MY_SUBJECT, 'hello');
  console.log(result);
  await messenger.disconnect();
  await receiver.close();
})();
```

### Rejecting Messages
The receiver can reject a message (which will return an error to the messenger).
```javascript
receiver.on('subject', (message, data) => {
  let result = processSomeData(data);
  if (result.err) {
    message.reject('MyErrorCode', 'There was an error');
  } else {
    message.reply(result.data);
  }
});
```
Alternatively, you can reject using javascript's built in Error object.
```javascript
receiver.on('subject', (message, data) => {
  let result = processSomeData(data);
  if (result.err) {
    let error = new Error('There was an error');
    error.name = 'MyErrorCode'
    message.reject(error);
  } else {
    message.reply(result.data);
  }
});
```
