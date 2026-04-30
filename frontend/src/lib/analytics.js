// Lightweight analytics → Supabase
// - Persistent visitor_id  (unique per browser, lives forever in localStorage)
// - Rolling session_id     (new one every 30 min of inactivity)
// - trackEvent(type, data) inserts a row in analytics_events
// - Fire-and-forget: never blocks UI, swallows errors so a failed insert never breaks a page

import { supabase } from '@/lib/supabase';

const VISITOR_KEY = 're_visitor_id';
const SESSION_KEY = 're_session_id';
const SESSION_TS_KEY = 're_session_ts';
const SESSION_TTL_MS = 30 * 60 * 1000; // 30 min

const uuid = () =>
  (crypto?.randomUUID?.() ||
    `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`);

const getVisitorId = () => {
  let id = localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id = uuid();
    localStorage.setItem(VISITOR_KEY, id);
  }
  return id;
};

const getSessionId = () => {
  const now = Date.now();
  const ts = Number(localStorage.getItem(SESSION_TS_KEY) || 0);
  let id = localStorage.getItem(SESSION_KEY);
  if (!id || now - ts > SESSION_TTL_MS) {
    id = uuid();
    localStorage.setItem(SESSION_KEY, id);
  }
  localStorage.setItem(SESSION_TS_KEY, String(now));
  return id;
};

export const trackEvent = async (eventType, eventData = {}) => {
  try {
    const visitor_id = getVisitorId();
    const session_id = getSessionId();
    const { data: { user } = {} } = await supabase.auth.getUser();

    const row = {
      event_type: eventType,
      event_data: eventData,
      user_id: user?.id || null,
      visitor_id,
      session_id,
      page_path: typeof window !== 'undefined' ? window.location.pathname : null,
      referrer: typeof document !== 'undefined' ? document.referrer || null : null,
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
    };
    await supabase.from('analytics_events').insert(row);
  } catch (_) {
    // swallow — analytics must never break the app
  }
};

export const trackPageView = (path) =>
  trackEvent('page_view', { path: path || window.location.pathname });
