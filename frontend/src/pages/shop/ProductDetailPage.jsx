import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Heart, Minus, Plus, Truck, RefreshCw, ShieldCheck, Loader2, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'react-toastify';
import productApi from '../../api/productApi';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import Breadcrumb from '../../components/Breadcrumb';
import { useProductTracking } from '../../hooks/useProductTracking';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate(); 
  const { addToCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const { isInWishlist, toggleWishlist } = useWishlist();

  // Tracking hành vi xem sản phẩm
  useProductTracking(id ? parseInt(id) : null, user?.nguoiDungId || null);

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Loading states
  const [addingToCart, setAddingToCart] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);

  // State quản lý lựa chọn của khách
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Reset các lựa chọn khi thay đổi sản phẩm (id thay đổi)
  useEffect(() => {
    setProduct(null);
    setSelectedColor(null);
    setSelectedSize(null);
    setQuantity(1);
    setSelectedImageIndex(0);
  }, [id]);

  const variants = product?.sanPhamChiTiets || [];

  // Get all available images
  const productImages = useMemo(() => {
    const images = [];
    if (product?.hinhAnh) images.push(product.hinhAnh);
    variants.forEach(variant => {
      if (variant.hinhAnh && !images.includes(variant.hinhAnh)) {
        images.push(variant.hinhAnh);
      }
    });
    if (images.length === 0) images.push('https://via.placeholder.com/600');
    return images;
  }, [product?.hinhAnh, variants]);

  // Fetch data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await productApi.getById(id);
        if (response.success && response.data) {
          setProduct(response.data);
          
          // Tải gợi ý mua cùng dựa trên thuật toán Apriori
          try {
            const recommendedResponse = await productApi.getRecommendations(id);
            if (recommendedResponse.success) {
              setRelatedProducts(recommendedResponse.data || []);
            } else {
              // Dự phòng: lấy sản phẩm hoạt động thông thường
              const fallbackResponse = await productApi.getActive();
              if (fallbackResponse.success) {
                const fallback = fallbackResponse.data
                  ?.filter(p => p.sanPhamId !== parseInt(id))
                  ?.slice(0, 4) || [];
                setRelatedProducts(fallback);
              }
            }
          } catch (err) {
            console.error("Lỗi khi tải gợi ý sản phẩm:", err);
            // Dự phòng khi có lỗi
            const fallbackResponse = await productApi.getActive();
            if (fallbackResponse.success) {
              const fallback = fallbackResponse.data
                ?.filter(p => p.sanPhamId !== parseInt(id))
                ?.slice(0, 4) || [];
              setRelatedProducts(fallback);
            }
          }
        } else {
          setError('Không tìm thấy sản phẩm');
        }
      } catch (err) {
        setError('Có lỗi xảy ra khi tải sản phẩm');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price) + ' đ';

  const availableColors = useMemo(() => [...new Set(variants.map(v => v.mauSac).filter(color => color && color.trim() && color !== 'Mặc định'))], [variants]);
  const availableSizes = useMemo(() => [...new Set(variants.map(v => v.size).filter(size => size && size.trim() && size !== 'Mặc định'))], [variants]);

  const selectedVariant = useMemo(() => {
    if (!selectedColor && !selectedSize) return variants[0] || null;
    return variants.find(v =>
      (!selectedColor || v.mauSac === selectedColor) &&
      (!selectedSize || v.size === selectedSize)
    ) || null;
  }, [variants, selectedColor, selectedSize]);

  const currentPrice = selectedVariant?.giaBan || product?.gia || 0;
  const originalPrice = product?.giaGoc || 0;
  const inStock = variants.length === 0 ? true : (selectedVariant?.soLuongTon > 0); // FIX: Products without variants are always in stock

  // Auto-select logic
  useEffect(() => {
    if (availableColors.length > 0 && !selectedColor) setSelectedColor(availableColors[0]);
  }, [availableColors, selectedColor]);

  useEffect(() => {
    if (availableSizes.length > 0 && !selectedSize) setSelectedSize(availableSizes[0]);
  }, [availableSizes, selectedSize]);

  useEffect(() => {
    if (selectedVariant?.hinhAnh) {
      const idx = productImages.findIndex(img => img === selectedVariant.hinhAnh);
      if (idx !== -1) setSelectedImageIndex(idx);
    }
  }, [selectedVariant, productImages]);

  // Handle Add To Cart - FIX: Create real variant for products without variants
  const handleAddToCart = async () => {
    if (!isAuthenticated) return toast.warning('Vui lòng đăng nhập để thêm vào giỏ hàng!');
    
    // FIX: For products without variants, create a real variant first
    let variantToAdd = selectedVariant;
    if (!variantToAdd && variants.length === 0) {
      // Product has no variants, need to create a default variant first
      try {
        const createVariantResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/SanPhamChiTiet`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            sanPhamId: product.sanPhamId,
            mauSac: '',
            size: '',
            giaBan: product.gia,
            soLuongTon: 999
          })
        });
        
        if (createVariantResponse.ok) {
          const variantResult = await createVariantResponse.json();
          if (variantResult.success) {
            variantToAdd = variantResult.data;
          }
        }
      } catch (error) {
        console.error('Error creating default variant:', error);
        toast.error('Không thể tạo biến thể cho sản phẩm');
        return;
      }
    }
    
    if (!variantToAdd) return toast.warning('Vui lòng chọn màu sắc và kích thước!');
    
    console.log('ProductDetail - Adding to cart:', {
      productId: product.sanPhamId,
      productName: product.tenSanPham,
      variantId: variantToAdd.sanPhamChiTietId,
      variant: variantToAdd,
      quantity
    });
    
    const stockCheck = variantToAdd.soLuongTon || 999;
    if (stockCheck <= 0) return toast.error('Sản phẩm đã hết hàng!');

    try {
      setAddingToCart(true);
      const success = await addToCart(variantToAdd.sanPhamChiTietId, quantity);
      if (success) toast.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`);
    } catch (err) {
      toast.error('Không thể thêm vào giỏ hàng');
    } finally {
      setAddingToCart(false);
    }
  };

  // --- LOGIC MUA NGAY (KHÔNG ADD VÀO GIỎ) - FIX: Create real variant for products without variants ---
  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      toast.warning('Vui lòng đăng nhập để mua hàng!');
      navigate('/login');
      return;
    }

    // FIX: For products without variants, create a real variant first
    let variantToBuy = selectedVariant;
    if (!variantToBuy && variants.length === 0) {
      // Product has no variants, need to create a default variant first
      try {
        const createVariantResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/SanPhamChiTiet`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            sanPhamId: product.sanPhamId,
            mauSac: '',
            size: '',
            giaBan: product.gia,
            soLuongTon: 999
          })
        });
        
        if (createVariantResponse.ok) {
          const variantResult = await createVariantResponse.json();
          if (variantResult.success) {
            variantToBuy = variantResult.data;
          }
        }
      } catch (error) {
        console.error('Error creating default variant:', error);
        toast.error('Không thể tạo biến thể cho sản phẩm');
        return;
      }
    }

    if (!variantToBuy) {
      toast.warning('Vui lòng chọn màu sắc và kích thước!');
      return;
    }

    // KIỂM TRA TỒN KHO TRƯỚC KHI CHO PHÉP MUA
    const stockCheck = variantToBuy.soLuongTon || 999;
    if (stockCheck <= 0) {
      toast.error('Sản phẩm đã hết hàng!');
      return;
    }

    // KIỂM TRA SỐ LƯỢNG MUA KHÔNG VƯỢT QUÁ TỒN KHO
    if (quantity > stockCheck) {
      toast.error(`Chỉ còn ${stockCheck} sản phẩm trong kho!`);
      return;
    }

    setBuyingNow(true);

    // Tạo object tạm thời mô phỏng cấu trúc của item trong giỏ hàng
    const tempItem = {
      gioHangChiTietId: 'temp-' + Date.now(),
      sanPhamChiTietId: variantToBuy.sanPhamChiTietId,
      sanPhamId: product.sanPhamId,
      tenSanPham: product.tenSanPham,
      hinhAnh: variantToBuy.hinhAnh || product.hinhAnh,
      soLuong: quantity,
      giaBan: currentPrice,
      mauSac: (variantToBuy.mauSac && variantToBuy.mauSac !== 'Mặc định') ? variantToBuy.mauSac : '',
      size: (variantToBuy.size && variantToBuy.size !== 'Mặc định') ? variantToBuy.size : '',
      sanPhamChiTiet: {
        ...variantToBuy,
        sanPham: product
      }
    };

    setTimeout(() => {
        setBuyingNow(false);
        navigate('/checkout', { state: { buyNowItem: [tempItem] } });
    }, 500);
  };

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 size={40} className="animate-spin text-red-600" /></div>;
  if (error || !product) return <div className="min-h-[60vh] flex flex-col items-center justify-center"><p className="text-red-600 text-xl mb-4">{error || 'Không tìm thấy sản phẩm'}</p><Link to="/" className="flex items-center gap-2 text-red-600 hover:underline"><ArrowLeft size={20} /> Quay về trang chủ</Link></div>;

  return (
    <div className="w-[90%] mx-auto px-4 py-8">
      <Breadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'Sản phẩm', href: '/shop' }, { label: product?.tenSanPham || 'Chi tiết' }]} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Gallery */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden border relative group">
            <button 
              onClick={() => toggleWishlist(product.sanPhamId)} 
              className={`absolute top-4 right-4 p-2 bg-white rounded-full shadow-md transition z-10 ${isInWishlist(product.sanPhamId) ? 'text-red-600 bg-red-50' : 'text-gray-400 hover:text-red-600 hover:bg-red-50'}`}
            >
              <Heart size={24} fill={isInWishlist(product.sanPhamId) ? 'currentColor' : 'none'} />
            </button>
            <img src={productImages[selectedImageIndex] || product?.hinhAnh} alt={product?.tenSanPham} className="w-full h-full object-cover transition-opacity duration-300" onError={(e) => e.target.src = 'https://via.placeholder.com/600'} />
          </div>
          <div className="flex gap-3">
            {productImages.map((image, index) => (
              <button key={index} onClick={() => setSelectedImageIndex(index)} className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition ${selectedImageIndex === index ? 'border-red-500' : 'border-gray-200 hover:border-gray-300'}`}>
                <img src={image} alt={`Product ${index + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product?.tenSanPham}</h1>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex text-yellow-400">
                {[1, 2, 3, 4, 5].map((star) => <Star key={star} size={18} fill={star <= 4 ? "currentColor" : "none"} className={star <= 4 ? "" : "text-gray-300"} />)}
              </div>
              <span className="text-sm text-gray-500">(128 đánh giá)</span>
            </div>

            <div className="mb-6">
              <div className="flex items-end gap-3 mb-2">
                <span className="text-3xl font-bold text-red-600">{formatPrice(currentPrice)}</span>
                {originalPrice > currentPrice && (
                  <>
                    <span className="text-xl text-gray-400 line-through mb-1">{formatPrice(originalPrice)}</span>
                    <span className="text-sm text-red-600 bg-red-100 px-2 py-1 rounded-full mb-2">-{Math.round((1 - currentPrice / originalPrice) * 100)}%</span>
                  </>
                )}
              </div>
              {selectedVariant && (
                <>
                  {selectedVariant.soLuongTon <= 0 && <div className="text-sm font-medium text-red-600">Hết hàng</div>}
                  {selectedVariant.soLuongTon > 0 && selectedVariant.soLuongTon <= 100 && <div className="text-sm font-medium text-green-600">Chỉ còn lại {selectedVariant.soLuongTon} sản phẩm</div>}
                </>
              )}
            </div>
          </div>

          {/* Color & Size */}
          {availableColors.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3"><span className="font-medium text-gray-800">MÀU SẮC: <span className="text-gray-600">{selectedColor || 'Chọn màu'}</span></span></div>
              <div className="flex gap-3 flex-wrap">
                {availableColors.map((color) => (
                  <button key={color} onClick={() => setSelectedColor(color)} className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition ${selectedColor === color ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-300 hover:border-gray-400'}`}>
                    <div className="w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: color === 'Đen' ? '#000' : color === 'Trắng' ? '#fff' : color === 'Xám' ? '#6B7280' : color === 'Đỏ' ? '#EF4444' : color === 'Xanh' ? '#3B82F6' : '#EC4899' }} />
                    <span className="text-sm font-medium">{color}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {availableSizes.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3"><span className="font-medium text-gray-800">KÍCH THƯỚC: <span className="text-gray-600">{selectedSize || 'Chọn size'}</span></span></div>
              <div className="flex gap-3 flex-wrap">
                {availableSizes.map((size) => {
                  const isAvailable = variants.some(v => v.size === size && (!selectedColor || v.mauSac === selectedColor) && v.soLuongTon > 0);
                  return (
                    <button key={size} onClick={() => isAvailable && setSelectedSize(size)} disabled={!isAvailable} className={`h-12 min-w-[80px] px-4 rounded-lg border font-medium transition flex items-center justify-center ${selectedSize === size ? 'bg-black text-white border-black' : isAvailable ? 'bg-white text-gray-600 border-gray-200 hover:border-black' : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'}`}>
                      {size} {!isAvailable && <span className="block text-xs ml-1">(Hết)</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <div className="w-[30%] flex items-center justify-between border border-gray-300 rounded-lg">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 hover:bg-gray-100 transition h-full flex items-center justify-center w-10"><Minus size={18} /></button>
              <span className="font-bold text-center">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="p-3 hover:bg-gray-100 transition h-full flex items-center justify-center w-10"><Plus size={18} /></button>
            </div>
            <button onClick={handleAddToCart} disabled={addingToCart || buyingNow || (!selectedVariant && variants.length > 0) || !inStock} className={`w-[70%] py-3 font-bold rounded-lg flex items-center justify-center gap-2 transition ${addingToCart || buyingNow || (!selectedVariant && variants.length > 0) || !inStock ? 'bg-gray-400 cursor-not-allowed text-white' : 'bg-red-600 hover:bg-red-700 text-white'}`}>
              {addingToCart ? <Loader2 size={20} className="animate-spin" /> : <ShoppingCart size={20} />} Thêm Vào Giỏ Hàng
            </button>
          </div>

          <button onClick={handleBuyNow} disabled={addingToCart || buyingNow || (!selectedVariant && variants.length > 0) || !inStock} className={`w-full py-3 font-bold rounded-lg transition flex items-center justify-center gap-2 ${addingToCart || buyingNow || (!selectedVariant && variants.length > 0) || !inStock ? 'bg-gray-400 cursor-not-allowed text-white' : 'bg-black text-white hover:bg-gray-800'}`}>
            {buyingNow ? <><Loader2 size={20} className="animate-spin" /><span>Đang xử lý...</span></> : 'Mua Ngay'}
          </button>

          <div className="border-t pt-6">
            <h3 className="font-bold text-gray-800 mb-3">MÔ TẢ SẢN PHẨM</h3>
            <p className="text-gray-600 leading-relaxed">{product?.moTa || 'Sản phẩm chất lượng cao...'}</p>
          </div>

          <div className="border-t pt-6">
            <h3 className="font-bold text-gray-800 mb-3">THÔNG TIN VẬN CHUYỂN</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-center gap-3"><Truck size={18} className="text-red-500" /><span>Miễn phí vận chuyển cho đơn trên 500,000đ</span></div>
              <div className="flex items-center gap-3"><RefreshCw size={18} className="text-red-500" /><span>Đổi trả trong vòng 7 ngày</span></div>
              <div className="flex items-center gap-3"><ShieldCheck size={18} className="text-red-500" /><span>Cam kết hàng chính hãng 100%</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="mt-20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold">Sản Phẩm Thường Được Mua Cùng</h2>
              <p className="text-sm text-gray-500 mt-1">Gợi ý thông minh dựa trên lịch sử mua sắm</p>
            </div>
            <div className="flex gap-2">
              <button className="p-2 border border-gray-300 rounded-full hover:bg-gray-50"><ChevronLeft size={20} /></button>
              <button className="p-2 border border-gray-300 rounded-full hover:bg-gray-50"><ChevronRight size={20} /></button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <div key={relatedProduct.sanPhamId} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition overflow-hidden group">
                <Link to={`/product/${relatedProduct.sanPhamId}`} className="block relative h-64 overflow-hidden bg-gray-100">
                  <img src={relatedProduct.hinhAnh || 'https://via.placeholder.com/400x400'} alt={relatedProduct.tenSanPham} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" onError={(e) => e.target.src = 'https://via.placeholder.com/400x400'} />
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      toggleWishlist(relatedProduct.sanPhamId);
                    }}
                    className={`absolute top-3 right-3 bg-white p-2 rounded-full shadow transition ${isInWishlist(relatedProduct.sanPhamId) ? 'text-red-600 bg-red-50' : 'hover:bg-red-50 hover:text-red-600'}`}
                  >
                    <Heart size={16} fill={isInWishlist(relatedProduct.sanPhamId) ? 'currentColor' : 'none'} />
                  </button>
                </Link>
                <div className="p-4">
                  <Link to={`/product/${relatedProduct.sanPhamId}`}><h3 className="font-bold text-gray-800 mb-1 hover:text-red-600 transition line-clamp-1">{relatedProduct.tenSanPham}</h3></Link>
                  <p className="text-gray-500 text-sm mb-2 line-clamp-1">{relatedProduct.danhMucTen || 'Thời trang'}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-red-600 font-bold">{formatPrice(relatedProduct.gia)}</span>
                    <Link to={`/product/${relatedProduct.sanPhamId}`} className="p-2 bg-gray-100 rounded-full hover:bg-red-600 hover:text-white transition" title="Xem chi tiết"><ShoppingCart size={16} /></Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;