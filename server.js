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

app.get("/", (req, res2) => {
  res2.sendFile(__dirname + "/tela.html");
})

app.use(express.static('img'));
app.use(express.static('css'));
app.use(express.static('sounds'));

const users = {};
const limit = 2;
let userAtual = 0;
io.on("connection", (socket) => {
  if (userAtual == limit) {
    console.log("Limite de usuários atingido");
  } else {
    console.log(`[${socket.id}] Usuário Conectado`);
    users[socket.id] = { id: socket.io, y: 0 };
    userAtual = userAtual + 1;
    if (userAtual === 1) {
      io.emit("player1", socket.id);
    } else if(userAtual === 2) {
      io.emit("player2", socket.id);
    }
    
    socket.on('player1_y', (rightMove) => {
      io.emit('player1movimento', rightMove); 
    });
    socket.on('player2_y', (leftMove) => {
      io.emit('player2movimento', leftMove);
    });

    socket.on('ballPosition', (x, y) => {
      io.emit('ballPosition', x, y);
    })

    socket.on('reset', (reset) => {
      io.emit('reset', reset);
    })

    socket.on('loading', (green, none) => {
      io.emit('loading', green, none);
    })

    socket.on("disconnect", () => {
      console.log(`[${socket.id}] Usuário Desconectado`)
      users[socket.id] = undefined;
      userAtual = userAtual - 1;
      io.emit('loading', 'white', 'flex');
      io.emit("player1", socket.id);
    });
  }
});

server.listen(3000, () => {
  console.log("listening on *:3000");
});
