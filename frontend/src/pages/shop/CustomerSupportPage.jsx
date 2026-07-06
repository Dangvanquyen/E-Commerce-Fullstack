import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  ChevronDown,
  ChevronUp,
  Send,
  Loader2,
  Headphones,
  MessageSquare,
  Lock,
  MessageCircle,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';

const FAQS = [
  {
    q: 'Chính sách đổi trả hàng như thế nào?',
    a: 'FashionStore hỗ trợ đổi hàng trong vòng 7 ngày kể từ ngày nhận hàng. Sản phẩm đổi trả phải còn nguyên tem mác, chưa qua sử dụng, không bị dơ bẩn hay hư hỏng và kèm theo hóa đơn mua hàng.'
  },
  {
    q: 'Thời gian giao hàng mất bao lâu?',
    a: 'Thời gian giao hàng nội thành Hà Nội và TP.HCM dao động từ 1 - 2 ngày làm việc. Đối với khu vực ngoại thành và các tỉnh thành khác, thời gian giao hàng là từ 3 - 5 ngày.'
  },
  {
    q: 'Shop có hỗ trợ các phương thức thanh toán nào?',
    a: 'Chúng tôi hỗ trợ nhiều phương thức linh hoạt bao gồm: Thanh toán khi nhận hàng (COD), Chuyển khoản ngân hàng trực tuyến (quét mã QR) và thanh toán qua ví điện tử VNPay.'
  },
  {
    q: 'Làm thế nào để thay đổi thông tin giao hàng sau khi đã đặt hàng?',
    a: 'Nếu đơn hàng của bạn ở trạng thái "Chờ xử lý", bạn có thể liên hệ ngay với CSKH qua hotline 1900 1234 hoặc nhắn tin trực tiếp tại đây để nhân viên cập nhật thông tin kịp thời.'
  },
  {
    q: 'Làm thế nào để tôi có thể hủy đơn hàng?',
    a: 'Bạn có thể hủy đơn hàng trực tiếp trong trang "Đơn hàng của tôi" đối với đơn hàng chưa được xử lý. Trường hợp đơn đã chuyển sang trạng thái "Đang giao", vui lòng liên hệ hotline để được hỗ trợ.'
  }
];

const CustomerSupportPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const {
    chatRoom,
    messages = [],
    unreadCount = 0,
    isConnected = false,
    isLoading = false,
    sendMessage = async () => {},
    markMessagesAsRead = () => {},
    connectSignalR = async () => {}
  } = useChat();

  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isAuthenticated && messages.length > 0) {
      scrollToBottom();
    }
  }, [messages.length, isAuthenticated]);

  // Connect to SignalR if not active and authenticated
  useEffect(() => {
    if (isAuthenticated && !isConnected) {
      connectSignalR().catch((err) => {
        console.error('Failed to connect to SignalR in Support Page:', err);
      });
    }
  }, [isAuthenticated, isConnected, connectSignalR]);

  // Mark messages as read if we open customer support page and have unread items
  useEffect(() => {
    if (isAuthenticated && unreadCount > 0) {
      const timer = setTimeout(() => {
        markMessagesAsRead();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, unreadCount, markMessagesAsRead]);

  // Handle message sending
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    if (!isConnected) {
      connectSignalR().catch(() => {});
    }

    setIsSending(true);
    try {
      await sendMessage(newMessage);
      setNewMessage('');
      if (inputRef.current) {
        inputRef.current.focus();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Không thể gửi tin nhắn. Vui lòng thử lại.');
    } finally {
      setIsSending(false);
    }
  };

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  // Date and time utilities
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
    <div className="bg-gray-50 min-h-screen pb-16">
      {/* Banner */}
      <div className="bg-gradient-to-r from-red-500 via-rose-500 to-pink-600 text-white py-12 shadow-sm">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
            Trung Tâm Chăm Sóc Khách Hàng
          </h1>
          <p className="text-red-50 text-sm md:text-base max-w-xl mx-auto font-medium">
            FashionStore luôn sẵn sàng giải đáp thắc mắc, hỗ trợ đổi trả hàng và đồng hành cùng bạn 24/7.
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="container mx-auto px-4 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* FAQ & Contact Information (Left) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Contact Channels */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
                <Headphones className="text-red-600" size={20} />
                Kênh liên hệ trực tiếp
              </h2>
              <div className="space-y-4">
                <a
                  href="tel:19001234"
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-red-50 hover:text-red-600 transition group border border-gray-50 hover:border-red-100"
                >
                  <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center text-red-600 group-hover:bg-red-600 group-hover:text-white transition">
                    <Phone size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-semibold uppercase">Hotline tổng đài</p>
                    <p className="font-bold text-gray-800 text-base group-hover:text-red-600">1900 1234</p>
                  </div>
                </a>

                <a
                  href="mailto:support@fashionstore.com"
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-rose-50 hover:text-rose-600 transition group border border-gray-50 hover:border-rose-100"
                >
                  <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition">
                    <Mail size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-semibold uppercase">Gửi Email hỗ trợ</p>
                    <p className="font-bold text-gray-800 text-sm md:text-base group-hover:text-rose-600">support@fashionstore.com</p>
                  </div>
                </a>

                <div className="flex items-center gap-4 p-3 rounded-xl border border-gray-50 bg-gray-50/50">
                  <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center text-gray-600">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-semibold uppercase">Địa chỉ văn phòng</p>
                    <p className="font-semibold text-gray-700 text-sm">123 Đường Cầu Giấy, Cầu Giấy, Hà Nội</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-3 rounded-xl border border-gray-50 bg-gray-50/50">
                  <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center text-gray-600">
                    <Clock size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-semibold uppercase">Thời gian làm việc</p>
                    <p className="font-semibold text-gray-700 text-sm">08:00 - 22:00 (Hàng ngày)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Accordion FAQ */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
                <HelpCircle className="text-red-600" size={20} />
                Câu hỏi thường gặp (FAQ)
              </h2>
              <div className="space-y-3">
                {FAQS.map((faq, index) => {
                  const isOpen = activeFaq === index;
                  return (
                    <div
                      key={index}
                      className="border border-gray-100 rounded-xl overflow-hidden transition-all duration-300"
                    >
                      <button
                        onClick={() => toggleFaq(index)}
                        className={`w-full flex items-center justify-between p-4 text-left font-semibold text-sm transition ${
                          isOpen ? 'bg-red-50/50 text-red-700' : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span>{faq.q}</span>
                        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      <div
                        className={`transition-all duration-300 overflow-hidden ${
                          isOpen ? 'max-h-40 border-t border-gray-100 bg-white' : 'max-h-0'
                        }`}
                      >
                        <p className="p-4 text-xs md:text-sm text-gray-500 leading-relaxed">
                          {faq.a}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Admin Live Chat Panel (Right) */}
          <div className="lg:col-span-7">
            {isAuthenticated ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[550px]">
                
                {/* Chat Panel Header */}
                <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                        <MessageSquare size={20} />
                      </div>
                      <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                        isConnected ? 'bg-green-500' : 'bg-yellow-500'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-sm md:text-base">Chat trực tuyến với Admin</h3>
                      <p className="text-[11px] text-gray-400 font-medium">
                        {isConnected ? 'Realtime Connected' : 'Connecting to Server...'}
                      </p>
                    </div>
                  </div>
                  
                  {unreadCount > 0 && (
                    <button
                      onClick={() => markMessagesAsRead()}
                      className="text-xs text-red-600 hover:text-red-700 font-bold hover:underline transition"
                    >
                      Đánh dấu đã đọc
                    </button>
                  )}
                </div>

                {/* Messages Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50">
                  {isLoading ? (
                    <div className="flex flex-col justify-center items-center h-full">
                      <Loader2 size={36} className="animate-spin text-red-600 mb-2" />
                      <p className="text-xs text-gray-400">Đang tải lịch sử tin nhắn...</p>
                    </div>
                  ) : (
                    <>
                      {Object.entries(messageGroups).map(([date, dayMessages]) => (
                        <div key={date} className="space-y-4">
                          {/* Date separator */}
                          <div className="flex justify-center my-4">
                            <span className="bg-gray-200 text-gray-500 text-[10px] md:text-xs px-3 py-1 rounded-full font-bold">
                              {formatDate(dayMessages[0].ngayGui)}
                            </span>
                          </div>

                          {/* Message bubbles */}
                          {dayMessages.map((message, index) => {
                            const isMe = message.nguoiDungId === user?.nguoiDungId;
                            return (
                              <div key={message.chatMessageId} className="space-y-1">
                                {message.showTimeSeparator && index > 0 && (
                                  <div className="flex justify-center my-2">
                                    <span className="bg-transparent text-gray-400 text-[10px]">
                                      {formatTime(message.ngayGui)}
                                    </span>
                                  </div>
                                )}
                                
                                <div className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                                  <div className={`flex items-end gap-2 max-w-[80%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                    
                                    {/* Admin avatar */}
                                    {!isMe && (
                                      <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold shrink-0 mb-1">
                                        AD
                                      </div>
                                    )}

                                    <div className="flex flex-col">
                                      <div
                                        className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                                          isMe
                                            ? 'bg-gradient-to-br from-red-500 to-rose-600 text-white rounded-br-none'
                                            : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                                        }`}
                                      >
                                        <p>{message.noiDung}</p>
                                      </div>
                                      <span className={`text-[9px] text-gray-400 mt-1 px-1 ${
                                        isMe ? 'text-right' : 'text-left'
                                      }`}>
                                        {formatTime(message.ngayGui)}
                                      </span>
                                    </div>

                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ))}

                      {messages.length === 0 && (
                        <div className="flex flex-col justify-center items-center h-full text-center text-gray-400 space-y-3">
                          <MessageCircle size={48} className="text-gray-300" />
                          <div>
                            <p className="font-bold text-gray-700">Chưa có tin nhắn nào</p>
                            <p className="text-xs">Hãy bắt đầu gửi câu hỏi của bạn cho nhân viên chăm sóc khách hàng.</p>
                          </div>
                        </div>
                      )}
                      
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>

                {/* Input Form Footer */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-100 bg-white">
                  <div className="flex items-center gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Nhập nội dung tin nhắn cần hỗ trợ..."
                      className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                      disabled={isSending}
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim() || isSending}
                      className="w-11 h-11 bg-red-600 text-white rounded-xl flex items-center justify-center hover:bg-red-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition shrink-0"
                    >
                      {isSending ? (
                        <Loader2 className="animate-spin" size={18} />
                      ) : (
                        <Send size={18} />
                      )}
                    </button>
                  </div>
                </form>

              </div>
            ) : (
              /* Unauthenticated Prompt */
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center h-[550px] flex flex-col justify-center items-center space-y-6">
                <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center shadow-inner">
                  <Lock size={28} />
                </div>
                <div className="max-w-md">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Đăng nhập để chat trực tuyến</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Tính năng chat trực tuyến với Admin yêu cầu xác thực tài khoản để chúng tôi có thể tra cứu đơn đặt hàng và thông tin cá nhân của bạn để hỗ trợ chính xác nhất.
                  </p>
                </div>
                <Link
                  to="/login?redirect=/cham-soc-khach-hang"
                  className="px-8 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl font-bold shadow-lg shadow-red-200 hover:shadow-xl hover:from-red-700 hover:to-rose-700 transition transform hover:-translate-y-0.5"
                >
                  Đăng nhập ngay
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default CustomerSupportPage;
