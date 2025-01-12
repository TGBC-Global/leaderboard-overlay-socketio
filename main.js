const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');
const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config({
  path: join(__dirname, '.env')
});

const app = express();
const server = createServer(app);
const io = new Server(server);
const port = process.env.HTTP_PORT || 3000;

app.get('/controlpanel', (req, res) => {
  res.sendFile(join(__dirname, 'src', 'controlpanel.html'));
});

app.get('/overlay', (req, res) => {
  res.sendFile(join(__dirname, 'src', 'overlay.html'));
});

app.get('/img/default', (req, res) => {
  res.sendFile(join(__dirname, 'favicon_x128.png'));
});

io.on('connection', (socket) => {
  console.log('a user connected');
  fs.readFile(join(__dirname, 'data', 'store.json'), (err, data) => {
    if (err) throw err;
    socket.emit('update', JSON.parse(data));
  });
  socket.on('update', (data) => {
    console.log('data update emited', data);
    fs.writeFile(join(__dirname, 'data','store.json'), JSON.stringify(data), (err) => {
      if (err) throw err;
      console.log('Data written to file');
    });
    io.emit('update', data);
  });
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

server.listen(port, () => {
  console.log(`server running at http://localhost:${port}`);
});