import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ORDER } from '../data/flavors';
import { assetV } from '../lib/frames';

/* ══════════════════════════════════════════════════════════════════════
   CupModal — the "get it on the app" sheet.

   This used to be an add-to-cart panel with sizes, milks and a price. The
   Yard does not sell through this site: every order goes through the Drivu
   app, which is where the live menu and price live. So the sheet now does
   one job — show you the drink, then hand you to the app.
   ══════════════════════════════════════════════════════════════════ */

export default function CupModal({ item, onClose }) {
  const wrapRef = useRef(null);
  const panelRef = useRef(null);
  const cupRef = useRef(null);

  useEffect(() => {
    if (!item) return;
    const wrap = wrapRef.current;
    const panel = panelRef.current;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      tl.fromTo(wrap, { opacity: 0 }, { opacity: 1, duration: 0.32, ease: 'power2.out' });
      tl.fromTo(panel,
        { yPercent: 6, scale: 0.94, opacity: 0 },
        { yPercent: 0, scale: 1, opacity: 1, duration: 0.55, ease: 'back.out(1.4)' }, '<0.04');
      tl.fromTo(cupRef.current,
        { yPercent: 14, scale: 0.86, opacity: 0, rotation: -6 },
        { yPercent: 0, scale: 1, opacity: 1, rotation: 0, duration: 0.7, ease: 'back.out(1.5)' }, '<0.08');
      tl.fromTo('.cmodal__row',
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.45, ease: 'power3.out', stagger: 0.07 }, '<0.18');
    }, wrapRef);

    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    window.__lenis?.stop();

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      window.__lenis?.start();
      ctx.revert();
    };
  }, [item, onClose]);

  if (!item) return null;

  return (
    <div
      className="cmodal"
      ref={wrapRef}
      role="dialog"
      aria-modal="true"
      aria-label={item.name}
      onClick={(e) => { if (e.target === wrapRef.current) onClose(); }}
    >
      <div className="cmodal__panel" ref={panelRef}>
        <button className="cmodal__x" onClick={onClose} aria-label="Close" data-cursor="link">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>

        <div className="cmodal__art">
          {item.img
            ? <img ref={cupRef} src={`${import.meta.env.BASE_URL}${item.img}${assetV()}`} alt={item.name} />
            : <span className="cmodal__mark" ref={cupRef} aria-hidden="true" />}
        </div>

        <div className="cmodal__info">
          <span className="cmodal__eyebrow">{item.cat} · made to order</span>
          <h3 className="cmodal__name">{item.name}</h3>
          {item.d && <p className="cmodal__desc">{item.d}</p>}

          <div className="cmodal__row">
            <p className="cmodal__note">
              Ordering happens in the Drivu app — that is where the live menu,
              the price and your loyalty stamps live.
            </p>
          </div>

          <div className="cmodal__row storerow">
            <a className="storebtn" href={ORDER.ios} target="_blank" rel="noreferrer noopener" data-cursor="cta">
              <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
                <path d="M16.4 12.7c0-2.1 1.7-3.1 1.8-3.2-1-1.4-2.5-1.6-3-1.7-1.3-.1-2.5.8-3.1.8s-1.6-.8-2.7-.7c-1.4 0-2.7.8-3.4 2-1.4 2.5-.4 6.2 1 8.2.7 1 1.5 2.1 2.5 2 1-.1 1.4-.6 2.6-.6s1.5.6 2.6.6 1.8-1 2.4-2c.8-1.1 1.1-2.2 1.1-2.3 0 0-2.1-.8-2.1-3.1zM14.5 5.9c.6-.7 1-1.6.9-2.6-.8 0-1.8.6-2.4 1.3-.5.6-1 1.6-.9 2.5.9.1 1.8-.4 2.4-1.2z" />
              </svg>
              <span><em>Download on the</em>App Store</span>
            </a>
            <a className="storebtn" href={ORDER.android} target="_blank" rel="noreferrer noopener" data-cursor="cta">
              <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
                <path d="M3.6 2.2a1 1 0 0 0-.4.8v18a1 1 0 0 0 .4.8l10-9.8-10-9.8zm11.3 8.6 2.9-2.9-9.6-5.4 6.7 8.3zm0 2.4-6.7 8.3 9.6-5.4-2.9-2.9zm4.3-1.2-2.3-1.3-3 3 3 3 2.3-1.3c.8-.5.8-1.9 0-2.4z" />
              </svg>
              <span><em>Get it on</em>Google Play</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
