import React, { useEffect, useState } from "react";
import ScrollToBottom from "react-scroll-to-bottom";
import Users from "./Users";

import Modal from 'react-modal';

Modal.setAppElement(document.getElementById('root'));

function Chat({socket, username}) {
    const [currentMessage, setCurrentMessage] = useState("");
    const [room, setRoom] = useState("");
    const [messageList, setMessageList] = useState([]);
    const [userList, setUserList] = useState([]);
    const [isPrivateChat, setIsPrivateChat] = useState(false);
    const [isRequestCanceled, setIsRequestCanceled] = useState(false);
    const [privateChatUser, setPrivateChatUser] = useState("");
    const [privateChatUserId, setPrivateChatUserId] = useState("");
    const [modalIsOpen, setIsOpen] = useState(false);
    const [modalUser, setModalUser] = useState({});


  
    const closeModal = () => {
      setIsOpen(false);
    }

    const privateChatServerMessage = async () => {

    }

    const customStyles = {
        content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            border: '1px solid #263238',
            boxShadow: '0 0 4px rgba(0,0,0,.14),0 4px 8px rgba(0,0,0,.28)',
            background: 'lightgray'
          },
      };



    const sendMessage = async () => {
        if(currentMessage !== "") 
            if(!isPrivateChat){
                const messageData = {
                    room: room,
                    author: username,
                    message: currentMessage,
                    time: new Date(Date.now()).getHours() +
                    ":" + new Date(Date.now()).getMinutes()
                };
                await socket.emit("send_message", messageData);
                setMessageList((list)=> [...list, messageData]);
                setCurrentMessage("");
            }
            else {
                const messageData = {
                    to: privateChatUserId,
                    author: username,
                    message: currentMessage,
                    time: new Date(Date.now()).getHours() +
                    ":" + new Date(Date.now()).getMinutes()
                };
                await socket.emit("send_private_message", messageData);
                setMessageList((list)=> [...list, messageData]);
                setCurrentMessage("");
                }
            
    }

    const acceptRequest = async () => {
        const id = modalUser.id;
        setIsPrivateChat(true);
        setPrivateChatUserId(id);
        setMessageList([]);
        setRoom(`with ${modalUser.username}`);
        await socket.emit("request_accepted", id);
        setModalUser({});
        setIsOpen(false);
    }

    useEffect(()=>{
        socket.on("recieve_message", (data)=>{
            console.log(data)
            setMessageList((list)=> [...list, data]);
        })
        socket.on('online_users', ({ users }) => {
            setUserList(users);
          });

        socket.on('private_request', (user) => {
            setModalUser(user);
            console.log("request received")
            console.log(user);
            setIsOpen(true);
          });

        socket.on('accepted_conformation', (user) => {
            if(!isRequestCanceled){
            let id = user.id;
            setIsPrivateChat(true);
            setPrivateChatUserId(id);
            setRoom(`with ${user.username}`);
            }
            setIsRequestCanceled(false);
          });
    }, [socket]);

    useEffect(() => {
        setMessageList([]);
      }, [room]);

    return(
        <div className="parent-container">
        <div className="chat-window">
            <div className="chat-header">
                <p>Live Chat: <span >{room}</span></p>
            </div>
            
            <div className="chat-body">
                <div className={!room ? "emptyChat" : "hideEmptyChat"}> Choose Room or User : </div>
                <ScrollToBottom className="message-container">
                {messageList.map((message)=>{
                    return <div className="message" id={username === message.author ? "you" : message.author === "server" ? "server" : "other"}>
                        <div>
                            <div className="message-content">
                                <p>{message.message}</p>
                            </div>
                            <div className="message-meta">
                                            <p id="author">{message.author}</p>
                                            <p> &bull; </p>
                                            <p id="time">{message.time}</p>
                            </div>
                        </div>
                    </div>
                })}
                </ScrollToBottom>
            </div>
            <div className="chat-footer">
                <input type="text" placeholder="Message" value={currentMessage}
                    onChange={(event) => {setCurrentMessage(event.target.value)}}
                    onKeyPress={(event) => {if (event.key==="Enter") sendMessage()}}
                />
                <button onClick={sendMessage}>&#9658;</button>
            </div>
        </div>

        <Users userList={userList} setRoom={setRoom} cancelRequest={setIsRequestCanceled} username={username} socket={socket}/>
        <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                contentLabel="Example Modal"
                style={customStyles}
            >
                <h2>Private Chat Request from {modalUser.username} </h2>
                <div className="modal-button-container">
                    <button className="modal-button" onClick={closeModal}>ignore</button>
                    <button className="modal-button accept " onClick={acceptRequest}>Accept</button>
                </div>
            </Modal>
        </div>

    )
}

export default Chat;