import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { magnetic } from '../lib/reveal';
import { lenis } from '../hooks/useLenis';
import { storeLink, SHOP } from '../data/flavors';
import { openStoreSheet } from './StoreModal';

const LINKS = [
  { href: '#most-loved', label: 'Most Ordered' },
  { href: '#menu', label: 'Menu' },
  { href: '#visit', label: 'Visit' }
];

export default function Header() {
  const ref = useRef(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const header = ref.current;
    if (!header) return;

    const ctx = gsap.context(() => {
      magnetic(header.querySelector('.cta'), 0.34, 90);

      /* the monogram lifts a touch on hover — the only thing it does */
      const brand = header.querySelector('.brand');
      const mono = header.querySelector('.brand__mono');
      brand?.addEventListener('mouseenter', () =>
        gsap.to(mono, { y: -2, duration: 0.35, ease: 'power3.out' }));
      brand?.addEventListener('mouseleave', () =>
        gsap.to(mono, { y: 0, duration: 0.35, ease: 'power3.out' }));

      const hero = document.getElementById('hero');
      if (hero) {
        ScrollTrigger.create({
          trigger: hero,
          start: 'top+=80 top',
          onEnter: () => header.classList.add('is-stuck'),
          onLeaveBack: () => header.classList.remove('is-stuck')
        });
      }
    }, ref);

    /* smooth in-page nav through Lenis */
    const onClick = (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute('href');
      if (!id || id === '#') { e.preventDefault(); return; }
      e.preventDefault();
      const l = lenis();

      // "Most Loved" lives inside the pinned hero section, so it is a scroll
      // POSITION rather than an element — see window.__mostLovedY in HeroStory
      if (id === '#most-loved') {
        const y = window.__mostLovedY?.() ?? 0;
        if (l) l.scrollTo(y, { duration: 1.8 });
        else window.scrollTo({ top: y, behavior: 'smooth' });
        header.classList.remove('is-open');
        setOpen(false);
        return;
      }

      const t = document.querySelector(id);
      if (!t) return;
      if (l) l.scrollTo(t, { offset: -10, duration: 1.4 });
      else t.scrollIntoView({ behavior: 'smooth' });
      header.classList.remove('is-open');
      setOpen(false);
    };
    document.addEventListener('click', onClick);
    return () => { document.removeEventListener('click', onClick); ctx.revert(); };
  }, []);

  return (
    <header className="header" ref={ref}>
      <a className="brand" href="#top" data-cursor="link" aria-label={`${SHOP.name}, home`}>
        <span className="brand__mark" aria-hidden="true" />
        <span className="brand__sr">{SHOP.name}</span>
      </a>

      <nav className="nav" aria-label="Primary">
        {LINKS.map((l) => (
          <a className="nav__link" href={l.href} key={l.href} data-cursor="link">{l.label}</a>
        ))}
      </nav>

      <a className="cta" href={storeLink()} target="_blank" rel="noreferrer noopener" data-cursor="cta"
        onClick={(e) => { e.preventDefault(); openStoreSheet(); }}>
        <span className="cta__fill" />
        <span className="cta__label">Get the app</span>
      </a>

      {/* phone menu. The stylesheet always had a .burger rule but nothing
          ever rendered one, so below 760px the nav simply vanished. */}
      <button
        className="burger"
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => {
          const h = ref.current;
          const next = !h.classList.contains('is-open');
          h.classList.toggle('is-open', next);
          setOpen(next);
        }}
      >
        <span /><span /><span />
      </button>
    </header>
  );
}
