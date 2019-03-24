const net = require('net');

let clients = [];
let messages = [];

const server = net.createServer((client) => {
  console.log('client connected');
  const thisClient = {
    id: Math.random(),
    name: '',
    client
  };
  clients.push(thisClient);

  server.getConnections((err, count) => {
    console.log('Clients Connected --->', count)
  });

  sendAttributes(thisClient);

  client.on('error', (err) => {
    clientExit()
  });

  client.on('end', () => {
    clientExit()
  });

  client.on('data', (data) => {
    const { type, id = thisClient.id, name = thisClient.name, message } = JSON.parse(data);
    console.log('Action ->', type)
    console.log('Id ->', id)
    switch (type) {
      case 'message':
        sendMessage(message, id);
        break;
      case 'changeName':
        changeName(id, name);
        break;
      case 'getMyAttributes':
        sendAttributes(thisClient);
        break;
    }
  });

  function sendMessage(message, senderId) {
    messages.push({ message, senderId })
    clients.forEach(({ client }) => {
      client.write(JSON.stringify({
        type: 'message',
        senderId,
        message
      }));
    });
  }

  function changeName (id, newName) {
    clients.forEach((client) => {
      if (client.id === id) {
        client.name = newName
      }
    })

    const updatedClients = getUpdatedClients()
    clients.forEach(({ client }) => {
      client.write(JSON.stringify({
        type: 'updateClients',
        clients: updatedClients
      }));
    })
  }

  function sendAttributes({ id }) {
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
      if (client.id !== thisClient.id) {
        return true
      } else {
        messages = messages.filter((message) => {
          return message.senderId !== thisClient.id
        })
        return false
      }
    })
    clients.map((client) => {
      sendAttributes(client)
    })
  }
});

server.listen({
  host: '25.60.173.56',
  port: 8081
});
