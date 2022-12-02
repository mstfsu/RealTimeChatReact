const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
var io = require('socket.io')(server);
var users = [];

app.get('/', (req, res) => {
  io.sockets.emit("send_data",{message:"hello"});//handle request and emit data to all connections
    res.send('Hello World!');
});


io.on('connection', function (socket) {    
    socket.on('user',(user)=>{
      user.socket_id = socket.id;
      users.push(user);
    });

    socket.on('send_message',(message, uid)=>{
        socket.broadcast.emit('send_message',message, uid);//to all
    });

    socket.on('writing',(data)=>{
      socket.broadcast.emit('writing',data);//to all
  });

    socket.on('disconnecting',(reason) => {
      let index=users.findIndex(x => x.socket_id === socket.id);
      if(index>-1){
          users.splice(index,1);
      }
  });
});
server.listen(3001, () => {
  console.log('listen');
});