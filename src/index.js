const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");
const {
  generateMessage,
  generateLocationMessage,
} = require("./utils/messages");
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
  allRooms,
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirPath = path.join(__dirname, "../public");

app.use(express.static(publicDirPath));
// console.log(process.env.UNSPLASH_API_KEY);
io.on("connection", (socket) => {
  socket.emit("rooms", allRooms());
  socket.on("join", ({ username, room, roomType, invite }, callback) => {
    const { error, user } = addUser({
      id: socket.id,
      username,
      room,
      roomType,
    });
    socket.emit("api_key", process.env.UNSPLASH_API_KEY);
    if (error) {
      return callback(error);
    }
    if (user.roomType === "private" && invite !== "true") {
      const num = Math.floor(Math.random() * 100000000);
      const privateRoom = `${user.room} ~${num}`;
      user.room = privateRoom;
    }
    socket.join(user.room);
    socket.emit("message", generateMessage("Admin", "Welcome!"));
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        generateMessage("Admin", `${user.username} has joined!`)
      );

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room, user.roomType),
      roomType: user.roomType,
    });

    callback();
  });

  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);
    if (!user) {
      socket.emit("error");
    }
    if (user.roomType === "public") {
      const filter = new Filter();
      if (filter.isProfane(message)) {
        socket.emit("message", {
          text: message,
          username: "You",
          createdAt: new Date().getTime(),
          profanity: true,
        });
        socket.emit("message", {
          text: "Profanity is not allowed in public rooms",
          username: "Admin",
          createdAt: new Date().getTime(),
          profanity: true,
        });
        return callback("Profanity is not allowed in public rooms.");
      }
    }
    socket.emit("message", {
      text: message,
      username: "You",
      createdAt: new Date().getTime(),
    });
    socket.broadcast
      .to(user.room)
      .emit("message", generateMessage(user.username, message));
    callback();
  });
  socket.on("sendLocation", ({ lat, long }, callback) => {
    const user = getUser(socket.id);
    socket.emit("locationMessage", {
      url: `https://google.com/maps?q=${lat},${long}`,
      username: "You",
      createdAt: new Date().getTime(),
    });
    socket.broadcast
      .to(user.room)
      .emit(
        "locationMessage",
        generateLocationMessage(
          user.username,
          `https://google.com/maps?q=${lat},${long}`
        )
      );
    callback();
  });
  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessage("Admin", `${user.username} has left!!`)
      );
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room, user.roomType),
        roomType: user.roomType,
      });
    }
  });
});

server.listen(port, () => {
  console.log(`Server is up on port ${3000}`);
});
