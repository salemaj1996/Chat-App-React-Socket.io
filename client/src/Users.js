import React, { useEffect, useState } from "react";
import ScrollToBottom from "react-scroll-to-bottom";
import Modal from 'react-modal';

Modal.setAppElement(document.getElementById('root'));

function Users({ userList, setRoom, cancelRequest, socket, username}) {

    const [roomValue, setRoomValue] = useState("");
    const [modalIsOpen, setIsOpen] = React.useState(false);
    const [modalUser, setModelUser] = React.useState({});

    const customStyles = {
        content: {
          minWidth : '200px',
          top: '50%',
          left: '50%',
          right: 'auto',
          bottom: 'auto',
          marginRight: '-50%',
          transform: 'translate(-50%, -50%)',
          border: '1px solid #263238',
          boxShadow: '0 0 4px rgba(0,0,0,.14),0 4px 8px rgba(0,0,0,.28)',
          color: '#2f323b',
          background: 'lightgray'
        },
      };

    const openModal = async (user) => {
        setModelUser(user)
        setIsOpen(true);
        await socket.emit("private_chat", user.id);
    }
  
    const closeModal = () => {
        cancelRequest(true);
        setIsOpen(false);
    }

    useEffect(()=>{
        socket.on('accepted_conformation', (user) => {
            console.log("acceptance recieved")
            setIsOpen(false);
          });
    }, [socket]); 

    const joinRoom = () => {
        if (roomValue !== "") {
            setRoom(roomValue);
            let joinInfo = { room: roomValue };
            socket.emit("join_room", joinInfo);
        }

    }
    return (
        <div className="Users-Body">
            <div className="user-header">
                <p>Online Users <i class="fas fa-users"></i> </p>
            </div>
            <ScrollToBottom className="user-container">
                {userList.filter((user)=>{if(user.username===username) {return false} else {return true}}).map((user) => {
                    return <div className="message">
                        <p onClick={(event)=>{openModal(user)}}>{user.username} <span class="logged-in">●</span> </p>
                    </div>
                })}
            </ScrollToBottom>
            <input type="text" placeholder="Room Name" onChange={(event) => { setRoomValue(event.target.value) }} />
            <button onClick={joinRoom}>Join Room</button>
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                contentLabel="Example Modal"
                style={customStyles}
            >
                <h2>Waiting for {modalUser.username} ...</h2>
                <div className="modal-button-container">
                <button className="modal-button" onClick={closeModal}>close</button>
                </div>
            </Modal>
        </div>
    )
}

export default Users;