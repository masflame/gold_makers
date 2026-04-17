import { useEffect, useRef } from 'react';
import Lenis from 'lenis';

const isTouchDevice = () =>
  typeof window !== 'undefined' &&
  ('ontouchstart' in window || navigator.maxTouchPoints > 0);

/**
 * Initialises Lenis smooth-scroll and a global IntersectionObserver
 * that adds `.is-revealed` to any element carrying `data-scroll`.
 *
 * Call once inside App (or any top-level layout component).
 * Pass `pathname` so the observer re-scans after route changes.
 *
 * Lenis is DISABLED on touch devices — it hijacks native scroll
 * which breaks IntersectionObserver, video autoplay, and input focus.
 */
export default function useScrollEngine(pathname) {
  const lenisRef = useRef(null);

  /* ── Lenis smooth scroll (desktop only) ──────────────── */
  useEffect(() => {
    if (isTouchDevice()) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    let rafId;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  /* ── Scroll-triggered reveal observer ────────────────── */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    // Small delay so React has finished painting the new page
    const timer = setTimeout(() => {
      document
        .querySelectorAll('[data-scroll]:not(.is-revealed)')
        .forEach((el) => observer.observe(el));
    }, 80);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [pathname]);

  return lenisRef;
}
