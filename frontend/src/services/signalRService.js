import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { SIGNALR_HUB_URL } from '../api/apiConfig';

class SignalRService {
  constructor() {
    this.connection = null;
    this.isConnected = false;
    this.messageHandlers = [];
    this.userOnlineHandlers = [];
    this.userOfflineHandlers = [];
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.currentToken = null;
  }

  async startConnection(token) {
    console.log('SignalR - Starting connection with token:', token ? 'Present' : 'Missing');
    
    if (!token) {
      throw new Error('Token is required for SignalR connection');
    }
    
    this.currentToken = token;
    
    // CLEANUP FIX: Stop existing connection properly
    if (this.connection) {
      await this.stopConnection();
    }

    try {
      // ENHANCED CONNECTION: Try primary method first
      this.connection = new HubConnectionBuilder()
        .withUrl(SIGNALR_HUB_URL, {
          accessTokenFactory: () => token,
          skipNegotiation: false,
          transport: 1 // WebSockets only
        })
        .withAutomaticReconnect([0, 2000, 10000, 30000])
        .configureLogging(LogLevel.Information)
        .build();

      console.log('SignalR - Hub URL:', SIGNALR_HUB_URL);

      // STABILITY FIX: Enhanced connection event handling
      this.connection.onreconnecting(() => {
        console.log('SignalR reconnecting...');
        this.isConnected = false;
        this.reconnectAttempts++;
      });

      this.connection.onreconnected(() => {
        console.log('SignalR reconnected successfully');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        
        // Re-register handlers after reconnection
        this.registerEventHandlers();
      });

      this.connection.onclose((error) => {
        console.log('SignalR connection closed:', error);
        this.isConnected = false;
        
        // ENHANCED ERROR RECOVERY: Intelligent retry logic
        if (error && this.reconnectAttempts < this.maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
          console.log(`SignalR - Will retry connection in ${delay}ms... (attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
          
          setTimeout(() => {
            if (!this.isConnected && this.currentToken) {
              this.startConnection(this.currentToken).catch(console.error);
            }
          }, delay);
        } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.error('SignalR - Max reconnection attempts reached');
        }
      });

      // TIMEOUT FIX: Add connection timeout
      const connectionPromise = this.connection.start();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout after 15 seconds')), 15000)
      );

      await Promise.race([connectionPromise, timeoutPromise]);
      
      this.isConnected = true;
      this.reconnectAttempts = 0;
      console.log('SignalR connected successfully');
      
      // Register event handlers
      this.registerEventHandlers();
      
    } catch (error) {
      console.error('SignalR primary connection failed:', error);
      this.isConnected = false;
      
      // FALLBACK FIX: Try alternative connection method
      if (error.message.includes('negotiation') || error.message.includes('timeout')) {
        console.log('SignalR - Trying fallback connection method...');
        try {
          // Clean up failed connection
          if (this.connection) {
            await this.connection.stop().catch(() => {});
            this.connection = null;
          }

          // Try with query string token
          this.connection = new HubConnectionBuilder()
            .withUrl(`${SIGNALR_HUB_URL}?access_token=${encodeURIComponent(token)}`)
            .withAutomaticReconnect([0, 2000, 10000, 30000])
            .configureLogging(LogLevel.Information)
            .build();

          // Set up event handlers for fallback connection
          this.connection.onreconnecting(() => {
            console.log('SignalR (fallback) reconnecting...');
            this.isConnected = false;
          });

          this.connection.onreconnected(() => {
            console.log('SignalR (fallback) reconnected successfully');
            this.isConnected = true;
            this.registerEventHandlers();
          });

          this.connection.onclose((error) => {
            console.log('SignalR (fallback) connection closed:', error);
            this.isConnected = false;
          });
            
          await this.connection.start();
          this.isConnected = true;
          this.reconnectAttempts = 0;
          console.log('SignalR fallback connection successful');
          
          this.registerEventHandlers();
        } catch (fallbackError) {
          console.error('SignalR fallback connection also failed:', fallbackError);
          this.isConnected = false;
          throw fallbackError;
        }
      } else {
        throw error;
      }
    }
  }

  // STABILITY FIX: Separate method for registering handlers
  registerEventHandlers() {
    if (!this.connection) return;

    // Clear existing handlers to prevent duplicates
    this.connection.off('ReceiveMessage');
    this.connection.off('UserOnline');
    this.connection.off('UserOffline');

    // Register handlers
    this.connection.on('ReceiveMessage', (message) => {
      this.messageHandlers.forEach(handler => {
        try {
          handler(message);
        } catch (error) {
          console.error('Error in message handler:', error);
        }
      });
    });

    this.connection.on('UserOnline', (userId) => {
      this.userOnlineHandlers.forEach(handler => {
        try {
          handler(userId);
        } catch (error) {
          console.error('Error in user online handler:', error);
        }
      });
    });

    this.connection.on('UserOffline', (userId) => {
      this.userOfflineHandlers.forEach(handler => {
        try {
          handler(userId);
        } catch (error) {
          console.error('Error in user offline handler:', error);
        }
      });
    });
  }

  async stopConnection() {
    if (this.connection) {
      try {
        // Clear handlers before stopping
        this.connection.off('ReceiveMessage');
        this.connection.off('UserOnline');
        this.connection.off('UserOffline');
        
        await this.connection.stop();
      } catch (error) {
        console.error('Error stopping SignalR connection:', error);
      }
      this.connection = null;
      this.isConnected = false;
      this.currentToken = null;
      this.reconnectAttempts = 0;
    }
  }

  async joinChatRoom(chatRoomId) {
    if (this.connection && this.isConnectionActive()) {
      try {
        // TIMEOUT FIX: Thêm timeout cho operation
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Join room timeout')), 10000)
        );
        
        const joinPromise = this.connection.invoke('JoinChatRoom', chatRoomId.toString());
        
        await Promise.race([joinPromise, timeoutPromise]);
        console.log(`SignalR - Joined chat room: ${chatRoomId}`);
      } catch (error) {
        console.error('Error joining chat room:', error);
      }
    }
  }

  async leaveChatRoom(chatRoomId) {
    if (this.connection && this.isConnectionActive()) {
      try {
        // TIMEOUT FIX: Thêm timeout cho operation
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Leave room timeout')), 10000)
        );
        
        const leavePromise = this.connection.invoke('LeaveChatRoom', chatRoomId.toString());
        
        await Promise.race([leavePromise, timeoutPromise]);
        console.log(`SignalR - Left chat room: ${chatRoomId}`);
      } catch (error) {
        console.error('Error leaving chat room:', error);
      }
    }
  }

  // Event handlers
  onMessageReceived(handler) {
    this.messageHandlers.push(handler);
  }

  onUserOnline(handler) {
    this.userOnlineHandlers.push(handler);
  }

  onUserOffline(handler) {
    this.userOfflineHandlers.push(handler);
  }

  // Remove handlers
  removeMessageHandler(handler) {
    this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
  }

  removeUserOnlineHandler(handler) {
    this.userOnlineHandlers = this.userOnlineHandlers.filter(h => h !== handler);
  }

  removeUserOfflineHandler(handler) {
    this.userOfflineHandlers = this.userOfflineHandlers.filter(h => h !== handler);
  }

  getConnectionState() {
    return this.connection?.state || 'Disconnected';
  }

  isConnectionActive() {
    return this.isConnected && this.connection?.state === 'Connected';
  }
}

// Singleton instance
const signalRService = new SignalRService();
export default signalRService;