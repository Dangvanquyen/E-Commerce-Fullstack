import { useEffect, useRef } from 'react';
import axiosClient from '../api/axiosClient';

/**
 * Lấy hoặc tạo sessionId duy nhất cho phiên duyệt
 */
function getOrCreateSessionId() {
  const key = 'tracking_session_id';
  let sid = sessionStorage.getItem(key);
  if (!sid) {
    sid = 'sess_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem(key, sid);
  }
  return sid;
}

/**
 * Hook tracking hành vi xem sản phẩm.
 * Ghi nhận click khi mount, cập nhật thời gian xem khi unmount.
 *
 * @param {number|null} sanPhamId - ID sản phẩm đang xem
 * @param {number|null} nguoiDungId - ID người dùng (nếu đã đăng nhập)
 */
export function useProductTracking(sanPhamId, nguoiDungId = null) {
  const lichSuIdRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    if (!sanPhamId) return;

    const sessionId = getOrCreateSessionId();
    startTimeRef.current = Date.now();

    // Ghi nhận click / bắt đầu xem
    const ghiNhanClick = async () => {
      try {
        const res = await axiosClient.post('/ThongKe/click', {
          sanPhamId,
          nguoiDungId: nguoiDungId || null,
          sessionId,
        });
        if (res?.success && res?.data?.lichSuId) {
          lichSuIdRef.current = res.data.lichSuId;
        }
      } catch (err) {
        // Silently ignore — tracking không được làm ảnh hưởng UX
        console.debug('[Tracking] GhiNhanClick error:', err);
      }
    };

    ghiNhanClick();

    // Cleanup: cập nhật thời gian xem khi rời trang
    const capNhatThoiGian = () => {
      const lichSuId = lichSuIdRef.current;
      if (!lichSuId) return;

      const giay = Math.round((Date.now() - (startTimeRef.current || Date.now())) / 1000);

      // Dùng sendBeacon để đảm bảo request được gửi khi đóng tab
      const payload = JSON.stringify({ lichSuId, giay });
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
      const url = `${baseUrl}/ThongKe/thoi-gian-xem`;

      if (navigator.sendBeacon) {
        const blob = new Blob([payload], { type: 'application/json' });
        navigator.sendBeacon(url, blob);
      } else {
        // Fallback: gọi API bình thường (best-effort)
        axiosClient.post('/ThongKe/thoi-gian-xem', { lichSuId, giay }).catch(() => {});
      }
    };

    // Cleanup khi component unmount (navigate away)
    return () => {
      capNhatThoiGian();
    };
  }, [sanPhamId, nguoiDungId]);
}
