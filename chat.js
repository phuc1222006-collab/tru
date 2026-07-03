document.addEventListener('DOMContentLoaded', () => {

  const toggleBtn   = document.getElementById('chatbotToggle');
  const closeBtn     = document.getElementById('chatClose');
  const windowEl     = document.getElementById('chatbotWindow');
  const messagesEl   = document.getElementById('chatMessages');
  const inputEl      = document.getElementById('chatInput');
  const sendBtn      = document.getElementById('chatSend');
  const typingEl     = document.getElementById('chatTyping');
  const badgeEl      = toggleBtn?.querySelector('.chat-badge');
  const openIcon     = toggleBtn?.querySelector('.open-icon');
  const closeIcon    = toggleBtn?.querySelector('.close-icon');
  const quickReplies = document.getElementById('quickReplies');

  if (!toggleBtn || !windowEl) return;

  let isOpen = false;

  /* ---- Canned responses keyed by keyword ---- */
  const responses = [
    { keys: ['cloud'], reply: 'DigiServ cung cấp giải pháp Cloud Computing linh hoạt (IaaS/PaaS/SaaS) với SLA 99.9%, hỗ trợ Hybrid Cloud và sao lưu tự động. Bạn muốn mình gửi báo giá chi tiết không?' },
    { keys: ['bảo mật', 'security', 'an toàn'], reply: 'Dịch vụ Bảo mật & An toàn số của chúng tôi gồm chứng thư số CA/SSL, WAF, chống DDoS và eKYC. Bạn đang cần bảo vệ cho hệ thống nào ạ?' },
    { keys: ['ai', 'tự động hóa', 'automation'], reply: 'Về AI & Tự động hóa, chúng tôi có Smart Voice/Chatbot, AI Camera nhận diện và nền tảng Data Lakehouse. Bạn muốn ứng dụng AI vào quy trình nào của doanh nghiệp?' },
    { keys: ['báo giá', 'giá', 'price', 'chi phí'], reply: 'Báo giá sẽ tùy theo quy mô và nhu cầu cụ thể của doanh nghiệp bạn. Bạn để lại thông tin ở form "Đăng ký tư vấn miễn phí" bên dưới, đội ngũ DigiServ sẽ liên hệ trong 24h nhé!' },
    { keys: ['5g', 'mạng', 'network'], reply: 'Hạ tầng mạng 5G của chúng tôi hỗ trợ SD-WAN, Leased Line/MPLS và kết nối IoT tốc độ cao, độ trễ thấp — phù hợp cho Smart City và nhà máy thông minh.' },
    { keys: ['liên hệ', 'contact', 'hotline', 'sđt', 'số điện thoại'], reply: 'Bạn có thể gọi hotline miễn phí 1800 1260 hoặc email contact@digiserv.vn. Chúng tôi luôn sẵn sàng hỗ trợ!' },
    { keys: ['xin chào', 'hello', 'hi', 'chào'], reply: 'Xin chào! Rất vui được hỗ trợ bạn. Bạn quan tâm đến dịch vụ nào của DigiServ ạ?' },
  ];

  function getReply(text) {
    const lower = text.toLowerCase();
    const found = responses.find(r => r.keys.some(k => lower.includes(k)));
    if (found) return found.reply;
    return 'Cảm ơn bạn đã quan tâm! Để được tư vấn chính xác nhất, bạn vui lòng để lại thông tin liên hệ ở form bên dưới trang, hoặc gọi hotline 1800 1260 — đội ngũ DigiServ sẽ hỗ trợ ngay.';
  }

  function nowLabel() {
    return new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  }

  function scrollToBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function addUserMessage(text) {
    const msg = document.createElement('div');
    msg.className = 'msg user-msg';
    msg.innerHTML = `
      <div class="msg-bubble"><p></p></div>
      <span class="msg-time">${nowLabel()}</span>
    `;
    msg.querySelector('p').textContent = text;
    messagesEl.appendChild(msg);
    scrollToBottom();
  }

  function addBotMessage(text) {
    const msg = document.createElement('div');
    msg.className = 'msg bot-msg';
    msg.innerHTML = `
      <div class="msg-avatar">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <circle cx="14" cy="14" r="14" fill="url(#msgGrad)"/>
          <path d="M7 14 L14 7 L21 14 L14 21 Z" fill="white" opacity="0.9"/>
          <circle cx="14" cy="14" r="4" fill="white"/>
        </svg>
      </div>
      <div class="msg-bubble"><p></p></div>
      <span class="msg-time">${nowLabel()}</span>
    `;
    msg.querySelector('p').textContent = text;
    messagesEl.appendChild(msg);
    scrollToBottom();
  }

  function showTyping() {
    if (typingEl) typingEl.style.display = 'flex';
    scrollToBottom();
  }
  function hideTyping() {
    if (typingEl) typingEl.style.display = 'none';
  }

  function sendMessage(text) {
    const trimmed = text.trim();
    if (!trimmed) return;
    addUserMessage(trimmed);
    inputEl.value = '';
    quickReplies?.remove();

    showTyping();
    const delay = 700 + Math.random() * 700;
    setTimeout(() => {
      hideTyping();
      addBotMessage(getReply(trimmed));
    }, delay);
  }

  /* ---- Toggle open/close ---- */
  function openChat() {
    isOpen = true;
    windowEl.classList.add('open');
    if (openIcon) openIcon.style.display = 'none';
    if (closeIcon) closeIcon.style.display = 'flex';
    if (badgeEl) badgeEl.style.display = 'none';
    inputEl?.focus();
  }
  function closeChat() {
    isOpen = false;
    windowEl.classList.remove('open');
    if (openIcon) openIcon.style.display = 'flex';
    if (closeIcon) closeIcon.style.display = 'none';
  }

  toggleBtn.addEventListener('click', () => (isOpen ? closeChat() : openChat()));
  closeBtn?.addEventListener('click', closeChat);

  /* ---- Send message actions ---- */
  sendBtn?.addEventListener('click', () => sendMessage(inputEl.value));
  inputEl?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMessage(inputEl.value);
  });

  /* ---- Quick reply buttons ---- */
  document.querySelectorAll('.qr-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const msg = btn.getAttribute('data-msg') || btn.textContent;
      sendMessage(msg);
    });
  });

});
