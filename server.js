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
let player1ID = null;
let player1 = false;
io.on("connection", (socket) => {

  const roomID = app.locals.roomID;

  socket.on('userConnection', ()=> {
    console.log(`[${socket.id}] Usuário Conectado`);
    console.log(roomID);
    if(!player1){
      socket.join(roomID);
      io.to(roomID).emit("player1", socket.id);
      player1 = true;
    }else{
      socket.join(roomID);
      io.to(roomID).emit("player2", socket.id, player1ID);
      player1 = false;
    }

    socket.on('number', (a) => {
      io.to(roomID).emit('number', a);
    })
    
    socket.on('player1_y', (rightMove) => {
      io.to(roomID).emit('player1movimento', rightMove); 
    });

    socket.on('player2_y', (leftMove) => {
      io.to(roomID).emit('player2movimento', leftMove);
    });

    socket.on('ballPosition', (x, y) => {
      io.to(roomID).emit('ballPosition', x, y);
    })

    socket.on('reset', (reset) => {
      io.to(roomID).emit('reset', reset);
    })

    socket.on('loading', (green, none) => {
      io.to(roomID).emit('loading', green, none);
    })

    socket.on('start', () => {
      io.to(roomID).emit('start', '');
    })

    socket.on("disconnect", () => {
      console.log(`[${socket.id}] Usuário Desconectado`)
      player1 = false;
      io.to(roomID).emit('loading', 'white', 'flex');
      io.to(roomID).emit('left', '');
    });
  })
});

server.listen(3000, () => {
  console.log("listening on *:3000");
});
