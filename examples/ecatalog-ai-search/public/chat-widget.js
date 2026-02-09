/**
 * eCatalog AI Chat Widget
 *
 * Vanilla JavaScript widget that:
 * 1. Loads products and renders the catalogue grid
 * 2. Handles AI search/chat via SSE streaming
 * 3. Manages chat session state
 */

(function () {
  'use strict';

  // ========================================================================
  // State
  // ========================================================================

  let sessionId = null;
  let isStreaming = false;
  const messages = [];

  // ========================================================================
  // DOM Elements
  // ========================================================================

  const searchForm = document.getElementById('searchForm');
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  const chatPanel = document.getElementById('chatPanel');
  const chatMessages = document.getElementById('chatMessages');
  const chatClose = document.getElementById('chatClose');
  const overlay = document.getElementById('overlay');
  const productGrid = document.getElementById('productGrid');

  // ========================================================================
  // Products
  // ========================================================================

  async function loadProducts() {
    try {
      const res = await fetch('/api/products');
      const { data } = await res.json();
      renderProducts(data);
    } catch (err) {
      console.error('Failed to load products:', err);
      productGrid.innerHTML = '<p style="color: var(--text-muted);">Failed to load products.</p>';
    }
  }

  function renderProducts(products) {
    productGrid.innerHTML = products.map(p => `
      <div class="product-card">
        <img class="product-image" src="${p.image}" alt="${p.name}" loading="lazy">
        <div class="product-body">
          <div class="product-category">${p.category}</div>
          <div class="product-name">${p.name}</div>
          <div class="product-description">${p.description}</div>
          <div class="product-specs">
            ${Object.entries(p.specs).slice(0, 3).map(([k, v]) =>
              `<span class="product-spec">${k}: ${v}</span>`
            ).join('')}
          </div>
          <div class="product-footer">
            <div class="product-price">
              ${p.price.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
              <span class="currency">${p.currency}</span>
            </div>
            ${p.badge ? `<span class="product-badge ${p.badge.toLowerCase()}">${p.badge}</span>` : ''}
          </div>
        </div>
      </div>
    `).join('');
  }

  // ========================================================================
  // Chat Session
  // ========================================================================

  async function ensureSession() {
    if (sessionId) return sessionId;

    try {
      const res = await fetch('/api/chat/session', { method: 'POST' });
      const data = await res.json();
      sessionId = data.sessionId;
      return sessionId;
    } catch (err) {
      console.error('Failed to create session:', err);
      throw err;
    }
  }

  // ========================================================================
  // Chat UI
  // ========================================================================

  function openChat() {
    chatPanel.classList.add('active');
    overlay.classList.add('active');
  }

  function closeChat() {
    chatPanel.classList.remove('active');
    overlay.classList.remove('active');
  }

  function addMessage(role, content) {
    const msg = { role, content };
    messages.push(msg);

    const div = document.createElement('div');
    div.className = `chat-message ${role}`;

    const avatar = document.createElement('div');
    avatar.className = 'chat-avatar';
    avatar.textContent = role === 'user' ? '👤' : '✦';

    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble';
    bubble.innerHTML = formatContent(content);

    div.appendChild(avatar);
    div.appendChild(bubble);
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    return bubble;
  }

  function createStreamingBubble() {
    const div = document.createElement('div');
    div.className = 'chat-message assistant';

    const avatar = document.createElement('div');
    avatar.className = 'chat-avatar';
    avatar.textContent = '✦';

    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble';
    bubble.innerHTML = '<span class="thinking">Thinking...</span>';

    div.appendChild(avatar);
    div.appendChild(bubble);
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    return bubble;
  }

  function formatContent(text) {
    // Basic markdown-like formatting
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');
  }

  // ========================================================================
  // Streaming Chat
  // ========================================================================

  async function sendMessage(message) {
    if (isStreaming || !message.trim()) return;

    isStreaming = true;
    searchBtn.disabled = true;
    searchBtn.textContent = '...';

    openChat();
    addMessage('user', message);

    const bubble = createStreamingBubble();
    let fullContent = '';
    let hasStartedContent = false;

    try {
      await ensureSession();

      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, message }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const block of lines) {
          const trimmed = block.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;

          try {
            const event = JSON.parse(trimmed.slice(6));

            if (event.type === 'delta' && event.data?.content) {
              if (!hasStartedContent) {
                bubble.innerHTML = '';
                hasStartedContent = true;
              }
              fullContent += event.data.content;
              bubble.innerHTML = formatContent(fullContent) + '<span class="cursor"></span>';
              chatMessages.scrollTop = chatMessages.scrollHeight;
            }

            if (event.type === 'thinking_start' || event.type === 'rag_search_start') {
              if (!hasStartedContent) {
                bubble.innerHTML = '<span class="thinking">Searching product catalogue...</span>';
              }
            }

            if (event.type === 'complete' || event.type === 'stream_end') {
              // Remove cursor
              bubble.innerHTML = formatContent(fullContent || 'No response received.');
              messages.push({ role: 'assistant', content: fullContent });
            }

            if (event.type === 'error') {
              bubble.innerHTML = `<span class="thinking">Error: ${event.data?.message || 'Something went wrong'}</span>`;
            }
          } catch {
            // Ignore parse errors for incomplete chunks
          }
        }
      }

      // Ensure cursor is removed at end
      if (hasStartedContent) {
        bubble.innerHTML = formatContent(fullContent);
      }

    } catch (err) {
      console.error('Chat error:', err);
      bubble.innerHTML = `<span class="thinking">Error: ${err.message}</span>`;
    } finally {
      isStreaming = false;
      searchBtn.disabled = false;
      searchBtn.textContent = 'Ask AI';
      searchInput.value = '';
      searchInput.focus();
    }
  }

  // ========================================================================
  // Event Listeners
  // ========================================================================

  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (query) sendMessage(query);
  });

  chatClose.addEventListener('click', closeChat);
  overlay.addEventListener('click', closeChat);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeChat();
  });

  // Focus search on page load
  searchInput.focus();

  // ========================================================================
  // Init
  // ========================================================================

  loadProducts();
})();
