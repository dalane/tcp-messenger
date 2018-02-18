# A promise based and message-oriented network communication library for node
Send messages to a listener and receive responses using promises.
## Usage
The following example uses async/await available from node version 8.
```javascript
const {createListener, createClient} = require('@dalane/net-messenger')
(async function(){
  let listener = createListener();
  let client = createClient();
  const SUBJECTS = {
    MY_SUBJECT: 'my_subject'
  };
  listener.on(SUBJECTS.MY_SUBJECT, (message, data) => {
    message.reply('got your message');
  });
  let path = '/tmp/myservice.sock'
  await listener.listen(path); // or you could specify port and host
  await client.connect(path);
  let result = await client.request(SUBJECTS.MY_SUBJECT, 'hello');
  console.log(result);
  await client.disconnect();
  await listener.close();
})();
```
