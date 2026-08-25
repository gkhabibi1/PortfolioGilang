const crypto = require('crypto');

/**
 * Helper to hash user data using SHA256 if not already hashed.
 * Meta requires SHA-256 lowercased strings for email (em), phone (ph), etc.
 */
function hashData(value) {
  if (!value || typeof value !== 'string') return value;
  // If it's already a 64-character hex string (SHA-256), return as is
  if (/^[a-f0-9]{64}$/i.test(value.trim())) {
    return value.trim().toLowerCase();
  }
  return crypto
    .createHash('sha256')
    .update(value.trim().toLowerCase())
    .digest('hex');
}

/**
 * Formats user data object for Meta CAPI requirements
 */
function formatUserData(userData, req) {
  const formatted = { ...userData };

  // Client IP & User Agent fallback from request headers if missing
  if (!formatted.client_ip_address) {
    const rawIp = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.socket?.remoteAddress || '';
    formatted.client_ip_address = rawIp.split(',')[0].trim();
  }
  if (!formatted.client_user_agent) {
    formatted.client_user_agent = req.headers['user-agent'] || '';
  }

  // Hash email if provided as array or string
  if (formatted.em) {
    if (Array.isArray(formatted.em)) {
      formatted.em = formatted.em.map(hashData);
    } else {
      formatted.em = [hashData(formatted.em)];
    }
  }

  // Hash phone if provided
  if (formatted.ph) {
    if (Array.isArray(formatted.ph)) {
      formatted.ph = formatted.ph.map(hashData);
    } else {
      formatted.ph = [hashData(formatted.ph)];
    }
  }

  // Hash fn (first name), ln (last name) if provided
  if (formatted.fn) formatted.fn = Array.isArray(formatted.fn) ? formatted.fn.map(hashData) : [hashData(formatted.fn)];
  if (formatted.ln) formatted.ln = Array.isArray(formatted.ln) ? formatted.ln.map(hashData) : [hashData(formatted.ln)];

  return formatted;
}

module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  const pixelId = process.env.META_PIXEL_ID;
  const accessToken = process.env.META_CAPI_TOKEN;
  const testEventCode = process.env.META_TEST_EVENT_CODE || req.body?.testEventCode;

  if (!pixelId || !accessToken) {
    console.error('Meta CAPI Error: Missing META_PIXEL_ID or META_CAPI_TOKEN in environment variables.');
    return res.status(500).json({
      error: 'Server configuration error: Missing META_PIXEL_ID or META_CAPI_TOKEN environment variables.',
    });
  }

  try {
    const { eventName, eventData, userData = {}, eventId, eventSourceUrl } = req.body || {};

    if (!eventName) {
      return res.status(400).json({ error: 'Missing required field: eventName' });
    }

    const payloadUserData = formatUserData(userData, req);

    const eventPayload = {
      event_name: eventName,
      event_time: Math.floor(Date.now() / 1000),
      action_source: 'website',
      event_id: eventId || `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      user_data: payloadUserData,
      custom_data: eventData || {},
    };

    if (eventSourceUrl) {
      eventPayload.event_source_url = eventSourceUrl;
    } else if (req.headers.referer) {
      eventPayload.event_source_url = req.headers.referer;
    }

    const requestPayload = {
      data: [eventPayload],
    };

    if (testEventCode) {
      requestPayload.test_event_code = testEventCode;
    }

    const metaUrl = `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${accessToken}`;

    const response = await fetch(metaUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestPayload),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Meta CAPI API Error Response:', result);
      return res.status(response.status).json({
        success: false,
        metaError: result,
      });
    }

    return res.status(200).json({
      success: true,
      eventId: eventPayload.event_id,
      result,
    });
  } catch (error) {
    console.error('Meta CAPI Handler Exception:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal Server Error',
    });
  }
};
