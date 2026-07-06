import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart, Loader2, ShoppingCart, Sparkles, ChevronLeft, ChevronRight, ShieldCheck, Truck, RotateCcw, Headset } from 'lucide-react';
import { toast } from 'react-toastify';
import productApi from '../../api/productApi';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

const HERO_SLIDES = [
  {
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop",
    tag: "BỘ SƯU TẬP MỚI",
    title: "Khẳng định\nChất riêng của bạn",
    subtitle: "Khám phá những xu hướng thời thượng và phá cách nhất mùa này.",
    ctaText: "Mua ngay",
    link: "/shop"
  },
  {
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop",
    tag: "TỐI GIẢN & TINH TẾ",
    title: "Vẻ đẹp thuần khiết\nTrong từng sợi vải",
    subtitle: "Sự hòa quyện hoàn hảo giữa chất liệu tự nhiên và đường may sắc sảo.",
    ctaText: "Khám phá bộ sưu tập",
    link: "/shop?sort=newest"
  },
  {
    image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2070&auto=format&fit=crop",
    tag: "PHỤ KIỆN ĐỘC ĐÁO",
    title: "Điểm nhấn\nCho phong cách thượng lưu",
    subtitle: "Nâng tầm bộ trang phục thường ngày bằng những chi tiết đắt giá.",
    ctaText: "Xem phụ kiện",
    link: "/shop?categories=Phụ kiện"
  }
];

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  // Slide state
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-play slide
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await productApi.getActive();
        if (response.success) {
          setProducts(response.data || []);
        }
      } catch (err) {
        setError('Không thể tải danh sách sản phẩm');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
  };

  const handleAddToCart = async (product) => {
    try {
      const productDetail = await productApi.getById(product.sanPhamId);
      if (productDetail.success && productDetail.data) {
        const variants = productDetail.data.sanPhamChiTiets || [];
        
        if (variants.length === 0) {
          toast.warning('Vui lòng vào trang chi tiết sản phẩm để thêm vào giỏ hàng!');
          return;
        }
        
        const availableVariant = variants.find(v => v.soLuongTon > 0);
        if (!availableVariant) {
          toast.error('Sản phẩm đã hết hàng!');
          return;
        }
        
        const success = await addToCart(availableVariant.sanPhamChiTietId, 1);
        if (success) {
          toast.success(`Đã thêm ${product.tenSanPham} vào giỏ hàng!`);
        }
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Không thể thêm vào giỏ hàng. Vui lòng thử lại!');
    }
  };

  const getProductImage = (product) => {
    if (product.hinhAnh && product.hinhAnh.startsWith('http')) {
      return product.hinhAnh;
    }
    return `/images/products/${product.sanPhamId}.jpg`;
  };

  const categories = [
    {
      id: 1,
      title: "Thời Trang Nam",
      image: "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=1976&auto=format&fit=crop",
      link: "/shop?categories=Quần nam,Áo nam" 
    },
    {
      id: 2,
      title: "Thời Trang Nữ",
      image: "https://images.unsplash.com/photo-1525845859779-54d477ff291f?q=80&w=1974&auto=format&fit=crop",
      link: "/shop?categories=Quần nữ,Áo nữ"
    },
    {
      id: 3,
      title: "Phụ Kiện",
      image: "https://images.unsplash.com/photo-1511556820780-d912e42b4980?q=80&w=1974&auto=format&fit=crop",
      link: "/shop?categories=Phụ kiện"
    }
  ];

  return (
    <div>
      {/* HERO BANNER CAROUSEL */}
      <section className="relative h-[650px] overflow-hidden bg-black">
        {HERO_SLIDES.map((slide, idx) => (
          <div 
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            {/* Slide Background Image */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent z-10" />
            <img
              src={slide.image}
              alt={slide.tag}
              className={`w-full h-full object-cover object-center brightness-90 ${
                idx === currentSlide ? 'animate-soft-zoom' : ''
              }`}
            />
            {/* Slide Info */}
            <div className="container mx-auto px-4 h-full flex items-center relative z-20">
              <div className="max-w-2xl text-white space-y-6">
                <span className="text-red-500 font-bold text-xs tracking-[0.25em] uppercase block animate-fade-in-up">
                  {slide.tag}
                </span>
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-tight whitespace-pre-line animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                  {slide.title}
                </h1>
                <p className="text-sm md:text-base text-gray-200/90 leading-relaxed max-w-md animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                  {slide.subtitle}
                </p>
                <div className="pt-4 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
                  <Link 
                    to={slide.link} 
                    className="bg-red-600 hover:bg-red-700 text-white px-8 py-3.5 rounded-xl font-bold transition-all duration-300 inline-flex items-center gap-2 shadow-lg shadow-red-600/20 shine-effect"
                  >
                    {slide.ctaText} <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Carousel controls */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {HERO_SLIDES.map((_, idx) => (
            <button 
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                idx === currentSlide ? 'w-8 bg-red-600' : 'w-2.5 bg-white/40'
              }`}
            />
          ))}
        </div>
      </section>

      {/* CATEGORIES SECTION */}
      <section className="py-16 md:py-24 bg-white">
        <div className="w-[90%] mx-auto px-4"> 
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categories.map((cat) => (
              <Link 
                to={cat.link} 
                key={cat.id} 
                className="group relative h-[380px] md:h-[480px] overflow-hidden rounded-2xl shadow-md cursor-pointer block"
              >
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent transition-colors duration-300"></div>
                <div className="absolute inset-x-6 bottom-8 flex flex-col items-center text-center text-white">
                  <h3 className="text-2xl font-extrabold tracking-tight mb-3 uppercase">{cat.title}</h3>
                  <span className="opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 bg-white text-black px-6 py-2.5 rounded-full font-bold text-xs shadow-xl flex items-center gap-1.5 shine-effect">
                    Xem ngay <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US SECTION */}
      <section className="py-12 bg-gray-50 border-y border-gray-100/50">
        <div className="w-[90%] mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl border border-gray-100/60 shadow-sm hover:shadow-md transition-all duration-300 group">
              <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-red-600 group-hover:text-white transition-all duration-300">
                <ShieldCheck size={24} />
              </div>
              <h4 className="font-bold text-gray-800 text-sm mb-1 tracking-wide uppercase">Chất Lượng Vàng</h4>
              <p className="text-gray-500 text-xs leading-relaxed">Tuyển chọn chất vải tinh tế, đường may xuất sắc hàng đầu.</p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl border border-gray-100/60 shadow-sm hover:shadow-md transition-all duration-300 group">
              <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-red-600 group-hover:text-white transition-all duration-300">
                <Truck size={24} />
              </div>
              <h4 className="font-bold text-gray-800 text-sm mb-1 tracking-wide uppercase">Giao Hàng Nhanh</h4>
              <p className="text-gray-500 text-xs leading-relaxed">Hỗ trợ giao hàng hỏa tốc trong ngày, miễn phí cho đơn lớn.</p>
            </div>

            <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl border border-gray-100/60 shadow-sm hover:shadow-md transition-all duration-300 group">
              <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-red-600 group-hover:text-white transition-all duration-300">
                <RotateCcw size={24} />
              </div>
              <h4 className="font-bold text-gray-800 text-sm mb-1 tracking-wide uppercase">7 Ngày Đổi Trả</h4>
              <p className="text-gray-500 text-xs leading-relaxed">Mua sắm an tâm với chính sách đổi trả nhanh gọn, linh hoạt.</p>
            </div>

            <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl border border-gray-100/60 shadow-sm hover:shadow-md transition-all duration-300 group">
              <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-red-600 group-hover:text-white transition-all duration-300">
                <Headset size={24} />
              </div>
              <h4 className="font-bold text-gray-800 text-sm mb-1 tracking-wide uppercase">Hỗ Trợ Tận Tâm</h4>
              <p className="text-gray-500 text-xs leading-relaxed">Đội ngũ AI & tư vấn viên trực chat hỗ trợ khách hàng 24/7.</p>
            </div>
          </div>
        </div>
      </section>

      {/* TRENDING PRODUCTS GRID */}
      <section className="py-16 md:py-24 bg-white">
        <div className="w-[90%] mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={16} className="text-red-500 animate-pulse" />
                <span className="text-xs font-bold text-red-500 tracking-[0.2em] uppercase">Xu Hướng Nổi Bật</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">Sản Phẩm Đang Thịnh Hành</h2>
            </div>
            <Link to="/shop" className="text-gray-900 font-bold hover:text-red-600 transition-colors duration-300 text-sm uppercase tracking-wider flex items-center gap-1.5 mt-4 md:mt-0 premium-underline pb-1 self-start">
              Xem tất cả sản phẩm <ArrowRight size={14} />
            </Link>
          </div>

          {loading && (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-red-600 w-10 h-10" /></div>
          )}

          {!loading && !error && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-10">
              {products.slice(0, 8).map((product) => (
                <div key={product.sanPhamId} className="bg-white rounded-2xl border border-gray-50 overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full">
                  
                  {/* Card Thumbnail */}
                  <div className="relative h-[340px] overflow-hidden bg-gray-50">
                    <Link to={`/product/${product.sanPhamId}`} className="block h-full w-full">
                      <img
                        src={getProductImage(product)}
                        alt={product.tenSanPham}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/images/no-image.png'; 
                        }}
                      />
                    </Link>


                    {/* Wishlist Button Overlay */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        toggleWishlist(product.sanPhamId);
                      }}
                      className={`absolute top-4 right-4 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:scale-110 hover:bg-white transition-all z-10 ${
                        isInWishlist(product.sanPhamId) ? 'text-red-600' : 'text-gray-400 hover:text-red-600'
                      }`}
                    >
                      <Heart size={16} fill={isInWishlist(product.sanPhamId) ? 'currentColor' : 'none'} />
                    </button>

                    {/* Hover quick add to cart block */}
                    <div className="absolute inset-x-4 bottom-4 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-10">
                      <button 
                        onClick={() => handleAddToCart(product)}
                        className="w-full bg-white/95 backdrop-blur-sm text-gray-900 hover:bg-red-600 hover:text-white text-xs font-bold py-3.5 px-4 rounded-xl shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        <ShoppingCart size={14} /> THÊM NHANH VÀO GIỎ
                      </button>
                    </div>
                  </div>
                  
                  {/* Card Info */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div className="space-y-1">
                      <Link to={`/product/${product.sanPhamId}`}>
                        <h3 className="font-bold text-gray-900 text-base hover:text-red-600 transition-colors duration-200 line-clamp-1">
                          {product.tenSanPham}
                        </h3>
                      </Link>
                      <p className="text-gray-400 text-xs truncate uppercase tracking-widest font-semibold">Clothing Brand</p>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                      <span className="text-red-600 font-extrabold text-base md:text-lg">{formatPrice(product.gia)}</span>
                      {product.giaGoc && product.giaGoc > product.gia && (
                        <span className="text-xs text-gray-400 line-through">
                          {formatPrice(product.giaGoc)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* LOOKBOOK IMAGE FEED GRID */}
      <section className="py-16 md:py-24 bg-white border-t border-gray-50">
        <div className="w-[90%] mx-auto px-4 text-center">
          <span className="text-xs font-bold text-red-500 tracking-[0.2em] uppercase block mb-2">#FashionStyle</span>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-3">Instagram Lookbook</h2>
          <p className="text-gray-500 text-sm mb-12 max-w-md mx-auto">Trình diễn phong cách thời trang ấn tượng từ những khách hàng yêu mến của cửa hàng.</p>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {[
              "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000",
              "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?q=80&w=1000",
              "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1000",
              "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1000",
              "https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1000",
              "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1000"
            ].map((img, i) => (
              <div key={i} className="group relative h-64 overflow-hidden rounded-2xl bg-gray-100 cursor-pointer shadow-sm">
                <img src={img} alt="Lookbook" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <span className="text-white text-xs font-bold tracking-widest border border-white/40 px-5 py-2.5 rounded-full backdrop-blur-sm hover:bg-white hover:text-black transition-all">XEM BỘ SƯU TẬP</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EXCLUSIVE MEMBERSHIP BANNER */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-red-500/5 to-pink-500/5 border-t border-gray-100">
        <div className="max-w-3xl mx-auto text-center px-4">
          <span className="text-xs font-bold text-red-500 tracking-[0.2em] uppercase block mb-3">Ưu Đãi Đặc Quyền</span>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-4">Gia Nhập Câu Lạc Bộ Thành Viên</h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-lg mx-auto">Đăng ký email của bạn ngay hôm nay để nhận thông tin về bộ sưu tập mới, đợt giảm giá riêng tư và mã giảm giá 10% cho đơn đầu.</p>
          <form onSubmit={(e) => { e.preventDefault(); alert("Đăng ký nhận ưu đãi thành công!"); }} className="flex flex-col sm:flex-row gap-3 justify-center">
            <input 
              type="email" 
              placeholder="Nhập địa chỉ email của bạn..." 
              required
              className="px-5 py-3.5 border border-gray-100 bg-white text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600/25 focus:border-red-600 transition-all duration-300 sm:w-80 shadow-sm"
            />
            <button type="submit" className="bg-gray-900 hover:bg-red-600 text-white font-bold text-xs tracking-wider px-8 py-3.5 rounded-xl transition-all duration-300 shine-effect shadow-md shadow-gray-900/10">
              ĐĂNG KÝ NGAY
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default HomePage;