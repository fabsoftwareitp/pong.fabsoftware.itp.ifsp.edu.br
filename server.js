//Iniciando Server
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);

//Setup Socket.io
const { Server } = require("socket.io");
const io = new Server(server, {
  connectionStateRecovery: {}
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
})

app.all("/tela", (req, res) => {
  res.sendFile(__dirname + "/tela.html");
  app.locals.roomID = req.query.roomID;
})

app.use(express.static('img'));
app.use(express.static('css'));
app.use(express.static('sounds'));

app.use(express.urlencoded({
  extended: true
}))

app.post('/verify', (req, res) => {
  if(rooms.indexOf(req.body.roomID) == -1){
    res.redirect('/');
  }else{
    res.redirect('/tela?roomID='+req.body.roomID);;
  }
})

const rooms = [];
let roomUsers = 0;

io.on("connection", (socket) => {

  socket.on('userConnection', ()=> {
    const roomID = app.locals.roomID;
    console.log(`[${socket.id}] Usuário Conectado`);
    console.log(roomID);

    if(rooms.indexOf(roomID) == -1){
      socket.join(roomID);
      io.to(roomID).emit("player1", socket.id);
      rooms.push(roomID);
    }else{
      socket.join(roomID);
      io.to(roomID).emit("player2", socket.id);
    }
    
    socket.on('player1_y', (rightMove) => {
      io.to(roomID).emit('player1movimento', rightMove); 
    });

    socket.on('player2_y', (leftMove) => {
      io.to(roomID).emit('player2movimento', leftMove);
    });

    socket.on('reset', (reset) => {
      io.to(roomID).emit('reset', reset);
    })

    socket.on('loading', (green, none) => {
      io.to(roomID).emit('loading', green, none);
    })

    socket.on('start', () => {
      io.to(roomID).emit('start', '');
    })

    console.log(roomUsers);

    socket.on("disconnect", () => {
      console.log(`[${socket.id}] Usuário Desconectado`);
      console.log(roomUsers);
      
      player1 = false;
      io.to(roomID).emit('loading', 'white', 'flex');
      io.to(roomID).emit('left', '');
      if(roomUsers === 0){
        rooms.splice(rooms.indexOf(roomID), 1);
      }else{
        roomUsers -= 1;
      }
    });
  })
});

server.listen(3000, () => {
  console.log("listening on *:3000");
});
