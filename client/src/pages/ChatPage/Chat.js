import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import './Chat.css';
import Navbar from '../../components/Navbar/Navbar';
import { useLocation } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import stringSimilarity from 'string-similarity'; // Import string-similarity for typo-tolerant search

export default function Chat() {
    const location = useLocation();
    const [participants, setParticipants] = useState([]);
    const [filteredParticipants, setFilteredParticipants] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loggedInUserId, setLoggedInUserId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const decodedToken = jwtDecode(token);
            setLoggedInUserId(decodedToken.userId);
        }

        // Fetch all participants initially
        const fetchParticipants = async () => {
            try {
                const response = await axios.get('http://localhost:3011/chat/participants', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setParticipants(response.data);
                setFilteredParticipants(response.data); // Initialize filtered list
            } catch (error) {
                console.error('Error fetching participants:', error);
            }
        };

        fetchParticipants();
    }, []);
    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
    
        if (term.trim() === '') {
            setFilteredParticipants(participants); // Reset to all participants if search term is empty
            return;
        }
    
        // First, filter by substring match for more specific results
        let filtered = participants.filter(user => 
            user.storeName.toLowerCase().includes(term)
        );
    
        // If no exact substring matches, use similarity-based filtering
        if (filtered.length === 0) {
            filtered = participants.filter(user => {
                const similarity = stringSimilarity.compareTwoStrings(user.storeName.toLowerCase(), term);
                return similarity > 0.4; // Set a threshold for typo tolerance
            });
        }
    
        setFilteredParticipants(filtered);
    };

    const startOrFetchChat = async (otherUserId) => {
        try {
            const response = await axios.post('http://localhost:3011/chat/startOrFetchChat', {
                otherUserId
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            const chat = response.data;
            const otherUser = chat.participants.find(participant => participant._id !== loggedInUserId);

            if (otherUser) {
                setSelectedUser(otherUser);
                setMessages(chat.messages);
            } else {
                console.error("Other user not found in chat participants");
            }
        } catch (error) {
            console.error('Error initiating or fetching chat:', error);
            toast.error('Failed to initiate or fetch chat');
        }
    };

    const handleSendMessage = async () => {
        if (newMessage.trim() === '') return;

        try {
            const response = await axios.post('http://localhost:3011/chat/sendMessage', {
                receiverId: selectedUser?._id,
                text: newMessage
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            const sentMessage = response.data;
            setMessages([...messages, {
                ...sentMessage,
                timestamp: new Date().toISOString(),
                sender: loggedInUserId,
            }]);
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Failed to send message');
        }
    };

    return (
        <div className="container-chat">
            <Navbar />
            <div className="chat-wrapper">
                <div className="chat-sidebar">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search by store name"
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                    <div className="user-list">
                        {filteredParticipants.map((user) => (
                            <div key={user._id} className="user-item" onClick={() => startOrFetchChat(user._id)}>
                                <img src={`http://localhost:3011/uploads/${user.storePicture}`} alt="avatar" className="user-avatar" />
                                <div className="user-info">
                                    <p className="user-name">{user.storeName}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="chat-content">
                    {selectedUser ? (
                        <>
                            <h2 className="chat-header">
                                Messages with {selectedUser.storeName || "Unnamed Store"}
                            </h2>
                            <div className="message-list">
                                {messages.map((msg, index) => (
                                    <div
                                        key={index}
                                        className={`chat-message ${msg.sender === loggedInUserId ? 'sent' : 'received'}`}
                                    >
                                        <p>{msg.text}</p>
                                        <span className="message-time">
                                            {new Date(msg.timestamp).toLocaleTimeString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div className="chat-input">
                                <input
                                    type="text"
                                    placeholder="Type your message..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                />
                                <button className="send-button" onClick={handleSendMessage}>Send</button>
                            </div>
                        </>
                    ) : (
                        <h2 className="chat-header">Select a conversation to start chatting</h2>
                    )}
                </div>
            </div>
            <ToastContainer 
                position="top-center"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
        </div>
    );
}
