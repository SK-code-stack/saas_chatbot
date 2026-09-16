# Chatbot Script Integration & Context Persistence Strategy

## 1. Problem Statement
When deploying an embeddable `<script>` tag widget across websites:
- **Multi-Page Applications (MPAs):** Page switches cause full page reloads, resetting JavaScript in-memory state.
- **Goal:** Ensure chat context, user session, and UI state (open/closed, message history) are preserved seamlessly across page navigations without requiring complex manual setup.

---

## 2. Preserving Chat Context Across Page Switch (MPA & SPA)

### A. Client-Side Session Storage (`localStorage` / Cookies)
- Store a persistent `sessionId` in `localStorage` (or cross-subdomain Cookie `Domain=.example.com`).
- Store UI state (e.g., `isOpen: true`, `unreadCount`, draft message) in `localStorage`.

### B. Server-Side History Re-hydration
- When the script mounts on a new page load, it reads `sessionId` from `localStorage`.
- Fetch conversation history from your backend (`GET /api/chat/history?sessionId=...`) or open WebSocket passing `sessionId`.
- Re-render the conversation and UI state immediately so the user experiences zero disruption.

### C. Identified Users API
- For websites with user logins, support an `identify` method:
  ```html
  <script>
    window.MyChatbot('identify', { userId: 'usr_123', email: 'user@example.com' });
  </script>
  ```
- Links conversation history directly to the user's account backend.

---

## 3. Automated Script Tag Integration Options (No Manual Paste)

1. **CMS Plugins & Apps:** Build 1-click plugins for WordPress, Shopify, or Wix that auto-inject the script tag.
2. **Cloudflare / Edge Workers:** Use Cloudflare Apps or reverse proxies to dynamically inject the `<script>` tag into outgoing HTML responses.
3. **Google Tag Manager (GTM) API (Recommended zero-paste method):**
   - **Flow:** User clicks "Connect GTM" in your dashboard, completes Google OAuth 2.0 authorization, and your system uses Google's GTM API to programmatically create and publish the script tag.
   - **Cost:** 100% Free (Google Tag Manager & API have no usage fees).
   - **Ease of Use:** ~10 seconds for user (standard 2-click Google login prompt).
   - **Security:** Highly secure; uses OAuth 2.0 scoped strictly to GTM. You never touch their server, site credentials, or raw code.
   - **Stack Compatibility:** Works on **ALL** website technologies (PHP, WordPress, React, Next.js, Django, Laravel, static HTML) provided GTM is installed on the site.

---

## 4. How Users Install Google Tag Manager (GTM) Across Stacks

- **Static HTML / Plain PHP:** Paste the 2-line GTM snippet into main layout `<head>` & `<body>`.
- **WordPress:** Install free *GTM4WP* plugin and enter GTM Container ID (`GTM-XXXXX`).
- **Shopify / Wix / Squarespace:** Enter GTM Container ID directly in platform Integration/Theme settings.
- **React / Next.js / Vue:** Use helper packages (`next/third-parties/google`) and pass GTM ID in root layout.
- **Django / Laravel / Rails:** Paste GTM snippet in base layout template (`base.html` / `app.blade.php`).
