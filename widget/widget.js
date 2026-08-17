/**
 * ChatSaaS Widget v2.0
 *
 * Usage:
 *   <script
 *     src="https://yourdomain.com/widget.js"
 *     data-key-id="42"
 *     data-api-key="sk_live_xxxx"
 *     data-docs="1,2,3"
 *     data-api-url="https://yourdomain.com"
 *   ></script>
 *
 * Configuration is loaded from the server (GET /api/keys/<id>/widget-config/public/)
 * so users can update colors, name, icon, etc. from the dashboard without
 * changing their embed code.
 */
(function () {
  'use strict';

  // ── Read embed attributes ──────────────────────────────────────────────
  const scripts = document.querySelectorAll('script[data-key-id]');
  const currentScript = scripts[scripts.length - 1];

  const KEY_ID     = currentScript.getAttribute('data-key-id');
  const API_KEY    = currentScript.getAttribute('data-api-key');
  const DOC_IDS    = (currentScript.getAttribute('data-docs') || '').split(',').map(Number).filter(Boolean);
  const API_URL    = (currentScript.getAttribute('data-api-url') || 'http://localhost:8000').replace(/\/$/, '');

  if (!KEY_ID || !API_KEY) {
    console.error('[ChatSaaS] Missing data-key-id or data-api-key attributes.');
    return;
  }

  // ── State ──────────────────────────────────────────────────────────────
  let sessionId = null;
  let isOpen = false;
  let isDark = false;
  let config = {
    bot_name: 'AI Assistant',
    welcome_message: 'Hi! How can I help you today?',
    light_primary_color: '#6366f1',
    light_secondary_color: '#ffffff',
    dark_primary_color: '#818cf8',
    dark_secondary_color: '#1e1e2e',
    force_dark_mode: false,
    allow_user_toggle: true,
    icon_url: null,
    icon_emoji: '💬',
    position: 'bottom-right',
  };

  // ── Load config from server ────────────────────────────────────────────
  async function loadConfig() {
    try {
      const res = await fetch(`${API_URL}/api/keys/${KEY_ID}/widget-config/public/`);
      if (res.ok) {
        const data = await res.json();
        config = { ...config, ...data };
      }
    } catch (e) {
      // Use defaults silently
    }
  }

  // ── CSS custom properties driven theming ───────────────────────────────
  function applyTheme() {
    const root = document.getElementById('saas-widget-root');
    if (!root) return;

    const primary   = isDark ? config.dark_primary_color   : config.light_primary_color;
    const secondary = isDark ? config.dark_secondary_color : config.light_secondary_color;
    const textColor = isDark ? '#e2e8f0' : '#111827';
    const botBg     = isDark ? '#2d2d3f' : '#f3f4f6';
    const botText   = isDark ? '#e2e8f0' : '#111827';
    const borderC   = isDark ? '#3d3d5c' : '#e5e7eb';
    const inputBg   = isDark ? '#2d2d3f' : '#ffffff';

    root.style.setProperty('--wg-primary',    primary);
    root.style.setProperty('--wg-secondary',  secondary);
    root.style.setProperty('--wg-text',       textColor);
    root.style.setProperty('--wg-bot-bg',     botBg);
    root.style.setProperty('--wg-bot-text',   botText);
    root.style.setProperty('--wg-border',     borderC);
    root.style.setProperty('--wg-input-bg',   inputBg);
  }

  // ── Inject styles ──────────────────────────────────────────────────────
  function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      #saas-widget-root * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }

      #saas-chat-bubble {
        position: fixed;
        width: 58px; height: 58px; border-radius: 50%;
        background: var(--wg-primary);
        color: white; border: none; cursor: pointer;
        box-shadow: 0 4px 20px rgba(0,0,0,0.25);
        z-index: 9999;
        display: flex; align-items: center; justify-content: center;
        font-size: 26px;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }
      #saas-chat-bubble:hover { transform: scale(1.08); box-shadow: 0 6px 24px rgba(0,0,0,0.3); }
      #saas-chat-bubble img { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; }

      #saas-chat-box {
        position: fixed;
        width: 370px; height: 560px;
        border-radius: 20px;
        background: var(--wg-secondary);
        box-shadow: 0 12px 48px rgba(0,0,0,0.18);
        z-index: 9998;
        display: none; flex-direction: column; overflow: hidden;
        border: 1px solid var(--wg-border);
        transition: opacity 0.2s ease, transform 0.2s ease;
        opacity: 0; transform: translateY(10px) scale(0.97);
      }
      #saas-chat-box.open {
        display: flex;
        opacity: 1; transform: translateY(0) scale(1);
      }

      #saas-chat-header {
        background: var(--wg-primary);
        color: white; padding: 14px 16px;
        display: flex; align-items: center; justify-content: space-between;
      }
      #saas-chat-header .wg-title { font-weight: 600; font-size: 15px; }
      #saas-chat-header .wg-controls { display: flex; gap: 8px; align-items: center; }
      #saas-chat-header button {
        background: rgba(255,255,255,0.2); border: none; color: white;
        border-radius: 6px; padding: 4px 8px; cursor: pointer; font-size: 13px;
        transition: background 0.15s;
      }
      #saas-chat-header button:hover { background: rgba(255,255,255,0.35); }

      #saas-chat-messages {
        flex: 1; padding: 16px; overflow-y: auto;
        display: flex; flex-direction: column; gap: 10px;
        background: var(--wg-secondary);
      }
      #saas-chat-messages::-webkit-scrollbar { width: 4px; }
      #saas-chat-messages::-webkit-scrollbar-track { background: transparent; }
      #saas-chat-messages::-webkit-scrollbar-thumb { background: var(--wg-border); border-radius: 4px; }

      .saas-msg {
        max-width: 82%; padding: 10px 14px;
        border-radius: 16px; font-size: 14px; line-height: 1.55;
        word-break: break-word;
      }
      .saas-msg.user {
        background: var(--wg-primary); color: white;
        align-self: flex-end; border-bottom-right-radius: 4px;
      }
      .saas-msg.bot {
        background: var(--wg-bot-bg); color: var(--wg-bot-text);
        align-self: flex-start; border-bottom-left-radius: 4px;
      }

      .saas-typing {
        display: flex; gap: 4px; align-items: center;
        padding: 10px 14px; background: var(--wg-bot-bg);
        border-radius: 16px; border-bottom-left-radius: 4px;
        width: fit-content; align-self: flex-start;
      }
      .saas-typing span {
        width: 7px; height: 7px; background: var(--wg-primary);
        border-radius: 50%; animation: wg-bounce 1.2s infinite ease-in-out;
      }
      .saas-typing span:nth-child(2) { animation-delay: 0.2s; }
      .saas-typing span:nth-child(3) { animation-delay: 0.4s; }

      @keyframes wg-bounce {
        0%, 60%, 100% { transform: translateY(0); }
        30% { transform: translateY(-6px); }
      }

      #saas-chat-input-area {
        display: flex; padding: 12px; gap: 8px;
        border-top: 1px solid var(--wg-border);
        background: var(--wg-secondary);
      }
      #saas-chat-input {
        flex: 1; padding: 10px 14px;
        border: 1.5px solid var(--wg-border); border-radius: 10px;
        font-size: 14px; outline: none;
        background: var(--wg-input-bg); color: var(--wg-text);
        transition: border-color 0.2s;
      }
      #saas-chat-input:focus { border-color: var(--wg-primary); }
      #saas-chat-input::placeholder { color: #9ca3af; }

      #saas-chat-send {
        background: var(--wg-primary); color: white; border: none;
        border-radius: 10px; padding: 0 16px; cursor: pointer; font-size: 18px;
        transition: opacity 0.2s;
        display: flex; align-items: center; justify-content: center;
        min-width: 44px;
      }
      #saas-chat-send:hover { opacity: 0.85; }
      #saas-chat-send:disabled { opacity: 0.5; cursor: not-allowed; }
    `;
    document.head.appendChild(style);
  }

  // ── Get position styles ────────────────────────────────────────────────
  function getPositionStyles() {
    const isRight = config.position !== 'bottom-left';
    const h = '24px', side = '24px';
    return {
      bubble: isRight
        ? `bottom:${h}; right:${side};`
        : `bottom:${h}; left:${side};`,
      box: isRight
        ? `bottom:96px; right:${side};`
        : `bottom:96px; left:${side};`,
    };
  }

  // ── Build HTML ─────────────────────────────────────────────────────────
  function buildWidget() {
    const pos = getPositionStyles();
    const iconHtml = config.icon_url
      ? `<img src="${config.icon_url}" alt="${config.bot_name}" />`
      : config.icon_emoji;

    const root = document.createElement('div');
    root.id = 'saas-widget-root';
    root.innerHTML = `
      <button id="saas-chat-bubble" style="${pos.bubble}" title="Chat with ${config.bot_name}">
        ${iconHtml}
      </button>
      <div id="saas-chat-box" style="${pos.box}">
        <div id="saas-chat-header">
          <span class="wg-title">${config.bot_name}</span>
          <div class="wg-controls">
            ${config.allow_user_toggle ? '<button id="saas-dark-toggle" title="Toggle dark mode">🌙</button>' : ''}
            <button id="saas-chat-close" title="Close">✕</button>
          </div>
        </div>
        <div id="saas-chat-messages">
          <div class="saas-msg bot">${config.welcome_message}</div>
        </div>
        <div id="saas-chat-input-area">
          <input id="saas-chat-input" placeholder="Ask a question..." autocomplete="off" />
          <button id="saas-chat-send">➤</button>
        </div>
      </div>
    `;
    document.body.appendChild(root);
  }

  // ── Event handlers ─────────────────────────────────────────────────────
  function bindEvents() {
    // Bubble toggle
    document.getElementById('saas-chat-bubble').onclick = () => {
      isOpen = !isOpen;
      const box = document.getElementById('saas-chat-box');
      box.classList.toggle('open', isOpen);
      if (isOpen) setTimeout(() => document.getElementById('saas-chat-input').focus(), 50);
    };

    // Close button
    document.getElementById('saas-chat-close').onclick = () => {
      isOpen = false;
      document.getElementById('saas-chat-box').classList.remove('open');
    };

    // Dark mode toggle
    if (config.allow_user_toggle) {
      document.getElementById('saas-dark-toggle').onclick = () => {
        isDark = !isDark;
        localStorage.setItem('saas-widget-dark', isDark ? '1' : '0');
        document.getElementById('saas-dark-toggle').textContent = isDark ? '☀️' : '🌙';
        applyTheme();
      };
    }

    // Send button
    document.getElementById('saas-chat-send').onclick = sendMessage;

    // Enter key
    document.getElementById('saas-chat-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }

  // ── Chat messages ──────────────────────────────────────────────────────
  function addMessage(text, role) {
    const messages = document.getElementById('saas-chat-messages');
    const div = document.createElement('div');
    div.className = `saas-msg ${role}`;
    div.textContent = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  function showTyping() {
    const messages = document.getElementById('saas-chat-messages');
    const div = document.createElement('div');
    div.id = 'saas-typing-indicator';
    div.className = 'saas-typing';
    div.innerHTML = '<span></span><span></span><span></span>';
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  function hideTyping() {
    const el = document.getElementById('saas-typing-indicator');
    if (el) el.remove();
  }

  // ── Send message ───────────────────────────────────────────────────────
  async function sendMessage() {
    const input = document.getElementById('saas-chat-input');
    const send = document.getElementById('saas-chat-send');
    const question = input.value.trim();
    if (!question) return;

    input.value = '';
    input.disabled = true;
    send.disabled = true;
    addMessage(question, 'user');
    showTyping();

    try {
      const response = await fetch(`${API_URL}/api/keys/chat/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Api-Key ${API_KEY}`,
        },
        body: JSON.stringify({
          question,
          document_ids: DOC_IDS,
          session_id: sessionId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      sessionId = data.session_id;
      hideTyping();
      addMessage(data.answer, 'bot');
    } catch (err) {
      hideTyping();
      addMessage('Sorry, something went wrong. Please try again.', 'bot');
      console.error('[ChatSaaS] Error:', err);
    } finally {
      input.disabled = false;
      send.disabled = false;
      input.focus();
    }
  }

  // ── Init ───────────────────────────────────────────────────────────────
  async function init() {
    await loadConfig();

    // Apply forced dark or user preference
    if (config.force_dark_mode) {
      isDark = true;
    } else {
      isDark = localStorage.getItem('saas-widget-dark') === '1';
    }

    injectStyles();
    buildWidget();
    applyTheme();
    bindEvents();

    // Sync dark toggle icon state
    if (config.allow_user_toggle) {
      const toggle = document.getElementById('saas-dark-toggle');
      if (toggle) toggle.textContent = isDark ? '☀️' : '🌙';
    }
  }

  // Run after DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();