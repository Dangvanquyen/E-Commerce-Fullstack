import { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';

// Component thuần túy - không có logic kiểm tra điều kiện
const ChatPopup = () => {
  const { user } = useAuth();
  const { 
    messages = [], 
    unreadCount = 0, 
    isConnected = false, 
    isLoading = false, 
    sendMessage = async () => {}, 
    markMessagesAsRead = () => {},
    connectSignalR = async () => {}
  } = useChat();
  
  const [isOpen, setIsOpen] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto scroll to bottom khi có tin nhắn mới
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input khi mở chat
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Helper functions
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleToggleChat = async () => {
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);

    if (nextOpen) {
      // Try to connect when user opens chat.
      if (!isConnected) {
        connectSignalR().catch(() => {});
      }

      if (unreadCount > 0) {
        setTimeout(() => {
          markMessagesAsRead();
        }, 500);
      }
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;
    
    if (!isConnected) {
      // Still allow sending via REST API even when realtime is offline.
      connectSignalR().catch(() => {});
    }

    setIsSending(true);
    try {
      await sendMessage(newMessage);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Không thể gửi tin nhắn. Vui lòng thử lại.');
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hôm nay';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Hôm qua';
    } else {
      return date.toLocaleDateString('vi-VN');
    }
  };

  const groupMessagesByDate = (msgList) => {
    const groups = {};
    if (!Array.isArray(msgList)) return groups;
    
    msgList.forEach((message, index) => {
      const date = new Date(message.ngayGui).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      
      const prevMessage = index > 0 ? msgList[index - 1] : null;
      const timeDiff = prevMessage 
        ? (new Date(message.ngayGui) - new Date(prevMessage.ngayGui)) / 1000 / 60 
        : 0;
      
      groups[date].push({
        ...message,
        showTimeSeparator: timeDiff > 5
      });
    });
    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="fixed bottom-4 right-20 z-50">
      {/* Chat Button */}
      <button
        onClick={handleToggleChat}
        className={`relative p-4 rounded-full shadow-lg transition-all duration-300 ${
          isConnected 
            ? 'bg-blue-500 hover:bg-blue-600 text-white' 
            : 'bg-gray-400 text-gray-200'
        }`}
      >
        <svg 
          className="w-6 h-6" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
          />
        </svg>
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}

        {/* Connection Status */}
        <div className={`absolute -top-1 -left-1 w-3 h-3 rounded-full ${
          isConnected ? 'bg-green-400' : 'bg-red-400'
        }`} />
      </button>

      {/* Chat Popup */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 h-96 bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-blue-500 text-white rounded-t-lg">
            <div>
              <h3 className="font-semibold">Chat với Admin</h3>
            </div>
            <button
              onClick={handleToggleChat}
              className="text-white hover:text-gray-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <>
                {Object.entries(messageGroups).map(([date, dayMessages]) => (
                  <div key={date}>
                    {/* Date Separator */}
                    <div className="flex justify-center mb-4">
                      <span className="bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full">
                        {formatDate(dayMessages[0].ngayGui)}
                      </span>
                    </div>

                    {/* Messages for this date */}
                    {dayMessages.map((message, index) => (
                      <div key={message.chatMessageId}>
                        {/* Time separator if gap > 5 minutes */}
                        {message.showTimeSeparator && index > 0 && (
                          <div className="flex justify-center my-3">
                            <span className="bg-gray-100 text-gray-400 text-xs px-2 py-1 rounded">
                              {formatTime(message.ngayGui)}
                            </span>
                          </div>
                        )}
                        
                        <div
                          className={`flex mb-2 ${
                            message.nguoiDungId === user.nguoiDungId 
                              ? 'justify-end' 
                              : 'justify-start'
                          }`}
                        >
                          <div
                            className={`max-w-xs px-3 py-2 rounded-lg ${
                              message.nguoiDungId === user.nguoiDungId
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            <p className="text-sm">{message.noiDung}</p>
                            <p className={`text-xs mt-1 ${
                              message.nguoiDungId === user.nguoiDungId
                                ? 'text-blue-100'
                                : 'text-gray-500'
                            }`}>
                              {formatTime(message.ngayGui)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
                
                {(!messages || messages.length === 0) && (
                  <div className="text-center text-gray-500 text-sm">
                    <p>Chào bạn! 👋</p>
                    <p>Chúng tôi có thể giúp gì cho bạn?</p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Nhập tin nhắn..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSending}
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || isSending}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {isSending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatPopup;