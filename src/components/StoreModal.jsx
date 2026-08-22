import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ORDER } from '../data/flavors';

/* ══════════════════════════════════════════════════════════════════════
   StoreModal — the "Get the app" sheet, in The Yard's olive.

   Every "get the app" button on the site ignores the device it is on and
   ASKS instead: App Store or Google Play. One deep-olive panel, palm mark
   on top, two store cards. Opens via a window event so any CTA anywhere
   can raise it without prop-drilling.
   ══════════════════════════════════════════════════════════════════ */

export const openStoreSheet = () =>
  window.dispatchEvent(new CustomEvent('yard:store-sheet'));

export default function StoreModal() {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    const on = () => setOpen(true);
    window.addEventListener('yard:store-sheet', on);
    return () => window.removeEventListener('yard:store-sheet', on);
  }, []);

  useEffect(() => {
    if (!open) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      tl.fromTo(wrapRef.current,
        { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out' });
      tl.fromTo(panelRef.current,
        { yPercent: 9, scale: 0.9, opacity: 0 },
        { yPercent: 0, scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(1.55)' }, '<0.05');
      tl.fromTo('.ssheet__rise',
        { y: 18, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.45, stagger: 0.08, ease: 'power3.out' }, '<0.16');
    }, wrapRef);

    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    window.__lenis?.stop();

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      window.__lenis?.start();
      ctx.revert();
    };
  }, [open]);

  if (!open) return null;
  const close = () => setOpen(false);

  return (
    <div
      className="ssheet"
      ref={wrapRef}
      role="dialog"
      aria-modal="true"
      aria-label="Get the Drivu app"
      onClick={(e) => { if (e.target === wrapRef.current) close(); }}
    >
      <div className="ssheet__panel" ref={panelRef}>
        <span className="ssheet__halo" aria-hidden="true" />
        <button className="ssheet__x" onClick={close} aria-label="Close" data-cursor="link">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>

        <span className="ssheet__mark ssheet__rise" aria-hidden="true" />
        <h3 className="ssheet__title ssheet__rise">Get the Drivu app</h3>
        <p className="ssheet__sub ssheet__rise">
          Ordering at The Yard happens on Drivu — order ahead,
          skip the wait, collect your stamps.
        </p>

        <div className="ssheet__row">
          <a className="ssheet__btn ssheet__rise" href={ORDER.ios}
            target="_blank" rel="noreferrer noopener" data-cursor="cta" onClick={close}>
            <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
              <path d="M16.4 12.7c0-2.1 1.7-3.1 1.8-3.2-1-1.4-2.5-1.6-3-1.7-1.3-.1-2.5.8-3.1.8s-1.6-.8-2.7-.7c-1.4 0-2.7.8-3.4 2-1.4 2.5-.4 6.2 1 8.2.7 1 1.5 2.1 2.5 2 1-.1 1.4-.6 2.6-.6s1.5.6 2.6.6 1.8-1 2.4-2c.8-1.1 1.1-2.2 1.1-2.3 0 0-2.1-.8-2.1-3.1zM14.5 5.9c.6-.7 1-1.6.9-2.6-.8 0-1.8.6-2.4 1.3-.5.6-1 1.6-.9 2.5.9.1 1.8-.4 2.4-1.2z" />
            </svg>
            <span>App Store</span>
            <em>iPhone &amp; iPad</em>
          </a>
          <a className="ssheet__btn ssheet__rise" href={ORDER.android}
            target="_blank" rel="noreferrer noopener" data-cursor="cta" onClick={close}>
            <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
              <path d="M3.6 2.2a1 1 0 0 0-.4.8v18a1 1 0 0 0 .4.8l10-9.8-10-9.8zm11.3 8.6 2.9-2.9-9.6-5.4 6.7 8.3zm0 2.4-6.7 8.3 9.6-5.4-2.9-2.9zm4.3-1.2-2.3-1.3-3 3 3 3 2.3-1.3c.8-.5.8-1.9 0-2.4z" />
            </svg>
            <span>Google Play</span>
            <em>Android</em>
          </a>
        </div>

        <p className="ssheet__foot ssheet__rise">Free · iOS &amp; Android</p>
      </div>
    </div>
  );
}
