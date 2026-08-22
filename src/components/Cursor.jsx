import { useEffect } from 'react';
import gsap from 'gsap';

/* Dot tracks tightly, ring lags behind (two quickTo durations). Both scale
   and recolour per `data-cursor` on the hovered element. Off on touch. */
export default function Cursor() {
  useEffect(() => {
    if (window.matchMedia('(hover: none)').matches) return;
    const dot = document.querySelector('.cursor');
    const ring = document.querySelector('.cursor-ring');
    if (!dot || !ring) return;

    const dx = gsap.quickTo(dot, 'x', { duration: 0.14, ease: 'power3.out' });
    const dy = gsap.quickTo(dot, 'y', { duration: 0.14, ease: 'power3.out' });
    const rx = gsap.quickTo(ring, 'x', { duration: 0.55, ease: 'power3.out' });
    const ry = gsap.quickTo(ring, 'y', { duration: 0.55, ease: 'power3.out' });

    const move = (e) => { dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); };
    const STATES = { link: 2.0, cta: 2.4, cup: 3.1 };
    const over = (e) => {
      const t = e.target.closest('[data-cursor]');
      if (!t) return;
      gsap.to(ring, { scale: STATES[t.dataset.cursor] || 2, opacity: 0.9, duration: 0.4, ease: 'power3.out' });
      gsap.to(dot, { opacity: t.dataset.cursor === 'cup' ? 1 : 0, duration: 0.3 });
    };
    const out = (e) => {
      if (!e.target.closest('[data-cursor]')) return;
      gsap.to(ring, { scale: 1, opacity: 0.45, duration: 0.45, ease: 'power3.out' });
      gsap.to(dot, { opacity: 1, scale: 1, duration: 0.3 });
    };
    const down = () => gsap.to(ring, { scale: 0.8, duration: 0.2 });
    const up = () => gsap.to(ring, { scale: 1, duration: 0.3 });

    window.addEventListener('mousemove', move, { passive: true });
    document.addEventListener('mouseover', over);
    document.addEventListener('mouseout', out);
    window.addEventListener('mousedown', down);
    window.addEventListener('mouseup', up);
    return () => {
      window.removeEventListener('mousemove', move);
      document.removeEventListener('mouseover', over);
      document.removeEventListener('mouseout', out);
      window.removeEventListener('mousedown', down);
      window.removeEventListener('mouseup', up);
    };
  }, []);

  return (
    <>
      <div className="cursor" aria-hidden="true"><span className="cursor__dot" /></div>
      <div className="cursor-ring" aria-hidden="true" />
    </>
  );
}
