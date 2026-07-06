import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Heart, ShoppingCart, Filter, ChevronDown, Grid, List, Loader2 } from 'lucide-react';
import productApi from '../../api/productApi';
import categoryApi from '../../api/categoryApi';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import Breadcrumb from '../../components/Breadcrumb';
import { removeVietnameseTones } from '../../utils/vietnamese';

const ProductListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isInWishlist, toggleWishlist } = useWishlist(); 

  // State
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const categoryParam = searchParams.get('category');
  const categoriesParam = searchParams.get('categories');
  
  // Xử lý filter category names từ URL
  const filterCategoryNames = useMemo(() => {
    const rawParams = categoryParam 
      ? [categoryParam] 
      : categoriesParam 
      ? categoriesParam.split(',') 
      : [];
    // Chuẩn hóa về chữ thường và xóa khoảng trắng thừa để so sánh chính xác
    return rawParams.map(c => c.trim().toLowerCase());
  }, [categoryParam, categoriesParam]);
  
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const searchQuery = searchParams.get('search') || '';
  const [priceRange, setPriceRange] = useState([0, 5000000]);
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 12;

  // 1. Fetch dữ liệu
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productRes, categoryRes] = await Promise.all([
          productApi.getActive(),
          categoryApi.getActive()
        ]);

        if (productRes.success) {
          setProducts(productRes.data || []);
          setTotalPages(Math.ceil((productRes.data?.length || 0) / itemsPerPage));
        }

        if (categoryRes.success) {
          setCategories(categoryRes.data || []);
        }

      } catch (err) {
        setError('Không thể tải dữ liệu');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Đồng bộ khi tìm kiếm mới từ URL (vd: /shop?search=B → /shop?search=A)
  useEffect(() => {
    if (searchQuery) {
      setSelectedCategoryIds([]);
      setCurrentPage(1);
    }
  }, [searchQuery]);

  // Đồng bộ selectedCategoryIds khi tham số URL thay đổi
  useEffect(() => {
    // Nếu có filter từ URL, bỏ chọn các ID do người dùng trước đó
    setSelectedCategoryIds([]);
    setCurrentPage(1);
  }, [categoryParam, categoriesParam]);

  // 2. Tính toán số lượng
  const categoriesWithCount = useMemo(() => {
    const allCategory = { 
      danhMucId: '',
      tenDanhMuc: 'Tất cả', 
      count: products.length 
    };

    const mappedCategories = categories.map(cat => {
      const count = products.filter(p => p.danhMucId === cat.danhMucId).length;
      return { ...cat, count };
    });

    return [allCategory, ...mappedCategories];
  }, [products, categories]);

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
  };

  // 3. Logic lọc (ĐÃ ĐƯỢC NÂNG CẤP)
  const filteredProducts = products.filter(product => {
    // --- Search ---
    if (searchQuery) {
      const searchNormalized = removeVietnameseTones(searchQuery).toLowerCase();
      const nameNormalized = removeVietnameseTones(product.tenSanPham || '').toLowerCase();
      const descNormalized = removeVietnameseTones(product.moTa || '').toLowerCase();
      
      const nameMatch = nameNormalized.includes(searchNormalized);
      const descMatch = descNormalized.includes(searchNormalized);
      
      // Cố gắng lấy tên danh mục từ object hoặc tìm trong list categories
      const catName = product.danhMuc?.tenDanhMuc || categories.find(c => c.danhMucId === product.danhMucId)?.tenDanhMuc || '';
      const catNormalized = removeVietnameseTones(catName).toLowerCase();
      const catMatch = catNormalized.includes(searchNormalized);
      
      if (!nameMatch && !descMatch && !catMatch) return false;
    }

    // --- Category Filter ---
    // Áp dụng bộ lọc theo ID hoặc theo tên từ URL ngay cả khi đang có search
    if (selectedCategoryIds.length > 0) {
      if (!selectedCategoryIds.includes(product.danhMucId)) return false;
    }

    if (filterCategoryNames.length > 0) {
      const currentCategory = categories.find(c => c.danhMucId === product.danhMucId);
      if (!currentCategory) return false;
      const currentCategoryName = currentCategory.tenDanhMuc.toLowerCase().trim();
      if (!filterCategoryNames.includes(currentCategoryName)) return false;
    }

    // --- Price ---
    if (product.gia < priceRange[0] || product.gia > priceRange[1]) return false;

    return true;
  });

  // Sort
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.gia - b.gia;
      case 'price-high':
        return b.gia - a.gia;
      case 'name':
        return a.tenSanPham.localeCompare(b.tenSanPham);
      case 'newest':
      default:
        return new Date(b.ngayTao || 0) - new Date(a.ngayTao || 0);
    }
  });

  // Pagination slice
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle actions
  const handleCategoryToggle = (categoryId) => {
    if (categoryId === '') {
      setSelectedCategoryIds([]);
    } else {
      setSelectedCategoryIds(prev => {
        if (prev.includes(categoryId)) {
          return prev.filter(id => id !== categoryId);
        } else {
          return [...prev, categoryId];
        }
      });
    }
    setCurrentPage(1);
    // Khi người dùng chọn bộ lọc danh mục, xóa param `search`
    // để hành vi là "lọc thay thế tìm kiếm" (click filter sẽ bỏ tìm kiếm trước đó).
    searchParams.delete('search');
    searchParams.delete('category');
    searchParams.delete('categories');
    setSearchParams(searchParams);
  };

  const clearFilters = () => {
    setSelectedCategoryIds([]);
    setPriceRange([0, 5000000]);
    searchParams.delete('category');
    searchParams.delete('categories');
    searchParams.delete('search');
    setSearchParams({});
    setCurrentPage(1);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <Breadcrumb 
        items={[
          { label: 'Trang chủ', href: '/' },
          { label: 'Cửa hàng' }
        ]} 
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            {filterCategoryNames.length > 0 
              ? 'Kết quả lọc' // Hiển thị chung chung để tránh lỗi hiển thị text
              : selectedCategoryIds.length > 0
              ? selectedCategoryIds.map(id => categories.find(c => c.danhMucId === id)?.tenDanhMuc).filter(Boolean).join(', ') || 'Sản phẩm'
              : 'Tất cả sản phẩm'}
          </h1>
          <p className="text-gray-600">
             Khám phá bộ sưu tập thời trang chất lượng cao
          </p>
        </div>
        
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          {/* Sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="newest">Mới nhất</option>
              <option value="price-low">Giá: Thấp đến Cao</option>
              <option value="price-high">Giá: Cao đến Thấp</option>
              <option value="name">Tên A-Z</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          </div>

          {/* View Mode */}
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-red-600 text-white' : 'bg-white text-gray-600'}`}
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-red-600 text-white' : 'bg-white text-gray-600'}`}
            >
              <List size={18} />
            </button>
          </div>

          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg"
          >
            <Filter size={18} />
            Bộ lọc
          </button>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar Filters */}
        <div className={`w-full md:w-80 ${showFilters ? 'block' : 'hidden md:block'}`}>
          <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">Bộ lọc</h3>
              <button onClick={clearFilters} className="text-red-600 text-sm hover:underline">
                Xóa tất cả
              </button>
            </div>

            {/* Categories */}
            <div className="mb-8">
              <h4 className="font-bold text-gray-800 mb-4 flex items-center">
                <span className="w-2 h-2 bg-red-600 rounded-full mr-2"></span>
                Danh mục
              </h4>
              <div className="space-y-3">
                {categoriesWithCount.map(category => {
                  const isAll = category.danhMucId === '';
                  // Logic checked thông minh hơn: hỗ trợ cả URL và checkbox
                  let isChecked = false;
                  if (isAll) {
                    isChecked = selectedCategoryIds.length === 0 && filterCategoryNames.length === 0;
                  } else {
                     // Check nếu ID có trong list chọn thủ công
                     const manuallySelected = selectedCategoryIds.includes(category.danhMucId);
                     // Check nếu Tên có trong URL (so sánh lowercase)
                     const urlSelected = filterCategoryNames.includes(category.tenDanhMuc?.toLowerCase().trim());
                     isChecked = manuallySelected || (selectedCategoryIds.length === 0 && urlSelected);
                  }
                  
                  return (
                    <label key={category.danhMucId || 'all'} className="flex items-center cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleCategoryToggle(category.danhMucId)}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 rounded border-2 mr-3 flex items-center justify-center
                        ${isChecked
                          ? 'bg-red-600 border-red-600' : 'border-gray-300 group-hover:border-red-400'}`}>
                        {isChecked && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className={`transition flex-1 ${isChecked ? 'text-red-600 font-medium' : 'text-gray-700 group-hover:text-red-600'}`}>
                        {category.tenDanhMuc}
                      </span>
                      <span className="text-gray-400 text-sm">{category.count}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Price Range */}
            <div className="mb-8">
              <h4 className="font-bold text-gray-800 mb-4 flex items-center">
                <span className="w-2 h-2 bg-red-600 rounded-full mr-2"></span>
                Khoảng giá
              </h4>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="5000000"
                    step="100000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="flex-1 accent-red-600"
                  />
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{formatPrice(priceRange[0])}</span>
                  <span>{formatPrice(priceRange[1])}</span>
                </div>
                <div className="bg-red-50 p-3 rounded-lg">
                  <p className="text-sm text-red-700 font-medium">
                    Giá: {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                  </p>
                </div>
              </div>
            </div>

             <button 
              onClick={() => setShowFilters(false)}
              className="w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 transition"
            >
              Lọc sản phẩm
            </button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1">
          {/* Results Info */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600">
              Hiển thị {paginatedProducts.length} trên {sortedProducts.length} kết quả
            </p>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex justify-center items-center py-20">
              <Loader2 size={40} className="animate-spin text-red-600" />
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="text-center py-20">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Products List */}
          {!loading && !error && (
            <>
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {paginatedProducts.map(product => (
                  <div key={product.sanPhamId} className={`bg-white rounded-xl shadow-sm hover:shadow-lg transition overflow-hidden group ${
                    viewMode === 'list' ? 'flex' : ''
                  }`}>
                    <Link 
                      to={`/product/${product.sanPhamId}`} 
                      className={`block relative overflow-hidden bg-gray-100 ${
                        viewMode === 'list' ? 'w-48 h-48' : 'h-80'
                      }`}
                    >
                      <img
                        src={product.hinhAnh || 'https://via.placeholder.com/400x400?text=No+Image'}
                        alt={product.tenSanPham}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        onError={(e) => e.target.src = 'https://via.placeholder.com/400x400?text=No+Image'}
                      />
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          toggleWishlist(product.sanPhamId);
                        }}
                        className={`absolute top-3 right-3 bg-white p-2 rounded-full shadow transition ${
                          isInWishlist(product.sanPhamId) ? 'text-red-600 bg-red-50' : 'hover:bg-red-50 hover:text-red-600'
                        }`}
                      >
                        <Heart size={18} fill={isInWishlist(product.sanPhamId) ? 'currentColor' : 'none'} />
                      </button>
                      
                      {product.giaGoc && product.giaGoc > product.gia && (
                        <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                          -{Math.round((1 - product.gia / product.giaGoc) * 100)}%
                        </span>
                      )}
                    </Link>
                    
                    <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                      <Link to={`/product/${product.sanPhamId}`}>
                        <h3 className="font-bold text-gray-800 text-lg mb-1 hover:text-red-600 transition line-clamp-1">
                          {product.tenSanPham}
                        </h3>
                      </Link>
                      <p className="text-gray-500 text-sm mb-3 line-clamp-1">
                        {product.danhMuc?.tenDanhMuc || categories.find(c => c.danhMucId === product.danhMucId)?.tenDanhMuc || 'Sản phẩm'}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-red-600 font-bold text-xl">{formatPrice(product.gia)}</span>
                          {product.giaGoc && product.giaGoc > product.gia && (
                            <span className="text-gray-400 text-sm line-through ml-2">
                              {formatPrice(product.giaGoc)}
                            </span>
                          )}
                        </div>
                        <Link
                          to={`/product/${product.sanPhamId}`}
                          className="p-2 bg-gray-100 rounded-full hover:bg-red-600 hover:text-white transition"
                          title="Xem chi tiết"
                        >
                          <ShoppingCart size={18} />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-12">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Trước
                  </button>
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 rounded-lg font-medium ${
                          currentPage === page ? 'bg-red-600 text-white' : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Sau
                  </button>
                </div>
              )}

              {paginatedProducts.length === 0 && (
                <div className="text-center py-20">
                  <p className="text-gray-500 text-lg mb-4">Không tìm thấy sản phẩm nào</p>
                  <button onClick={clearFilters} className="text-red-600 hover:underline">
                    Xóa bộ lọc
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductListPage;