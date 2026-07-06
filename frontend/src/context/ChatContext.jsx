import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext';
import chatApi from '../api/chatApi';
import signalRService from '../services/signalRService';
import { playMessageNotificationSound } from '../utils/chatNotification';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [chatRoom, setChatRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // CRITICAL FIX: Define all functions before using them
  const loadUnreadCount = useCallback(async (chatRoomId) => {
    try {
      const response = await chatApi.getUnreadMessageCount(chatRoomId);
      if (response.success) {
        setUnreadCount(response.data);
      }
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  }, []);

  const getOrCreateChatRoom = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('ChatContext - Getting chat room...');
      const response = await chatApi.getOrCreateChatRoom();
      console.log('ChatContext - Chat room response:', response);
      
      if (response.success) {
        setChatRoom(response.data);
        
        // Join SignalR room
        if (signalRService.isConnectionActive()) {
          await signalRService.joinChatRoom(response.data.chatRoomId);
        }

        // Load messages nếu có
        if (response.data.messages) {
          setMessages(response.data.messages);
        }

        // Load unread count
        await loadUnreadCount(response.data.chatRoomId);
      }
    } catch (error) {
      console.error('Error getting chat room:', error);
    } finally {
      setIsLoading(false);
    }
  }, [loadUnreadCount]);

  const syncMessagesFallback = useCallback(async () => {
    if (!user || !token) return;

    try {
      const response = await chatApi.getOrCreateChatRoom();
      if (!response?.success || !response?.data) return;

      setChatRoom(response.data);

      if (Array.isArray(response.data.messages)) {
        setMessages(response.data.messages);
      }

      if (response.data.chatRoomId) {
        await loadUnreadCount(response.data.chatRoomId);
      }
    } catch (error) {
      console.error('Error syncing fallback chat messages:', error);
    }
  }, [user, token, loadUnreadCount]);

  // CRITICAL FIX: Stable handler reference với useCallback
  const handleMessageReceived = useCallback((message) => {
    console.log('ChatContext - Message received:', message);
    
    // DUPLICATE FIX: Chỉ thêm tin nhắn nếu chưa tồn tại
    let isDuplicate = false;
    setMessages(prev => {
      const exists = prev.some(msg => msg.chatMessageId === message.chatMessageId);
      if (exists) {
        isDuplicate = true;
        console.log('ChatContext - Message already exists, skipping');
        return prev;
      }
      return [...prev, message];
    });

    if (isDuplicate) {
      return;
    }
    
    // SAFETY FIX: Kiểm tra user tồn tại và logic unread đúng
    if (user && message.nguoiDungId !== user.nguoiDungId) {
      setUnreadCount(prev => prev + 1);
      playMessageNotificationSound();
      toast.info('Admin vừa gửi tin nhắn mới', {
        toastId: `user-chat-${message.chatMessageId}`
      });
    }
  }, [user]);

  // MEMORY LEAK FIX: Stable disconnect function
  const disconnectSignalR = useCallback(async () => {
    try {
      // CLEANUP FIX: Remove handlers before disconnecting
      signalRService.removeMessageHandler(handleMessageReceived);
      
      await signalRService.stopConnection();
      setIsConnected(false);
      setChatRoom(null);
      setMessages([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Error disconnecting SignalR:', error);
    }
  }, [handleMessageReceived]);

  // MEMORY LEAK FIX: Stable initialize function
  const initializeSignalR = useCallback(async () => {
    if (!user || !token) {
      console.log('ChatContext - No user or token, skipping SignalR initialization');
      return;
    }

    try {
      console.log('ChatContext - Initializing SignalR with token:', token);
      await signalRService.startConnection(token);
      setIsConnected(true);
      console.log('ChatContext - SignalR connected successfully');

      // CLEANUP FIX: Proper handler management
      signalRService.onMessageReceived(handleMessageReceived);

      // Lấy hoặc tạo chat room
      await getOrCreateChatRoom();
    } catch (error) {
      console.error('Failed to initialize SignalR:', error);
      setIsConnected(false);
      
      // RETRY LOGIC: Try again after delay for certain errors
      if (error.message.includes('negotiation') || error.message.includes('connection')) {
        console.log('ChatContext - Will retry SignalR connection in 3 seconds...');
        setTimeout(() => {
          if (user && token && !signalRService.isConnectionActive()) {
            initializeSignalR();
          }
        }, 3000);
      }
    }
  }, [token, handleMessageReceived, getOrCreateChatRoom, user]);

  // Khởi tạo SignalR connection khi user login
  useEffect(() => {
    if (user && token) {
      initializeSignalR();
    } else {
      disconnectSignalR();
    }

    return () => {
      disconnectSignalR();
    };
  }, [user, token, initializeSignalR, disconnectSignalR]);

  // Polling fallback for user side when realtime channel is unavailable.
  useEffect(() => {
    if (!user || !token || isConnected) {
      return;
    }

    const poller = setInterval(() => {
      syncMessagesFallback();
    }, 5000);

    return () => clearInterval(poller);
  }, [user, token, isConnected, syncMessagesFallback]);

  const sendMessage = useCallback(async (content) => {
    const trimmedContent = content?.trim?.() ?? '';
    if (!trimmedContent) return;
    if (!user) return;

    // If chatRoom state is missing (e.g. SignalR offline), fall back to API
    // so user can still send messages and create room.
    let roomToUse = chatRoom;
    if (!roomToUse) {
      const roomResponse = await chatApi.getOrCreateChatRoom();
      if (!roomResponse?.success) return;

      roomToUse = roomResponse.data;
      setChatRoom(roomToUse);

      if (roomToUse?.messages) {
        setMessages(roomToUse.messages);
      }

      // Ensure unread count is in sync
      if (roomToUse?.chatRoomId) {
        await loadUnreadCount(roomToUse.chatRoomId);
      }

      // Join SignalR group if connection is active
      if (signalRService.isConnectionActive()) {
        await signalRService.joinChatRoom(roomToUse.chatRoomId);
      }
    }

    try {
      // OPTIMISTIC UPDATE: Thêm tin nhắn ngay lập tức vào UI
      const tempMessage = {
        chatMessageId: Date.now(), // Temporary ID
        chatRoomId: roomToUse.chatRoomId,
        nguoiDungId: user.nguoiDungId,
        noiDung: trimmedContent,
        ngayGui: new Date().toISOString(),
        daDoc: false,
        isFromAdmin: false,
        tenNguoiDung: user.hoTen
      };
      
      setMessages(prev => [...prev, tempMessage]);

      const response = await chatApi.sendMessage({
        noiDung: trimmedContent,
        chatRoomId: roomToUse.chatRoomId
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
        return response.data;
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove temp message on error
      setMessages(prev => 
        prev.filter(msg => msg.chatMessageId !== Date.now())
      );
      throw error;
    }
  }, [chatRoom, user, loadUnreadCount]);

  const markMessagesAsRead = useCallback(async () => {
    if (!chatRoom) return;

    try {
      await chatApi.markMessagesAsRead(chatRoom.chatRoomId);
      setUnreadCount(0);
      
      // Cập nhật trạng thái đã đọc cho messages
      setMessages(prev => 
        prev.map(msg => 
          msg.nguoiDungId !== user?.nguoiDungId 
            ? { ...msg, daDoc: true }
            : msg
        )
      );
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, [chatRoom, user]);

  const value = {
    chatRoom,
    messages,
    unreadCount,
    isConnected,
    isLoading,
    sendMessage,
    markMessagesAsRead,
    getOrCreateChatRoom,
    connectSignalR: initializeSignalR
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};