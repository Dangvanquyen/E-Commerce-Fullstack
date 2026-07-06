import { useState, useRef, useEffect } from 'react';
import aiChatApi from '../api/aiChatApi';
import { useAuth } from '../context/AuthContext';

// Các gợi ý câu hỏi nhanh
const QUICK_REPLIES = [
  '👗 Tư vấn chọn size',
  '🔄 Chính sách đổi trả',
  '🚚 Phí vận chuyển',
  '💳 Phương thức thanh toán',
  '👔 Phối đồ nam',
  '👠 Phối đồ nữ',
];

const BOT_AVATAR = '🤖';

const AiChatPopup = () => {
  const { isAdmin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'model',
      content: 'Xin chào! 👋 Tôi là trợ lý AI của **ClothingStore**. Tôi có thể giúp bạn:\n- Tư vấn chọn size & phối đồ\n- Giải đáp chính sách đổi trả\n- Hướng dẫn thanh toán & giao hàng\n\nBạn cần hỗ trợ gì hôm nay? 😊',
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Không hiển thị cho admin (sau khi đã khai báo tất cả hooks)
  if (isAdmin) return null;

  // Convert messages to history format for API
  const buildHistory = () => {
    return messages
      .filter(m => m.id !== 'welcome' && m.role !== 'error')
      .map(m => ({ role: m.role, content: m.content }));
  };

  const handleSend = async (text) => {
    const trimmed = (text || inputText).trim();
    if (!trimmed || isTyping) return;

    setInputText('');
    setShowQuickReplies(false);

    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const history = buildHistory();
      const response = await aiChatApi.sendMessage(trimmed, history);

      const botMsg = {
        id: Date.now() + 1,
        role: 'model',
        content: response.reply || response.Reply || 'Xin lỗi, tôi không thể trả lời lúc này.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      const errMsg = {
        id: Date.now() + 1,
        role: 'error',
        content: 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại! 🙏',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickReply = (text) => {
    handleSend(text);
  };

  const formatContent = (content) => {
    // Render markdown bold **text**
    return content
      .split('\n')
      .map((line, i) => {
        const parts = line.split(/\*\*(.*?)\*\*/g);
        return (
          <span key={i}>
            {parts.map((part, j) =>
              j % 2 === 1 ? <strong key={j}>{part}</strong> : part
            )}
            {i < content.split('\n').length - 1 && <br />}
          </span>
        );
      });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 50 }}>
      {/* AI Chat Button */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        title="Chat với AI"
        style={{
          position: 'relative',
          width: '58px',
          height: '58px',
          borderRadius: '50%',
          cursor: 'pointer',
          background: 'linear-gradient(135deg, #111827 0%, #030712 100%)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.4rem',
          transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'scale(1.1) translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.45)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'scale(1) translateY(0)';
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)';
        }}
      >
        {isOpen ? <span style={{ color: 'white', fontWeight: 'bold' }}>✕</span> : <span style={{ textShadow: '0 0 8px rgba(255,255,255,0.5)' }}>✨</span>}
        {/* Pulse animation */}
        {!isOpen && (
          <span style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #111827, #030712)',
            animation: 'aiPulse 2.5s ease-out infinite',
            opacity: 0.4,
            pointerEvents: 'none',
          }} />
        )}
      </button>

      {/* Tooltip */}
      {!isOpen && (
        <div style={{
          position: 'absolute',
          bottom: '4.8rem',
          right: 0,
          background: 'linear-gradient(135deg, #111827, #030712)',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '24px',
          fontSize: '0.72rem',
          fontWeight: 'bold',
          letterSpacing: '0.05em',
          whiteSpace: 'nowrap',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          pointerEvents: 'none',
          animation: 'fadeInUp 0.3s ease',
          border: '1px solid rgba(255,255,255,0.08)',
        }}>
          TƯ VẤN AI TRỰC TUYẾN 🤖
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          bottom: '5rem',
          right: 0,
          width: '370px',
          height: '540px',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 24px 64px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.04)',
          display: 'flex',
          flexDirection: 'column',
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        }}>

          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #111827 0%, #030712 100%)',
            padding: '16px 20px',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexShrink: 0,
            borderBottom: '1px solid rgba(255,255,255,0.05)',
          }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              border: '1px solid rgba(255,255,255,0.15)',
            }}>
              🤖
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: '0.9rem', letterSpacing: '0.02em' }}>AI FASHION ASSISTANT</div>
              <div style={{ fontSize: '0.7rem', opacity: 0.8, display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{
                  width: 6, height: 6,
                  borderRadius: '50%',
                  background: '#10b981',
                  display: 'inline-block',
                  boxShadow: '0 0 6px #10b981',
                }} />
                Hoạt động 24/7 • Gemini AI
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: 'white',
                width: 28, height: 28,
                borderRadius: '50%',
                cursor: 'pointer',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            background: 'linear-gradient(180deg, rgba(249,250,251,0.5) 0%, rgba(255,255,255,0.5) 100%)',
          }}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                  alignItems: 'flex-end',
                  gap: '8px',
                  animation: 'fadeIn 0.3s ease-out',
                }}
              >
                {/* Avatar (chỉ hiện cho bot) */}
                {msg.role !== 'user' && (
                  <div style={{
                    width: 30, height: 30,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #111827, #1f2937)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    flexShrink: 0,
                    border: '1px solid rgba(0,0,0,0.05)',
                  }}>
                    {BOT_AVATAR}
                  </div>
                )}

                <div style={{
                  maxWidth: '75%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                }}>
                  <div style={{
                    padding: '11px 15px',
                    borderRadius: msg.role === 'user'
                      ? '16px 16px 4px 16px'
                      : '16px 16px 16px 4px',
                    background: msg.role === 'user'
                      ? 'linear-gradient(135deg, #111827, #1f2937)'
                      : msg.role === 'error'
                        ? '#fee2e2'
                        : 'white',
                    color: msg.role === 'user'
                      ? 'white'
                      : msg.role === 'error'
                        ? '#dc2626'
                        : '#374151',
                    boxShadow: msg.role === 'user'
                      ? '0 4px 12px rgba(0,0,0,0.1)'
                      : '0 2px 8px rgba(0,0,0,0.04)',
                    fontSize: '0.85rem',
                    lineHeight: 1.5,
                    border: msg.role === 'model' ? '1px solid rgba(0,0,0,0.05)' : 'none',
                    fontWeight: 500,
                  }}>
                    {formatContent(msg.content)}
                  </div>
                  <span style={{
                    fontSize: '0.65rem',
                    color: '#9ca3af',
                    marginTop: 4,
                    paddingLeft: msg.role !== 'user' ? 4 : 0,
                    paddingRight: msg.role === 'user' ? 4 : 0,
                  }}>
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, animation: 'fadeIn 0.3s ease' }}>
                <div style={{
                  width: 30, height: 30,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #111827, #1f2937)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.8rem', flexShrink: 0,
                }}>
                  {BOT_AVATAR}
                </div>
                <div style={{
                  background: 'white',
                  border: '1px solid rgba(0,0,0,0.05)',
                  borderRadius: '16px 16px 16px 4px',
                  padding: '12px 16px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  display: 'flex', gap: 5, alignItems: 'center',
                }}>
                  {[0, 1, 2].map(i => (
                    <span key={i} style={{
                      width: 6, height: 6,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #1f2937, #111827)',
                      display: 'inline-block',
                      animation: `typingDot 1.2s ${i * 0.2}s ease-in-out infinite`,
                    }} />
                  ))}
                </div>
              </div>
            )}

            {/* Quick replies */}
            {showQuickReplies && !isTyping && (
              <div style={{ marginTop: 4 }}>
                <p style={{ fontSize: '0.7rem', color: '#9ca3af', fontWeight: 'bold', letterSpacing: '0.05em', marginBottom: 8, paddingLeft: 38 }}>
                  GỢI Ý CÂU HỎI:
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, paddingLeft: 38 }}>
                  {QUICK_REPLIES.map((reply) => (
                    <button
                      key={reply}
                      onClick={() => handleQuickReply(reply.replace(/^[\p{Emoji}\s]+/u, '').trim())}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 20,
                        border: '1.5px solid rgba(17, 24, 39, 0.15)',
                        background: 'white',
                        color: '#1f2937',
                        fontSize: '0.74rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        fontWeight: 600,
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #111827, #030712)';
                        e.currentTarget.style.color = 'white';
                        e.currentTarget.style.borderColor = 'transparent';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'white';
                        e.currentTarget.style.color = '#1f2937';
                        e.currentTarget.style.borderColor = 'rgba(17, 24, 39, 0.15)';
                      }}
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div style={{
            padding: '14px 20px',
            borderTop: '1px solid rgba(0,0,0,0.05)',
            background: 'white',
            flexShrink: 0,
          }}>
            <div style={{
              display: 'flex',
              gap: 8,
              alignItems: 'center',
              background: '#f9fafb',
              borderRadius: 24,
              padding: '6px 6px 6px 14px',
              border: '1.5px solid rgba(17, 24, 39, 0.08)',
              transition: 'border-color 0.2s',
            }}>
              <textarea
                ref={inputRef}
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nhập câu hỏi của bạn..."
                rows={1}
                disabled={isTyping}
                style={{
                  flex: 1,
                  border: 'none',
                  background: 'transparent',
                  resize: 'none',
                  outline: 'none',
                  fontSize: '0.85rem',
                  color: '#1f2937',
                  lineHeight: 1.5,
                  maxHeight: 80,
                  overflowY: 'auto',
                  fontFamily: 'inherit',
                  fontWeight: 500,
                }}
              />
              <button
                onClick={() => handleSend()}
                disabled={!inputText.trim() || isTyping}
                style={{
                  width: 36, height: 36,
                  borderRadius: '50%',
                  border: 'none',
                  cursor: inputText.trim() && !isTyping ? 'pointer' : 'not-allowed',
                  background: inputText.trim() && !isTyping
                    ? 'linear-gradient(135deg, #111827, #030712)'
                    : '#f3f4f6',
                  color: inputText.trim() && !isTyping ? 'white' : '#9ca3af',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.2s',
                  boxShadow: inputText.trim() && !isTyping
                    ? '0 4px 12px rgba(0,0,0,0.15)'
                    : 'none',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
              </button>
            </div>
            <p style={{
              fontSize: '0.64rem',
              color: '#d1d5db',
              textAlign: 'center',
              marginTop: 6,
            }}>
              Powered by Gemini AI • Nhấn Enter để gửi
            </p>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes aiPulse {
          0% { transform: scale(1); opacity: 0.4; }
          70% { transform: scale(1.6); opacity: 0; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes typingDot {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default AiChatPopup;
