/**
 * Meta Conversions API (CAPI) & Browser Pixel Client Helper
 */
(function (window) {
  // Utility: Generate unique event ID for deduplication
  function generateEventId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'evt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
  }

  // Utility: SHA-256 Hashing using Web Crypto API
  async function hashSHA256(str) {
    if (!str || typeof str !== 'string') return str;
    const cleanStr = str.trim().toLowerCase();
    if (/^[a-f0-9]{64}$/i.test(cleanStr)) return cleanStr;
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(cleanStr);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      return cleanStr;
    }
  }

  /**
   * Main function to track Meta events via Browser Pixel + Serverless CAPI
   * @param {string} eventName - e.g. "Lead", "Contact", "Purchase", "PageView"
   * @param {object} eventData - Custom parameters e.g. { content_name: "Web 500K", value: 500000, currency: "IDR" }
   * @param {object} userData - User info e.g. { em: "user@email.com", ph: "08123456789" }
   * @param {string} customEventId - Optional pre-generated event_id for deduplication
   */
  async function trackMetaEvent(eventName, eventData = {}, userData = {}, customEventId = null) {
    const eventId = customEventId || generateEventId();

    // 1. Browser Pixel tracking (if fbq exists)
    if (typeof window.fbq === 'function') {
      window.fbq('track', eventName, eventData, { eventID: eventId });
    }

    // 2. Hash user data client-side if available
    const preparedUserData = { ...userData };
    if (preparedUserData.em) {
      preparedUserData.em = Array.isArray(preparedUserData.em)
        ? await Promise.all(preparedUserData.em.map(hashSHA256))
        : [await hashSHA256(preparedUserData.em)];
    }
    if (preparedUserData.ph) {
      preparedUserData.ph = Array.isArray(preparedUserData.ph)
        ? await Promise.all(preparedUserData.ph.map(hashSHA256))
        : [await hashSHA256(preparedUserData.ph)];
    }

    preparedUserData.client_user_agent = navigator.userAgent;

    // 3. Send POST to serverless Conversions API endpoint
    try {
      const response = await fetch('/api/meta-capi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventName,
          eventId,
          eventData,
          userData: preparedUserData,
          eventSourceUrl: window.location.href,
        }),
      });

      const result = await response.json();
      console.log(`[Meta CAPI] Tracked event "${eventName}" (${eventId}):`, result);
      return { eventId, result };
    } catch (err) {
      console.error(`[Meta CAPI] Failed to track event "${eventName}":`, err);
      return { eventId, error: err };
    }
  }

  // Expose to global window scope
  window.trackMetaEvent = trackMetaEvent;

  // Auto-attach listeners on DOM ready for WhatsApp buttons & elements with data-meta-event
  document.addEventListener('DOMContentLoaded', function () {
    // Auto attach to links with wa.me or api.whatsapp.com
    document.querySelectorAll('a[href*="wa.me"], a[href*="api.whatsapp.com"]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        trackMetaEvent('Lead', {
          content_name: 'WhatsApp Order / CTA Click',
          destination: btn.getAttribute('href'),
        });
      });
    });

    // Auto attach to elements with explicit data-meta-event attribute
    document.querySelectorAll('[data-meta-event]').forEach(function (el) {
      el.addEventListener('click', function () {
        const eventName = el.getAttribute('data-meta-event') || 'Lead';
        const eventNameParam = el.getAttribute('data-meta-name') || el.innerText.trim();
        trackMetaEvent(eventName, { content_name: eventNameParam });
      });
    });
  });
})(window);
