import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { getVisitorId, getSessionId } from '../utils/fingerprint';

/**
 * One-row-per-visitor tracker.
 * Each session (tab) appends pages to a JSONB `sessions` array
 * so we never create more than one row per unique device.
 */
export default function useVisitorTracker() {
  const { pathname, search } = useLocation();
  const pageStart = useRef(Date.now());
  const maxScroll = useRef(0);
  const dbRow = useRef(null);
  const session = useRef(null);
  const ready = useRef(false);
  const initCalled = useRef(false);

  /* ── Helpers ── */
  function scrollPct() {
    const doc = document.documentElement;
    const h = doc.scrollHeight - doc.clientHeight;
    return h > 0 ? Math.round((window.scrollY / h) * 100) : 0;
  }

  function getUtm() {
    const p = new URLSearchParams(search);
    return {
      source: p.get('utm_source') || null,
      medium: p.get('utm_medium') || null,
      campaign: p.get('utm_campaign') || null,
    };
  }

  /* ── Persist sessions array to Supabase ── */
  const persist = useCallback(async (sessions, extra = {}) => {
    if (!supabase || !dbRow.current) return;
    const { error } = await supabase
      .from('Visitors')
      .update({ sessions, last_seen: new Date().toISOString(), ...extra })
      .eq('visitor_id', dbRow.current.visitor_id);
    if (error) console.error('Visitor persist error:', error);
  }, []);

  /* ── Init: fetch or create visitor row, start session ── */
  useEffect(() => {
    if (!supabase || initCalled.current) return;
    initCalled.current = true;

    (async () => {
      const visitorId = await getVisitorId();
      const sessionId = getSessionId();
      const now = new Date().toISOString();
      const utm = getUtm();

      const newSession = {
        sid: sessionId,
        ref: document.referrer || null,
        utm: (utm.source || utm.medium || utm.campaign) ? utm : null,
        started: now,
        pages: [{
          url: pathname,
          title: document.title,
          at: now,
          dur: null,
          scroll: null,
        }],
      };

      // Try to fetch existing visitor
      const { data: existing } = await supabase
        .from('Visitors')
        .select('*')
        .eq('visitor_id', visitorId)
        .maybeSingle();

      if (existing) {
        const sessions = Array.isArray(existing.sessions)
          ? [...existing.sessions, newSession]
          : [newSession];
        dbRow.current = existing;

        const { error } = await supabase
          .from('Visitors')
          .update({
            sessions,
            visit_count: (existing.visit_count || 0) + 1,
            last_seen: now,
          })
          .eq('visitor_id', visitorId);
        if (error) console.error('Visitor update error:', error);

        dbRow.current.sessions = sessions;
      } else {
        const row = {
          visitor_id: visitorId,
          user_agent: navigator.userAgent,
          screen_resolution: `${screen.width}x${screen.height}`,
          language: navigator.language,
          platform: navigator.platform,
          visit_count: 1,
          last_seen: now,
          sessions: [newSession],
        };

        const { data, error } = await supabase
          .from('Visitors')
          .insert([row])
          .select()
          .single();
        if (error) console.error('Visitor insert error:', error);
        dbRow.current = data || row;
      }

      session.current = newSession;
      ready.current = true;
    })();
  }, []);

  /* ── Track page changes ── */
  useEffect(() => {
    if (!ready.current || !session.current) return;

    const now = new Date().toISOString();
    const pages = session.current.pages;

    // Close previous page (set duration + scroll)
    if (pages.length > 0) {
      const last = pages[pages.length - 1];
      if (last.dur === null) {
        last.dur = Math.round((Date.now() - pageStart.current) / 1000);
        last.scroll = maxScroll.current;
      }
    }

    // Add new page
    pages.push({ url: pathname, title: document.title, at: now, dur: null, scroll: null });
    pageStart.current = Date.now();
    maxScroll.current = 0;

    // Persist
    const sessions = dbRow.current.sessions;
    sessions[sessions.length - 1] = session.current;
    persist(sessions);
  }, [pathname, persist]);

  /* ── Track scroll depth ── */
  useEffect(() => {
    function onScroll() {
      const pct = scrollPct();
      if (pct > maxScroll.current) maxScroll.current = pct;
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── Exit: finalize last page and persist via keepalive ── */
  useEffect(() => {
    function onExit() {
      if (!ready.current || !dbRow.current || !session.current) return;

      const pages = session.current.pages;
      if (pages.length > 0) {
        const last = pages[pages.length - 1];
        last.dur = Math.round((Date.now() - pageStart.current) / 1000);
        last.scroll = maxScroll.current;
      }

      const sessions = dbRow.current.sessions;
      sessions[sessions.length - 1] = session.current;

      const url = `${import.meta.env.VITE_PROJECT_URL}/rest/v1/Visitors?visitor_id=eq.${dbRow.current.visitor_id}`;
      fetch(url, {
        method: 'PATCH',
        headers: {
          apikey: import.meta.env.VITE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${import.meta.env.VITE_PUBLISHABLE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({ sessions, last_seen: new Date().toISOString() }),
        keepalive: true,
      }).catch(() => {});
    }

    window.addEventListener('beforeunload', onExit);
    return () => window.removeEventListener('beforeunload', onExit);
  }, [pathname]);
}
