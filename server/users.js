const users = [];

// Join user to chat
function userJoin(id, username) {
  let room = ''
  const user = { id, username, room};

  users.push(user);

  return user;
}

function getAllUsers(){
  return users;
}

function joinRoom(id, room){
  index = users.findIndex((user => user.id == id));
  users[index].room = room;
  return users[index];
}
// Get current user
function getCurrentUser(id) {
  return users.find(user => user.id === id);
}

// User leaves chat
function userLeave(id) {
  const index = users.findIndex(user => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
}

// Get room users
function getRoomUsers(room) {
  return users.filter(user => user.room === room);
}

module.exports = {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
  getAllUsers,
  joinRoom
};