import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import wishlistApi from '../api/wishlistApi';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error('useWishlist must be used within WishlistProvider');
    }
    return context;
};

export const WishlistProvider = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(false);

    // Lấy danh sách yêu thích
    const fetchWishlist = useCallback(async () => {
        if (!isAuthenticated) {
            setWishlist([]);
            return;
        }

        try {
            setLoading(true);
            const response = await wishlistApi.getMyWishlist();
            if (response.success) {
                setWishlist(response.data || []);
            }
        } catch (error) {
            console.error('Lỗi khi lấy danh sách yêu thích:', error);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        fetchWishlist();
    }, [fetchWishlist]);

    // Kiểm tra sản phẩm có trong wishlist không
    const isInWishlist = (sanPhamId) => {
        return wishlist.some(item => item.sanPhamId === sanPhamId);
    };

    // Toggle yêu thích
    const toggleWishlist = async (sanPhamId) => {
        if (!isAuthenticated) {
            toast.warning('Vui lòng đăng nhập để thêm vào yêu thích!');
            return false;
        }

        try {
            const response = await wishlistApi.toggleWishlist(sanPhamId);
            if (response.success) {
                toast.success(response.message || (response.data ? 'Đã thêm vào yêu thích!' : 'Đã xóa khỏi yêu thích!'));
                await fetchWishlist();
                return response.data; // true = đã thêm, false = đã xóa
            }
        } catch (error) {
            toast.error('Không thể thực hiện!');
            console.error(error);
        }
        return false;
    };

    // Xóa khỏi wishlist
    const removeFromWishlist = async (sanPhamId) => {
        try {
            const response = await wishlistApi.removeFromWishlist(sanPhamId);
            if (response.success) {
                toast.success('Đã xóa khỏi yêu thích!');
                await fetchWishlist();
                return true;
            }
        } catch (error) {
            toast.error('Không thể xóa!');
            console.error(error);
        }
        return false;
    };

    const value = {
        wishlist,
        loading,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        refreshWishlist: fetchWishlist
    };

    return (
        <WishlistContext.Provider value={value}>
            {children}
        </WishlistContext.Provider>
    );
};

export default WishlistContext;
