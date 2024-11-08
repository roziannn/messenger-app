const express = require("express");
const cors = require("cors");
const socketio = require("socket.io");
const http = require("http");

const { addUser, removeUser, getUser, getUsersInRoom } = require("./users.js");

const PORT = process.env.PORT || 5000;

const router = require("./router");

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = socketio(server);

io.on("connection", (socket) => {
  socket.on("join", ({ name, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, name, room });

    if (error) {
      return callback(error);
    }

    socket.join(user.room);

    socket.emit("message", { user: "admin", text: `${user.name}, welcome to the room ${user.room}` });
    socket.broadcast.to(user.room).emit("message", { user: "admin", text: `${user.name}, has joined!` });

    io.to(user.room).emit("roomData", { room: user.room, users: getUsersInRoom(user.room) });

    callback();
  });

  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);
    if (user) {
      io.to(user.room).emit("message", { user: user.name, text: message });
      io.to(user.room).emit("roomData", { room: user.room, text: message, users: getUsersInRoom(user.room) });
    } else {
      console.error("User not found for socket ID:", socket.id); // Log an error if user is undefined
    }
    callback();
  });

  socket.on("disconnect", () => {
    // console.log("User had left!!!");
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit("message", { user: "admin", text: `${user.name} has left the room.` });
    }
  });
}); //client side socket

app.use(router);

server.listen(PORT, () => console.log(`Server has started on port ${PORT}`));
