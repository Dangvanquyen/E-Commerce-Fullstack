import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';

const TestChatPage = () => {
  const { user } = useAuth();
  const { 
    chatRoom, 
    messages, 
    unreadCount, 
    isConnected, 
    isLoading, 
    sendMessage, 
    markMessagesAsRead 
  } = useChat();
  
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await sendMessage(newMessage);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (!user) {
    return <div>Please login to test chat</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Chat Test Page</h1>
      
      {/* Connection Status */}
      <div className="mb-4 p-4 bg-gray-100 rounded-lg">
        <h2 className="font-semibold mb-2">Connection Status</h2>
        <p>Connected: {isConnected ? '✅ Yes' : '❌ No'}</p>
        <p>Loading: {isLoading ? '⏳ Yes' : '✅ No'}</p>
        <p>Unread Count: {unreadCount}</p>
      </div>

      {/* Chat Room Info */}
      {chatRoom && (
        <div className="mb-4 p-4 bg-blue-100 rounded-lg">
          <h2 className="font-semibold mb-2">Chat Room Info</h2>
          <p>Room ID: {chatRoom.chatRoomId}</p>
          <p>Room Name: {chatRoom.roomName}</p>
          <p>User ID: {chatRoom.nguoiDungId}</p>
        </div>
      )}

      {/* Messages */}
      <div className="mb-4 p-4 bg-white border rounded-lg h-64 overflow-y-auto">
        <h2 className="font-semibold mb-2">Messages ({messages.length})</h2>
        {messages.map((message) => (
          <div 
            key={message.chatMessageId} 
            className={`mb-2 p-2 rounded ${
              message.nguoiDungId === user.nguoiDungId 
                ? 'bg-blue-100 ml-8' 
                : 'bg-gray-100 mr-8'
            }`}
          >
            <p className="text-sm font-medium">
              {message.isFromAdmin ? 'Admin' : message.tenNguoiDung}
            </p>
            <p>{message.noiDung}</p>
            <p className="text-xs text-gray-500">
              {new Date(message.ngayGui).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* Send Message Form */}
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-3 py-2 border rounded-lg"
          disabled={!isConnected}
        />
        <button
          type="submit"
          disabled={!newMessage.trim() || !isConnected}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:bg-gray-300"
        >
          Send
        </button>
      </form>

      {/* Actions */}
      <div className="mt-4 flex gap-2">
        <button
          onClick={markMessagesAsRead}
          className="px-4 py-2 bg-green-500 text-white rounded-lg"
          disabled={!chatRoom}
        >
          Mark as Read
        </button>
      </div>
    </div>
  );
};

export default TestChatPage;