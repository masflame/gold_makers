import { useEffect, useRef } from 'react';
import Lenis from 'lenis';

/**
 * Initialises Lenis smooth-scroll and a global IntersectionObserver
 * that adds `.is-revealed` to any element carrying `data-scroll`.
 *
 * Call once inside App (or any top-level layout component).
 * Pass `pathname` so the observer re-scans after route changes.
 */
export default function useScrollEngine(pathname) {
  const lenisRef = useRef(null);

  /* ── Lenis smooth scroll ─────────────────────────────── */
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 2,
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
