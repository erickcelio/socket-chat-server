const net = require('net');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const client = net.createConnection({ port: 8081, host: '25.60.173.56' }, () => {
    console.log('connected to server!');
    client.on('error', (err) => {
      console.log('error', err)
    })
    client.write(JSON.stringify({
        type: 'changeName',
        name: 'SimpleSocket'
    }))
    // client.write(JSON.stringify({
    //     type: 'message',
    //     message: 'testando mensagem'
    // }))
    // rl.question('What is your name? ', (answer) => {
    //     client.write(`name:${answer}`);
    // });
});

rl.on('line', (message) => {
    client.write(JSON.stringify({
        type: 'message',
        message
    }));
});

client.on('data', (data) => {
    console.log(data.toString());
});

client.on('end', () => {
    console.log('disconnected from server');
});