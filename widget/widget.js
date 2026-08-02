(function () {
  // Config injected via script tag data attributes
  // Usage: <script src="..." data-key="sk_live_xxx" data-docs="1,2,3"></script>
  const scripts = document.querySelectorAll('script[data-key]');
  const currentScript = scripts[scripts.length - 1];

  const API_KEY = currentScript.getAttribute('data-key');
  const DOC_IDS = currentScript.getAttribute('data-docs').split(',').map(Number);
  const SYSTEM_PROMPT = currentScript.getAttribute('data-prompt') || null;
  const PRIMARY_COLOR = currentScript.getAttribute('data-color') || '#6366f1';
  const BOT_NAME = currentScript.getAttribute('data-name') || 'AI Assistant';
  const API_URL = 'http://localhost:8000/api/keys/chat/'; // change in production

  let sessionId = null;
  let isOpen = false;

  // ── Inject styles ──────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    #saas-chat-widget * { box-sizing: border-box; font-family: sans-serif; }
    #saas-chat-bubble {
      position: fixed; bottom: 24px; right: 24px;
      width: 56px; height: 56px; border-radius: 50%;
      background: ${PRIMARY_COLOR}; color: white;
      border: none; cursor: pointer; font-size: 24px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.2);
      z-index: 9999; display: flex; align-items: center; justify-content: center;
    }
    #saas-chat-box {
      position: fixed; bottom: 90px; right: 24px;
      width: 360px; height: 520px; border-radius: 16px;
      background: white; box-shadow: 0 8px 32px rgba(0,0,0,0.15);
      z-index: 9998; display: none; flex-direction: column; overflow: hidden;
    }
    #saas-chat-box.open { display: flex; }
    #saas-chat-header {
      background: ${PRIMARY_COLOR}; color: white;
      padding: 16px; font-weight: bold; font-size: 15px;
    }
    #saas-chat-messages {
      flex: 1; padding: 16px; overflow-y: auto;
      display: flex; flex-direction: column; gap: 10px;
    }
    .saas-msg {
      max-width: 80%; padding: 10px 14px;
      border-radius: 12px; font-size: 14px; line-height: 1.5;
    }
    .saas-msg.user {
      background: ${PRIMARY_COLOR}; color: white;
      align-self: flex-end; border-bottom-right-radius: 4px;
    }
    .saas-msg.bot {
      background: #f3f4f6; color: #111;
      align-self: flex-start; border-bottom-left-radius: 4px;
    }
    #saas-chat-input-area {
      display: flex; padding: 12px; border-top: 1px solid #e5e7eb; gap: 8px;
    }
    #saas-chat-input {
      flex: 1; padding: 10px 14px; border: 1px solid #e5e7eb;
      border-radius: 8px; font-size: 14px; outline: none;
    }
    #saas-chat-send {
      background: ${PRIMARY_COLOR}; color: white;
      border: none; border-radius: 8px; padding: 10px 16px;
      cursor: pointer; font-size: 14px;
    }
    #saas-typing {
      font-size: 13px; color: #888; padding: 0 16px 8px;
      display: none;
    }
  `;
  document.head.appendChild(style);

  // ── Build HTML ─────────────────────────────────────────────────
  const widget = document.createElement('div');
  widget.id = 'saas-chat-widget';
  widget.innerHTML = `
    <button id="saas-chat-bubble">💬</button>
    <div id="saas-chat-box">
      <div id="saas-chat-header">${BOT_NAME}</div>
      <div id="saas-chat-messages">
        <div class="saas-msg bot">Hi! How can I help you today?</div>
      </div>
      <div id="saas-typing">Thinking...</div>
      <div id="saas-chat-input-area">
        <input id="saas-chat-input" placeholder="Ask a question..." />
        <button id="saas-chat-send">Send</button>
      </div>
    </div>
  `;
  document.body.appendChild(widget);

  // ── Toggle open/close ──────────────────────────────────────────
  document.getElementById('saas-chat-bubble').onclick = () => {
    isOpen = !isOpen;
    document.getElementById('saas-chat-box').classList.toggle('open', isOpen);
    if (isOpen) document.getElementById('saas-chat-input').focus();
  };

  // ── Send message ───────────────────────────────────────────────
  function addMessage(text, role) {
    const messages = document.getElementById('saas-chat-messages');
    const div = document.createElement('div');
    div.className = `saas-msg ${role}`;
    div.textContent = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  async function sendMessage() {
    const input = document.getElementById('saas-chat-input');
    const question = input.value.trim();
    if (!question) return;

    input.value = '';
    addMessage(question, 'user');

    const typing = document.getElementById('saas-typing');
    typing.style.display = 'block';

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Api-Key ${API_KEY}`
        },
        body: JSON.stringify({
          question,
          document_ids: DOC_IDS,
          system_prompt: SYSTEM_PROMPT,
          session_id: sessionId,
        })
      });

      const data = await response.json();
      sessionId = data.session_id;
      addMessage(data.answer, 'bot');
    } catch (err) {
      addMessage('Something went wrong. Please try again.', 'bot');
    } finally {
      typing.style.display = 'none';
    }
  }

  document.getElementById('saas-chat-send').onclick = sendMessage;
  document.getElementById('saas-chat-input').onkeypress = (e) => {
    if (e.key === 'Enter') sendMessage();
  };
})();