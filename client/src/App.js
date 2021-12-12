import io from 'socket.io-client';
import React, { useEffect, useState } from "react";
import Chat from './Chat';
import "./App.css";

const socket = io.connect("http://localhost:3001")

function App() {

  const [username, setUsername] = useState("");
  //const [room, setRoom] = useState("");
  const [showChat, setShowChat] = useState(false);


  /* const joinRoom = () => {
    if (username !=="" && room !==""){
      let joinInfo = {room: room, username: username};
      socket.emit("join_room", joinInfo);
      setShowChat(true);
      <input type="text" placeholder="Room Name" onChange={(event) => { setRoom(event.target.value) }} />
    } */

    const login = () =>{
      if (username !==""){
        let loginInfo = {username: username};
        socket.emit("login", loginInfo);
        setShowChat(true);
      }
    }

  return (
    <div className="App">
      {!showChat ? (  <div className="joinChatContainer">
      <h3>Join the Chat</h3>
      <input type="text" placeholder="User Name" onChange={(event) => { setUsername(event.target.value) }} />
      <button onClick={login}>Login</button>
      </div>) 
      :
      (<Chat socket={socket} username={username}></Chat>
    )}
    <h3>{username}</h3>
    
      </div>
  );

}


export default App;
