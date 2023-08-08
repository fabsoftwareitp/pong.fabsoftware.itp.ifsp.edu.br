//Iniciando Server
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);

//Setup Socket.io
const { Server } = require("socket.io");
const io = new Server(server);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/controle.html");
});

app.get("/tela", (req, res2) => {
  res2.sendFile(__dirname + "/tela.html");
})

app.use(express.static('img'));
app.use(express.static('css'));

const users = {};
const limit = 3;
let userAtual = 0;
io.on("connection", (socket) => {
  if (userAtual == limit) {
    console.log("Limite de usuários atingido");
  } else {
    console.log(`[${socket.id}] Usuário Conectado`);
    users[socket.id] = { id: socket.io, y: 0 };
    userAtual = userAtual + 1;
    if (userAtual === 1){
      socket.join("tela");
    }
    else if (userAtual === 2) {
      socket.join("player1");
      io.to("player1").emit("id", userAtual);
    } else if(userAtual === 3) {
      socket.join("player2");
      io.to("player2").emit("id", userAtual);
    }
    socket.on('player1_y', (rightMove) => {
      io.emit('player1movimento', rightMove);
    })
    socket.on('player2_y', (leftMove) => {
      io.emit('player2movimento', leftMove);
    })

    socket.on("disconnect", () => {
      console.log(`[${socket.id}] Usuário Desconectado`);
      users[socket.id] = undefined;
      userAtual = userAtual - 1;
    });
  }
});

server.listen(3000, () => {
  console.log("listening on *:3000");
});
