import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import chatApi from '../../api/chatApi';
import signalRService from '../../services/signalRService';
import { playMessageNotificationSound } from '../../utils/chatNotification';

const ChatDashboardPage = () => {
  const { user, token } = useAuth();
  const [chatRooms, setChatRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (user?.vaiTro?.tenVaiTro === 'Admin' && token) {
      initializeAdminChat();
    }

    return () => {
      signalRService.removeMessageHandler(handleMessageReceived);
      signalRService.removeUserOnlineHandler(handleUserOnline);
      signalRService.removeUserOfflineHandler(handleUserOffline);
      disconnectSignalR();
    };
  }, [user, token]);

  // Fallback polling: keep chat list fresh even if SignalR is disconnected.
  useEffect(() => {
    if (user?.vaiTro?.tenVaiTro !== 'Admin' || !token) {
      return;
    }

    const poller = setInterval(() => {
      loadChatRooms();
    }, 5000);

    return () => clearInterval(poller);
  }, [user, token]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (selectedRoom && inputRef.current) {
      inputRef.current.focus();
    }
  }, [selectedRoom]);

  const initializeAdminChat = async () => {
    try {
      console.log('ChatDashboard - Initializing admin chat...');
      
      // Khởi tạo SignalR
      await signalRService.startConnection(token);
      setIsConnected(true);
      console.log('ChatDashboard - SignalR connected');

      // Đăng ký event handlers
      signalRService.onMessageReceived(handleMessageReceived);
      signalRService.onUserOnline(handleUserOnline);
      signalRService.onUserOffline(handleUserOffline);

      // Load chat rooms
      await loadChatRooms();
      await loadOnlineUsers();
    } catch (error) {
      console.error('Failed to initialize admin chat:', error);
      setIsConnected(false);

      // Fallback: still load data via REST even when realtime fails.
      await loadChatRooms();
      await loadOnlineUsers();
      
      // RETRY LOGIC: Try again after delay
      setTimeout(() => {
        if (user?.vaiTro?.tenVaiTro === 'Admin' && token && !signalRService.isConnectionActive()) {
          console.log('ChatDashboard - Retrying admin chat initialization...');
          initializeAdminChat();
        }
      }, 3000);
    }
  };

  const disconnectSignalR = async () => {
    try {
      await signalRService.stopConnection();
      setIsConnected(false);
    } catch (error) {
      console.error('Error disconnecting SignalR:', error);
    }
  };

  const handleMessageReceived = (message) => {
    console.log('ChatDashboard - Received message:', message);
    const isCurrentRoom = selectedRoom && message.chatRoomId === selectedRoom.chatRoomId;
    
    // Cập nhật messages nếu đang xem room này
    let isDuplicate = false;
    if (isCurrentRoom) {
      // DUPLICATE FIX: Chỉ thêm tin nhắn nếu chưa tồn tại
      setMessages(prev => {
        const exists = prev.some(msg => msg.chatMessageId === message.chatMessageId);
        if (exists) {
          isDuplicate = true;
          console.log('ChatDashboard - Message already exists, skipping');
          return prev;
        }
        return [...prev, message];
      });
    }

    if (!isDuplicate && !message.isFromAdmin && !isCurrentRoom) {
      playMessageNotificationSound();
      toast.info(`Tin nhắn mới từ ${message.tenNguoiDung || 'khách hàng'}`, {
        toastId: `admin-chat-${message.chatMessageId}`
      });
    }

    // LOGIC FIX: Sửa logic unread count
    setChatRooms(prev => {
      const existingRoomIndex = prev.findIndex(room => room.chatRoomId === message.chatRoomId);
      
      if (existingRoomIndex >= 0) {
        // Update existing room
        const updatedRooms = [...prev];
        
        updatedRooms[existingRoomIndex] = {
          ...updatedRooms[existingRoomIndex],
          lastMessage: message,
          // Admin dashboard: tăng unread nếu tin nhắn từ user VÀ không đang xem room đó
          unreadMessageCount: !message.isFromAdmin && !isCurrentRoom
            ? updatedRooms[existingRoomIndex].unreadMessageCount + 1 
            : updatedRooms[existingRoomIndex].unreadMessageCount,
          ngayCapNhat: message.ngayGui
        };
        return updatedRooms;
      } else {
        // New room - reload the list
        loadChatRooms();
        return prev;
      }
    });
  };

  const handleUserOnline = (userId) => {
    console.log('ChatDashboard - User online:', userId);
    setOnlineUsers(prev => new Set([...prev, userId.toString()]));
  };

  const handleUserOffline = (userId) => {
    console.log('ChatDashboard - User offline:', userId);
    setOnlineUsers(prev => {
      const newSet = new Set(prev);
      newSet.delete(userId.toString());
      return newSet;
    });
  };

  const loadChatRooms = async () => {
    try {
      setIsLoading(true);
      const response = await chatApi.getActiveChatRooms();
      if (response.success) {
        setChatRooms(response.data);
      }
    } catch (error) {
      console.error('Error loading chat rooms:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadOnlineUsers = async () => {
    try {
      const response = await chatApi.getOnlineUsers();
      const onlineIds = Array.isArray(response) ? response : response?.data;
      if (Array.isArray(onlineIds)) {
        setOnlineUsers(new Set(onlineIds.map(id => id.toString())));
      }
    } catch (error) {
      console.error('Error loading online users:', error);
    }
  };

  const selectChatRoom = async (room) => {
    try {
      setSelectedRoom(room);
      setIsLoading(true);

      // Leave previous room
      if (selectedRoom) {
        await signalRService.leaveChatRoom(selectedRoom.chatRoomId);
      }

      // Join new room
      await signalRService.joinChatRoom(room.chatRoomId);

      // Load messages
      const response = await chatApi.getChatRoomWithMessages(room.chatRoomId);
      if (response.success) {
        setMessages(response.data.messages || []);
        
        // Auto scroll to bottom after loading messages
        setTimeout(() => {
          scrollToBottom();
        }, 100);
      }

      // Mark messages as read
      await chatApi.markMessagesAsRead(room.chatRoomId);
      
      // Update unread count in list
      setChatRooms(prev => 
        prev.map(r => 
          r.chatRoomId === room.chatRoomId 
            ? { ...r, unreadMessageCount: 0 }
            : r
        )
      );
    } catch (error) {
      console.error('Error selecting chat room:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedRoom || isSending) return;

    setIsSending(true);
    
    // OPTIMISTIC UPDATE: Thêm tin nhắn ngay lập tức vào UI
    const tempMessage = {
      chatMessageId: Date.now(), // Temporary ID
      chatRoomId: selectedRoom.chatRoomId,
      nguoiDungId: user.nguoiDungId,
      noiDung: newMessage.trim(),
      ngayGui: new Date().toISOString(),
      daDoc: false,
      isFromAdmin: true,
      tenNguoiDung: user.hoTen
    };
    
    setMessages(prev => [...prev, tempMessage]);
    const messageToSend = newMessage.trim();
    setNewMessage('');

    try {
      const response = await chatApi.sendMessage({
        noiDung: messageToSend,
        chatRoomId: selectedRoom.chatRoomId
      });

      if (response.success) {
        // Replace temp message with real message from server
        setMessages(prev => 
          prev.map(msg => 
            msg.chatMessageId === tempMessage.chatMessageId 
              ? response.data 
              : msg
          )
        );
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove temp message on error and restore input
      setMessages(prev => 
        prev.filter(msg => msg.chatMessageId !== tempMessage.chatMessageId)
      );
      setNewMessage(messageToSend);
      toast.error('Không thể gửi tin nhắn. Vui lòng thử lại.');
    } finally {
      setIsSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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

  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach((message, index) => {
      const date = new Date(message.ngayGui).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      
      // Check if need time separator (more than 5 minutes gap)
      const prevMessage = index > 0 ? messages[index - 1] : null;
      const timeDiff = prevMessage 
        ? (new Date(message.ngayGui) - new Date(prevMessage.ngayGui)) / 1000 / 60 
        : 0;
      
      groups[date].push({
        ...message,
        showTimeSeparator: timeDiff > 5 // Show separator if gap > 5 minutes
      });
    });
    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  if (user?.vaiTro?.tenVaiTro !== 'Admin') {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Bạn không có quyền truy cập trang này.</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-100 overflow-hidden">
      {/* Sidebar - Chat Rooms List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Chat Dashboard</h2>
            <div className={`w-3 h-3 rounded-full ${
              isConnected ? 'bg-green-400' : 'bg-red-400'
            }`} title={isConnected ? 'Đã kết nối' : 'Mất kết nối'} />
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {chatRooms.length} cuộc trò chuyện
          </p>
        </div>

        {/* Chat Rooms List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading && !selectedRoom ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : chatRooms.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <p>Chưa có cuộc trò chuyện nào</p>
            </div>
          ) : (
            chatRooms.map((room) => (
              <div
                key={room.chatRoomId}
                onClick={() => selectChatRoom(room)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  selectedRoom?.chatRoomId === room.chatRoomId ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {room.tenNguoiDung?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      {onlineUsers.has(room.nguoiDungId.toString()) && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {room.tenNguoiDung || 'Khách hàng'}
                      </p>
                      {room.lastMessage && (
                        <p className="text-sm text-gray-500 truncate">
                          {room.lastMessage.isFromAdmin ? 'Bạn: ' : ''}
                          {room.lastMessage.noiDung}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    {room.lastMessage && (
                      <span className="text-xs text-gray-400">
                        {formatTime(room.lastMessage.ngayGui)}
                      </span>
                    )}
                    {room.unreadMessageCount > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {room.unreadMessageCount > 99 ? '99+' : room.unreadMessageCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedRoom ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white flex-shrink-0">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {selectedRoom.tenNguoiDung?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  {onlineUsers.has(selectedRoom.nguoiDungId.toString()) && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {selectedRoom.tenNguoiDung || 'Khách hàng'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {onlineUsers.has(selectedRoom.nguoiDungId.toString()) 
                      ? 'Đang hoạt động' 
                      : 'Không hoạt động'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 min-h-0">
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
                        <span className="bg-white text-gray-500 text-xs px-3 py-1 rounded-full shadow-sm">
                          {formatDate(dayMessages[0].ngayGui)}
                        </span>
                      </div>

                      {/* Messages for this date */}
                      {dayMessages.map((message, index) => (
                        <div key={message.chatMessageId}>
                          {/* Time separator if gap > 5 minutes */}
                          {message.showTimeSeparator && index > 0 && (
                            <div className="flex justify-center my-3">
                              <span className="bg-gray-200 text-gray-500 text-xs px-2 py-1 rounded">
                                {formatTime(message.ngayGui)}
                              </span>
                            </div>
                          )}
                          
                          <div
                            className={`flex mb-2 ${
                              message.isFromAdmin ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                message.isFromAdmin
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-white text-gray-800 shadow-sm'
                              }`}
                            >
                              <p className="text-sm">{message.noiDung}</p>
                              <p className={`text-xs mt-1 ${
                                message.isFromAdmin
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
                  
                  {messages.length === 0 && (
                    <div className="text-center text-gray-500 text-sm">
                      <p>Chưa có tin nhắn nào</p>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Message Input - Fixed at bottom */}
            <form onSubmit={sendMessage} className="p-4 bg-white border-t border-gray-200 flex-shrink-0">
              <div className="flex space-x-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Nhập tin nhắn..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isSending}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || isSending}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {isSending ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    'Gửi'
                  )}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-lg font-medium">Chọn một cuộc trò chuyện</p>
              <p className="text-sm">Chọn một khách hàng từ danh sách để bắt đầu trò chuyện</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatDashboardPage;