const express = require('express');
const {
    userJoin,
    userLeave,
    getRoomUsers,
    getAllUsers,
    joinRoom,
    getCurrentUser
} = require('./users');
const app = express();
const http = require('http');
const cors = require("cors");
const { Server } = require("socket.io");



app.use(cors());



const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    }
});

io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);

    // ---- User_Login ----

    socket.on("login", ({ username }) => {

        //Adding user to user list
        const user = userJoin(socket.id, username);

        //Send all online users
        io.emit('online_users', {
            users: getAllUsers()
        });
    });

    // ---- User_Join_Chat
    socket.on("join_room", ({room })=>{
        const currentRoom = getCurrentUser(socket.id).room;
        if(currentRoom !== room){
            const user = joinRoom(socket.id, room);
            socket.join(user.room);

            const messageData = {
                room: user.room,
                author: "server",
                message: `${user.username} joined the chat`,
                time: ""
            };

            socket.to(user.room).emit("recieve_message", messageData)
    }
    });

    // ---- Send Room Message ----
    socket.on("send_message", (data) => {
        socket.to(data.room).emit("recieve_message", data)
        console.log(`message sent ${data.room}`)
    });

    // ---- Private Chat Request ----
    socket.on("private_chat", (id) => {
        const user = getCurrentUser(socket.id);
        console.log(user);
        io.to(id).emit("private_request", user);
        console.log(`Private Request Sent from ${user.username}`)
    });

    // ---- Private Chat Request Accepted ----
    socket.on("request_accepted", (id) => {
        const user = getCurrentUser(socket.id);
        const user2 = getCurrentUser(id);
        console.log(user);
        io.to(id).emit("accepted_conformation", user);
        console.log(`Private Request acceptance Sent from ${user.username}`)

        // ---- User connected messages ----
        const messageData = {
            to: id,
            author: "server",
            message: `${user.username} is connected`,
            time: ""
        };

        io.to(id).emit("recieve_message", messageData)

        const messageData2 = {
            to: user.id,
            author: "server",
            message: `${user2.username} is connected`,
            time: ""
        };

        io.to(user.id).emit("recieve_message", messageData2)
    });

    // ---- Send Private Message ----
    socket.on("send_private_message", (data) => {
        io.to(data.to).emit("recieve_message", data)
        console.log(`message sent to ${data.to}`)
    });

    // ---- User_Logout ----
    socket.on("disconnect", () => {
        console.log("User Disconnected", socket.id);
        const user = userLeave(socket.id);
        if (user) {
            //Send all online users
            io.emit('online_users', {
                users: getAllUsers()
            });
            
            if(user.room){
                const messageData = {
                    room: user.room,
                    author: "server",
                    message: `${user.username} left the chat`,
                    time: ""
                };

                socket.to(user.room).emit("recieve_message", messageData)
            }
        }
    });

    

});

server.listen(3001, () => {
    console.log("Server Start");
})