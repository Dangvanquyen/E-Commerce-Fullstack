import { createContext, useContext, useState, useEffect } from 'react';
import authApi from '../api/authApi';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Kiểm tra token khi khởi tạo (F5 trang web)
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        console.log('AuthContext - Initializing:', { storedUser: !!storedUser, token: !!token });

        if (storedUser && token) {
            try {
                const parsedUser = JSON.parse(storedUser);
                console.log('AuthContext - Parsed user:', parsedUser);
                setUser(parsedUser);
            } catch (error) {
                console.error('AuthContext - Error parsing stored user:', error);
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            }
        }
        setLoading(false);
    }, []);

    // --- ĐĂNG NHẬP (Đã cập nhật logic thông minh hơn) ---
    const login = async (credentials) => {
        try {
            const response = await authApi.login(credentials);

            // Debug xem backend trả về gì (F12 -> Console)
            console.log("Login Response:", response); 

            if (response.success && response.token) {
                localStorage.setItem('token', response.token);

                // Lấy thông tin user (Ưu tiên lấy trong object nguoiDung, nếu ko có thì lấy ở root)
                const rawUser = response.nguoiDung || response;
                
                // Lấy ID vai trò (Ưu tiên lấy ở root response vì Backend mình vừa gán cứng ở đó)
                // Hoặc lấy trong rawUser
                const roleId = Number(response.vaiTroId || rawUser.vaiTroId || 0);

                // --- LOGIC XÁC ĐỊNH QUYỀN (QUAN TRỌNG) ---
                // 1. Ưu tiên lấy tên trực tiếp (nếu Backend trả về "Admin")
                // 2. Nếu không có tên, check ID (1 là Admin)
                let finalRole = "Customer";

                if (rawUser.vaiTroTen === 'Admin' || rawUser.vaiTroTen === 'Administrator' || roleId === 1) {
                    finalRole = 'Admin';
                }

                console.log("Quyền chốt hạ:", finalRole);

                // Tạo object user chuẩn để lưu
                const userData = {
                    token: response.token,
                    nguoiDungId: rawUser.nguoiDungId || rawUser.id,
                    tenDangNhap: rawUser.tenDangNhap,
                    hoTen: rawUser.hoTen,
                    email: rawUser.email,
                    soDienThoai: rawUser.soDienThoai || '',
                    diaChi: rawUser.diaChi || '',
                    avatar: rawUser.avatar,
                    vaiTro: {
                        tenVaiTro: finalRole
                    }
                };

                localStorage.setItem('user', JSON.stringify(userData));
                setUser(userData);
                return userData;
            }

            throw new Error(response.message || 'Đăng nhập thất bại');
        } catch (error) {
            console.error("Lỗi đăng nhập:", error);
            throw error;
        }
    };

    // Đăng ký
    const register = async (userData) => {
        const response = await authApi.register(userData);
        return response;
    };

    // Đăng xuất
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    // Cập nhật thông tin user
    const updateUser = (newUserData) => {
        const updated = { ...user, ...newUserData };
        localStorage.setItem('user', JSON.stringify(updated));
        setUser(updated);
    };

    // Các biến tiện ích
    const isAuthenticated = !!user && !!localStorage.getItem('token');
    const isAdmin = user?.vaiTro?.tenVaiTro === 'Admin' || user?.vaiTro === 'Admin'; // Support both formats
    const token = localStorage.getItem('token'); // Thêm token

    const value = {
        user,
        token, // Thêm token vào value
        loading,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout,
        updateUser
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;