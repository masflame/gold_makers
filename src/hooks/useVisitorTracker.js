import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { getVisitorId, getSessionId } from '../utils/fingerprint';

/**
 * Tracks page views, scroll depth, time-on-page, breadcrumb, and UTM params.
 * Inserts rows into the Supabase "Visitors" table.
 */
export default function useVisitorTracker() {
  const { pathname, search } = useLocation();
  const pageStart = useRef(Date.now());
  const maxScroll = useRef(0);
  const breadcrumb = useRef(
    JSON.parse(sessionStorage.getItem('gm_breadcrumb') || '[]'),
  );

  /* ── Helpers ── */
  function getUtm() {
    const p = new URLSearchParams(search);
    return {
      utm_source: p.get('utm_source') || null,
      utm_medium: p.get('utm_medium') || null,
      utm_campaign: p.get('utm_campaign') || null,
    };
  }

  function scrollPct() {
    const doc = document.documentElement;
    const scrollTop = window.scrollY;
    const scrollHeight = doc.scrollHeight - doc.clientHeight;
    return scrollHeight > 0 ? Math.round((scrollTop / scrollHeight) * 100) : 0;
  }

  async function send(eventType, extra = {}) {
    if (!supabase) return;
    const visitorId = await getVisitorId();
    const sessionId = getSessionId();

    const payload = {
      visitor_id: visitorId,
      session_id: sessionId,
      event_type: eventType,
      page_url: pathname,
      page_title: document.title,
      referrer: document.referrer || null,
      user_agent: navigator.userAgent,
      screen_resolution: `${screen.width}x${screen.height}`,
      language: navigator.language,
      platform: navigator.platform,
      breadcrumb: JSON.stringify(breadcrumb.current),
      ...getUtm(),
      ...extra,
    };

    const { error } = await supabase.from('Visitors').insert([payload]);
    if (error) console.error('Visitor tracking error:', error);
  }

  /* ── Page-view on route change ── */
  useEffect(() => {
    pageStart.current = Date.now();
    maxScroll.current = 0;

    // Update breadcrumb
    const crumb = breadcrumb.current;
    if (crumb[crumb.length - 1] !== pathname) {
      crumb.push(pathname);
      sessionStorage.setItem('gm_breadcrumb', JSON.stringify(crumb));
    }

    send('page_view');
  }, [pathname]);

  /* ── Track scroll depth ── */
  useEffect(() => {
    function onScroll() {
      const pct = scrollPct();
      if (pct > maxScroll.current) maxScroll.current = pct;
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── Send exit event with duration + scroll depth on page leave ── */
  useEffect(() => {
    function onExit() {
      const duration = Math.round((Date.now() - pageStart.current) / 1000);
      const data = {
        duration,
        scroll_depth: maxScroll.current,
      };

      // Use sendBeacon for reliability on page unload
      if (supabase && navigator.sendBeacon) {
        const visitorId = localStorage.getItem('gm_visitor_id') || '';
        const sessionId = sessionStorage.getItem('gm_session_id') || '';
        const payload = {
          visitor_id: visitorId,
          session_id: sessionId,
          event_type: 'exit',
          page_url: pathname,
          page_title: document.title,
          referrer: document.referrer || null,
          user_agent: navigator.userAgent,
          screen_resolution: `${screen.width}x${screen.height}`,
          language: navigator.language,
          platform: navigator.platform,
          breadcrumb: JSON.stringify(breadcrumb.current),
          ...getUtm(),
          ...data,
        };

        const url = `${import.meta.env.VITE_PROJECT_URL}/rest/v1/Visitors`;
        const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
        const headers = {
          apikey: import.meta.env.VITE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${import.meta.env.VITE_PUBLISHABLE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        };

        // sendBeacon doesn't support custom headers, so fall back to fetch keepalive
        fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
          keepalive: true,
        }).catch(() => {});
      }
    }

    window.addEventListener('beforeunload', onExit);
    return () => window.removeEventListener('beforeunload', onExit);
  }, [pathname, search]);
}
