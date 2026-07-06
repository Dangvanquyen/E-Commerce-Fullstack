import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import cartApi from '../api/cartApi';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(false);

    // Lấy giỏ hàng khi đăng nhập
    const fetchCart = useCallback(async () => {
        if (!isAuthenticated) {
            setCart(null);
            return;
        }

        try {
            setLoading(true);
            const response = await cartApi.getMyCart();
            if (response.success) {
                setCart(response.data);
            }
        } catch (error) {
            console.error('Lỗi khi lấy giỏ hàng:', error);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    // Thêm sản phẩm vào giỏ
    const addToCart = async (sanPhamChiTietId, soLuong = 1) => {
        if (!isAuthenticated) {
            toast.warning('Vui lòng đăng nhập để thêm vào giỏ hàng!');
            return false;
        }

        try {
            const response = await cartApi.addToCart(sanPhamChiTietId, soLuong);
            if (response.success) {
                // Removed toast notification as requested
                await fetchCart(); // Refresh giỏ hàng
                return true;
            }
        } catch (error) {
            toast.error('Không thể thêm vào giỏ hàng!');
            console.error(error);
        }
        return false;
    };

    // Cập nhật số lượng
    const updateQuantity = async (id, soLuong) => {
        try {
            const response = await cartApi.updateQuantity(id, soLuong);
            if (response.success) {
                await fetchCart();
                return true;
            }
        } catch (error) {
            toast.error('Không thể cập nhật số lượng!');
            console.error(error);
        }
        return false;
    };

    // Xóa sản phẩm khỏi giỏ
    const removeFromCart = async (id) => {
        try {
            const response = await cartApi.removeFromCart(id);
            if (response.success) {
                toast.success('Đã xóa khỏi giỏ hàng!');
                await fetchCart();
                return true;
            }
        } catch (error) {
            toast.error('Không thể xóa sản phẩm!');
            console.error(error);
        }
        return false;
    };

    // Xóa toàn bộ giỏ hàng
    const clearCart = async () => {
        try {
            const response = await cartApi.clearCart();
            if (response.success) {
                setCart(null);
                toast.success('Đã xóa toàn bộ giỏ hàng!');
                return true;
            }
        } catch (error) {
            toast.error('Không thể xóa giỏ hàng!');
            console.error(error);
        }
        return false;
    };

    // Tính tổng số lượng sản phẩm
    const totalItems = cart?.chiTiets?.reduce((sum, item) => sum + item.soLuong, 0) || 0;

    // Tính tổng tiền
    const totalAmount = cart?.chiTiets?.reduce((sum, item) => {
        const price = item.sanPhamChiTiet?.giaBan || 0;
        return sum + (price * item.soLuong);
    }, 0) || 0;

    const value = {
        cart,
        loading,
        totalItems,
        totalAmount,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart: fetchCart
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

export default CartContext;
