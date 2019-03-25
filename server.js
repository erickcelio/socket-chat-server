'use strict';
const net = require('net');

let clients = [];
let messages = [];

const server = net.createServer((client) => {
  console.log('New client connected');
  const thisClient = {
    id: Math.random() * (10000000) + 1,
    name: '',
    client
  };
  clients.push(thisClient);

  server.getConnections((err, count) => {
    console.log('Clients Connected --->', count)
  });

  sendAttributes(thisClient);

  client.on('error', (err) => {
    console.log('Client Error ->', err);
  });

  client.on('end', () => {
    clientExit()
  });

  client.on('data', (data) => {
    const { type, id = thisClient.id, name = thisClient.name, message } = JSON.parse(data);
    console.log('Action ->', type);
    switch (type) {
      case 'message':
        sendMessage(message, id);
        break;
      case 'changeName':
        changeName(id, name);
        break;
    }
  });

  function sendMessage(message, senderId) {
    const date = formattedDate();
    messages.push({ message, senderId, date })
    clients.forEach(({ client }) => {
      client.write(JSON.stringify({
        type: 'message',
        senderId,
        message,
        date
      }));
    });
  }

  function formattedDate(){
    const date = new Date();
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth()+1).toString().padStart(2, '0');
    const hora = `${date.getHours()}:${date.getMinutes()}`;

    return `${day}/${month} ás ${hora}`
  }

  function changeName (id, newName) {
    clients.forEach((client) => {
      if (client.id === id) {
        client.name = newName
      }
    });

    const updatedClients = getUpdatedClients()
    clients.forEach(({ client }) => {
      client.write(JSON.stringify({
        type: 'updateClients',
        clients: updatedClients
      }));
    })
  }

  function sendAttributes({ id, client }) {
    client.write(JSON.stringify({
      type: 'attributes',
      id,
      messages,
      clients
    }))
  }

  function getUpdatedClients () {
    return clients.map(({ id, name }) => {
      return { id, name }
    })
  }

  function clientExit () {
    clients = clients.filter((client) => {
      return client.id !== thisClient.id;
    });
    messages = messages.filter((message) => {
      return message.senderId !== thisClient.id
    });
    clients.map((client) => {
      sendAttributes(client)
    })
  }
});

server.listen({
  host: '25.60.173.56',
  port: 9001
});
