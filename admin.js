/**
 * VNVD — Admin Module (Phân quyền Admin / Khách hàng)
 * - Chỉ tài khoản có role='admin' mới mở được bảng điều khiển.
 * - Đọc dữ liệu người dùng từ VNVDAuth, dịch vụ tĩnh, đơn hàng từ localStorage.
 */
(function () {
  'use strict';

  const panel        = document.getElementById('adminPanel');
  const openBtn      = document.getElementById('openAdminBtn');
  const closeBtn     = document.getElementById('adminClose');
  const usersBody    = document.getElementById('adminUsersBody');
  const servicesBody = document.getElementById('adminServicesBody');
  const ordersBody   = document.getElementById('adminOrdersBody');

  /* ---- Dữ liệu dịch vụ (đồng bộ với trang chủ) ---- */
  const SERVICES = [
    { id: 'svc-001', name: 'Cloud Computing',          price: 2500000 },
    { id: 'svc-002', name: 'Bảo mật & An toàn số',     price: 1800000 },
    { id: 'svc-003', name: 'AI & Tự động hóa',         price: 3200000 },
    { id: 'svc-004', name: 'Hạ tầng mạng 5G',          price: 4500000 },
    { id: 'svc-005', name: 'Quản trị doanh nghiệp số', price: 990000  },
    { id: 'svc-006', name: 'Giao tiếp & Cộng tác',     price: 750000  },
    { id: 'svc-007', name: 'Big Data & Phân tích',     price: 2100000 },
    { id: 'svc-008', name: 'IoT & Smart City',         price: 1500000 },
    { id: 'pkg-basic',    name: 'Gói Cơ bản',      price: 990000  },
    { id: 'pkg-business', name: 'Gói Doanh nghiệp', price: 2900000 },
    { id: 'pkg-premium',  name: 'Gói Cao cấp',      price: 7500000 }
  ];

  function fmt(n) { return (n || 0).toLocaleString('vi-VN') + ' ₫'; }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /* ---- Bảo vệ: chỉ admin ---- */
  function guard() {
    const ok = window.VNVDAuth && window.VNVDAuth.isAdmin && window.VNVDAuth.isAdmin();
    return !!ok;
  }

  function getUsers() {
    try {
      if (window.VNVDAuth && window.VNVDAuth.getUsers) return window.VNVDAuth.getUsers();
      return JSON.parse(localStorage.getItem('vnvd_users') || '[]');
    } catch { return []; }
  }

  function getCart() {
    try { return JSON.parse(localStorage.getItem('vnvd_cart') || '[]'); }
    catch { return []; }
  }

  /* ---- Render bảng ---- */
  function renderUsers() {
    const users = getUsers();
    if (!usersBody) return;
    if (!users.length) { usersBody.innerHTML = '<tr><td colspan="4" class="admin-empty">Chưa có người dùng.</td></tr>'; return; }
    usersBody.innerHTML = users.map(u => {
      const role = u.role || 'customer';
      const tag = role === 'admin'
        ? '<span class="admin-tag orange">Quản trị viên</span>'
        : '<span class="admin-tag blue">Khách hàng</span>';
      const name = `${esc(u.firstName || '')} ${esc(u.lastName || '')}`.trim() || '—';
      return `<tr><td>${name}</td><td>${esc(u.email)}</td><td>${esc(u.phone || '—')}</td><td>${tag}</td></tr>`;
    }).join('');
    const statUsers = document.getElementById('statUsers');
    if (statUsers) statUsers.textContent = users.length;
  }

  function renderServices() {
    if (!servicesBody) return;
    servicesBody.innerHTML = SERVICES.map(s =>
      `<tr><td>${esc(s.id)}</td><td>${esc(s.name)}</td><td>${fmt(s.price)}</td><td><span class="admin-tag green">Đang bán</span></td></tr>`
    ).join('');
    const statServices = document.getElementById('statServices');
    if (statServices) statServices.textContent = SERVICES.length;
  }

  function renderOrders() {
    if (!ordersBody) return;
    const cart = getCart();
    if (!cart.length) {
      ordersBody.innerHTML = '<tr><td colspan="5" class="admin-empty">Chưa có đơn hàng nào trong giỏ (demo).</td></tr>';
      document.getElementById('statOrders') && (document.getElementById('statOrders').textContent = '0');
      document.getElementById('statRevenue') && (document.getElementById('statRevenue').textContent = fmt(0));
      return;
    }
    let total = 0;
    ordersBody.innerHTML = cart.map((item, i) => {
      const qty = item.qty || 1;
      const line = (item.price || 0) * qty;
      total += line;
      return `<tr><td>#DH${String(1000 + i)}</td><td>${esc(item.name)}</td><td>${qty}</td><td>${fmt(line)}</td><td><span class="admin-tag orange">Chờ xử lý</span></td></tr>`;
    }).join('');
    document.getElementById('statOrders') && (document.getElementById('statOrders').textContent = cart.length);
    document.getElementById('statRevenue') && (document.getElementById('statRevenue').textContent = fmt(total));
  }

  function renderAll() {
    renderUsers();
    renderServices();
    renderOrders();
    if (window.lucide) lucide.createIcons();
  }

  /* ---- Mở / đóng panel ---- */
  function openPanel() {
    if (!guard()) {
      // Không phải admin -> chặn
      const toast = document.getElementById('toast');
      const toastMsg = document.getElementById('toastMsg');
      if (toast && toastMsg) {
        toastMsg.textContent = 'Bạn không có quyền truy cập khu vực quản trị.';
        toast.style.background = '#E53E3E';
        toast.classList.add('show');
        setTimeout(() => { toast.classList.remove('show'); toast.style.background = ''; }, 3000);
      }
      return;
    }
    renderAll();
    panel?.classList.add('open');
    document.body.style.overflow = 'hidden';
    // đóng dropdown user menu nếu đang mở
    document.getElementById('userMenu')?.classList.remove('open');
  }

  function closePanel() {
    panel?.classList.remove('open');
    document.body.style.overflow = '';
  }

  openBtn?.addEventListener('click', openPanel);
  closeBtn?.addEventListener('click', closePanel);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panel?.classList.contains('open')) closePanel();
  });

  /* ---- Tabs ---- */
  document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const key = tab.getAttribute('data-tab');
      document.querySelectorAll('.admin-tab').forEach(t => t.classList.toggle('active', t === tab));
      document.querySelectorAll('.admin-tab-panel').forEach(p =>
        p.classList.toggle('active', p.getAttribute('data-panel') === key)
      );
    });
  });

  /* ---- Khi trạng thái đăng nhập đổi: nếu không còn admin, đóng panel ---- */
  document.addEventListener('vnvd:authchange', () => {
    if (!guard()) closePanel();
    else if (panel?.classList.contains('open')) renderAll();
  });

})();
