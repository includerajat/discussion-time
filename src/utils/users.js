const users = [];

const addUser = ({ id, username, room, roomType }) => {
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  if (!username || !room) {
    return {
      error: "Username and room are required!",
    };
  }

  const existingUser = users.find(
    (user) => user.username === username && user.room === room
  );

  if (existingUser) {
    return {
      error: "Username is in use!",
    };
  }

  const user = { id, username, room, roomType };
  users.push(user);
  return { user };
};

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

const getUser = (id) => {
  return users.find((user) => user.id === id);
};

const getUsersInRoom = (room, roomType) => {
  // return users
  //   .map((user) =>
  //     user.room === room.trim().toLowerCase() ? user.username : undefined
  //   )
  //   .filter((name) => name !== undefined);
  room = room.trim().toLowerCase();
  return users.filter(
    (user) => user.room === room && user.roomType === roomType
  );
};

const allRooms = () => {
  const rooms = [];
  users.forEach((user) => {
    if (!rooms.includes(user.room) && user.roomType === "public") {
      rooms.push(user.room);
    }
  });
  return rooms;
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
  allRooms,
};
