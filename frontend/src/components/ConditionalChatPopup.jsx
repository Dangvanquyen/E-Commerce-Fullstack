import { useAuth } from '../context/AuthContext';
import ChatPopup from './ChatPopup';

// Component wrapper - chỉ render ChatPopup khi cần thiết
const ConditionalChatPopup = () => {
  const { user, isAdmin } = useAuth();
  
  // Chỉ hiển thị chat cho user thường (không phải admin) và đã đăng nhập
  if (!user || isAdmin) {
    return null;
  }
  
  return <ChatPopup />;
};

export default ConditionalChatPopup;
