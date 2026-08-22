import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { assetV } from '../lib/frames';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FLAVORS, STORY_ORDER, storeLink } from '../data/flavors';
import { openStoreSheet } from './StoreModal';
import { MENU_CATEGORIES } from '../data/menu';
import { lenis } from '../hooks/useLenis';
import CupModal from './CupModal';

/* ══════════════════════════════════════════════════════════════════════
   Section 3 — "Everything we make".

   The WHOLE menu lives here: 9 categories, 73 items, laid out in one
   continuous horizontal shelf that vertical scrolling pans through. The
   category bar is a live index — it highlights whichever block is under
   the left edge, and clicking a chip converts that block's x position back
   into a scroll position and glides there.

   Cold Drinks comes first because the cup that flies in from section two
   is the Acai Smoothie, and Acai leads Cold Drinks — so the flight always
   has a target sitting at pan position zero.

   The pan now runs on touch too, explicitly at the client's request:
   vertical thumb-scroll pans the shelf horizontally on phones and
   tablets, exactly like the desktop wheel does.
   ══════════════════════════════════════════════════════════════════ */

/* the pan is geared slightly faster than the scroll — at 1:1 the whole
   board costs almost seven screens of wheel, which is too much. On small
   screens the cards are wider relative to the viewport, so the gear is
   tightened to keep the whole trip near five screens of thumb. */
const GEAR = () => (window.matchMedia('(max-width: 1024px)').matches ? 0.55 : 0.72);

export default function Menu() {
  const ref = useRef(null);
  const pinRef = useRef(null);
  const trackRef = useRef(null);
  const flyerRef = useRef(null);
  const slotRef = useRef(null);
  const barRef = useRef(null);
  const stRef = useRef(null);
  const groupRefs = useRef({});
  const [open, setOpen] = useState(null);
  const [landed, setLanded] = useState(false);
  const landedRef = useRef(false);
  const [active, setActive] = useState(MENU_CATEGORIES[0].id);


  useEffect(() => {
    const touch = window.matchMedia('(hover: none)').matches;

    const ctx = gsap.context(() => {
      /* ── the horizontal pan ── */
      const dist = () =>
        Math.max(0, trackRef.current.scrollWidth - window.innerWidth + 60);

      const build = () => {
        stRef.current?.kill();
        gsap.set(trackRef.current, { x: 0 });
        if (dist() <= 0) return;
        const tween = gsap.to(trackRef.current, { x: () => -dist(), ease: 'none' });
        stRef.current = ScrollTrigger.create({
          trigger: ref.current,
          start: 'top top',
          end: () => '+=' + dist() * GEAR(),
          pin: pinRef.current,
          scrub: 0.8,
          animation: tween,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            /* which category is under the left edge right now */
            const x = self.progress * dist();
            let id = MENU_CATEGORIES[0].id;
            for (const c of MENU_CATEGORIES) {
              const el = groupRefs.current[c.id];
              if (el && el.offsetLeft - 140 <= x) id = c.id;
            }
            setActive(id);
          }
        });
      };
      build();
      window.__menuRebuild = build;

      gsap.from('.menu__title', {
        yPercent: 40, opacity: 0, duration: 1, ease: 'expo.out',
        scrollTrigger: { trigger: ref.current, start: 'top 70%' }
      });

      if (!touch) {
        gsap.utils.toArray('.mcard').forEach((card) => {
          const img = card.querySelector('img');
          const over = card.querySelector('.mcard__over');
          card.addEventListener('mouseenter', () => {
            if (img) gsap.to(img, { scale: 1.07, duration: 0.7, ease: 'power3.out' });
            if (over) gsap.to(over, { yPercent: 0, duration: 0.5, ease: 'power3.out' });
          });
          card.addEventListener('mouseleave', () => {
            if (img) gsap.to(img, { scale: 1, duration: 0.7, ease: 'power3.out' });
            if (over) gsap.to(over, { yPercent: 101, duration: 0.4, ease: 'power3.in' });
          });
        });
      }

      /* ── the cup flight ────────────────────────────────────────────
         The ORIGIN is computed, never measured off the live cup inside
         onEnter: ScrollTrigger skips onEnter on a fast jump, and section
         two's eased scrub means the cup may not have settled, so a measured
         origin came out stale and the cup started from the wrong side. The
         flyer writes x/y/scale straight from the scrub rather than easing
         width/height on top of it — that double-smoothing was the flinch. */
      const flyer = flyerRef.current;
      const slot = slotRef.current;
      if (!flyer || !slot) return;

      const storyCup = () => document.querySelectorAll('.scup')[1];
      const AR = FLAVORS[STORY_ORDER[STORY_ORDER.length - 1]].ar;

      const originRect = () => {
        const r = window.__storyCupRect?.();
        if (r && r.width) return r;
        const marker = document.querySelector('.cupslot');
        const pinEl = document.querySelector('.herostory__pin');
        if (marker && pinEl && marker.offsetWidth) {
          let ox = 0, oy = 0, n = marker;
          while (n && n !== pinEl && n.offsetParent) {
            ox += n.offsetLeft; oy += n.offsetTop; n = n.offsetParent;
          }
          return { left: ox, top: oy, width: marker.offsetWidth, height: marker.offsetHeight };
        }
        const h = window.innerHeight * 0.5;
        return { left: (window.innerWidth - h * AR) / 2, top: window.innerHeight * 0.22,
                 width: h * AR, height: h };
      };

      /* the box the card ACTUALLY paints its cup into: slot minus padding,
         then letterboxed by object-fit: contain */
      const drawnBox = () => {
        const r = slot.getBoundingClientRect();
        const cs = getComputedStyle(slot);
        const pt = parseFloat(cs.paddingTop) || 0;
        const pb = parseFloat(cs.paddingBottom) || 0;
        const pl = parseFloat(cs.paddingLeft) || 0;
        const pr = parseFloat(cs.paddingRight) || 0;
        const bw = r.width - pl - pr;
        const bh = r.height - pt - pb;
        let w = bw, h = bw / AR;
        if (h > bh) { h = bh; w = bh * AR; }
        return { left: r.left + pl + (bw - w) / 2, top: r.top + pt + (bh - h) / 2,
                 width: w, height: h };
      };

      let from = originRect();
      const sizeFlyer = () => {
        from = originRect();
        flyer.style.width = from.width + 'px';
        flyer.style.height = from.height + 'px';
      };
      sizeFlyer();

      const place = (p) => {
        const to = drawnBox();
        if (!from.width || !to.width) return;
        const e = gsap.parseEase('power2.inOut')(gsap.utils.clamp(0, 1, p));
        const w = from.width + (to.width - from.width) * e;
        gsap.set(flyer, {
          x: from.left + (to.left - from.left) * e,
          y: from.top + (to.top - from.top) * e,
          scale: w / from.width,
          transformOrigin: 'top left',
          opacity: 1
        });
      };

      const showCup = (on) => {
        const sc = storyCup();
        if (sc) gsap.set(sc, { opacity: on ? 1 : 0 });
      };

      ScrollTrigger.create({
        trigger: ref.current,
        start: 'top bottom',
        end: 'top top',
        scrub: true,
        invalidateOnRefresh: true,
        onRefresh: sizeFlyer,
        onEnter: () => { showCup(false); flyer.style.display = 'block'; setLanded(false); },
        onLeaveBack: () => {
          showCup(true);
          gsap.killTweensOf(flyer);
          flyer.style.display = 'none';
          setLanded(false);
        },
        onUpdate: (self) => {
          if (self.progress > 0 && self.progress < 1) {
            if (flyer.style.display !== 'block') {
              showCup(false);
              flyer.style.display = 'block';
            }
            if (landedRef.current) { landedRef.current = false; setLanded(false); }
          }
          place(self.progress);
        },
        onLeave: () => {
          landedRef.current = true;
          setLanded(true);
          gsap.to(flyer, {
            opacity: 0, duration: 0.18, ease: 'power2.out',
            onComplete: () => { flyer.style.display = 'none'; }
          });
        },
        onEnterBack: () => {
          gsap.killTweensOf(flyer);
          landedRef.current = false;
          setLanded(false);
          showCup(false);
          flyer.style.display = 'block';
          gsap.set(flyer, { opacity: 1 });
        }
      });
    }, ref);

    return () => { stRef.current?.kill(); ctx.revert(); };
  }, []);

  /* keep the active chip inside the (scrollable) bar. NOT scrollIntoView:
     that scrolls EVERY overflow-hidden ancestor too, and the board itself
     is one now — it dragged the headline under the board's rounded edge. */
  useEffect(() => {
    const bar = barRef.current?.querySelector('.catbar__inner');
    const chip = barRef.current?.querySelector('.catchip.is-on');
    if (!bar || !chip) return;
    const target =
      chip.getBoundingClientRect().left - bar.getBoundingClientRect().left +
      bar.scrollLeft - (bar.clientWidth - chip.offsetWidth) / 2;
    bar.scrollTo({ left: target, behavior: 'smooth' });
  }, [active]);

  /* a chip click is a horizontal position — convert it back into the scroll
     position that produces that pan, and glide there */
  const jumpTo = (id) => {
    const el = groupRefs.current[id];
    const track = trackRef.current;
    if (!el || !track) return;

    const st = stRef.current;
    if (!st) {                                   // touch: native swipe
      track.scrollTo({ left: Math.max(0, el.offsetLeft - 16), behavior: 'smooth' });
      setActive(id);
      return;
    }
    const dist = Math.max(0, track.scrollWidth - window.innerWidth + 60);
    if (!dist) return;
    const p = gsap.utils.clamp(0, 1, (el.offsetLeft - 24) / dist);
    const y = st.start + (st.end - st.start) * p;
    const l = lenis();
    if (l) l.scrollTo(y, { duration: 1.1 });
    else window.scrollTo({ top: y, behavior: 'smooth' });
  };

  return (
    <section className="menu" id="menu" ref={ref}>
      {/* the travelling cup — fixed, so it stays put while the page scrolls */}
      <img
        className="cupflyer"
        ref={flyerRef}
        src={`${import.meta.env.BASE_URL}${FLAVORS[STORY_ORDER[STORY_ORDER.length - 1]].still}${assetV()}`}
        alt=""
        aria-hidden="true"
      />

      <div className="menu__pin" ref={pinRef}>
        <div className="menu__head">
          <div className="menu__headline">
            <h2 className="menu__title">Everything <em>we make</em></h2>
          </div>

          <nav className="catbar" ref={barRef} aria-label="Menu categories">
            <div className="catbar__inner">
              {MENU_CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  aria-current={active === c.id}
                  className={`catchip${active === c.id ? ' is-on' : ''}`}
                  data-cursor="link"
                  onClick={() => jumpTo(c.id)}
                >
                  {c.name}<em>{c.items.length}</em>
                </button>
              ))}
            </div>
          </nav>
        </div>

        <div className="menu__track" ref={trackRef}>
          {MENU_CATEGORIES.map((c) => (
            <div
              className="mgroup"
              key={c.id}
              ref={(el) => { groupRefs.current[c.id] = el; }}
            >
              <h3 className="mgroup__title"><span>{c.name}</span><i>{c.items.length}</i></h3>
              <div className="mshelf">
                {c.items.map((it) => {
                  const isTarget = c.id === MENU_CATEGORIES[0].id && it.n === c.items[0].n;
                  return (
                    <article
                      className="mcard"
                      key={c.id + it.n}
                      data-cursor="cup"
                      onClick={() => setOpen({ name: it.n, d: it.d, img: it.img, cat: c.name })}
                    >
                      <div className="mcard__img" ref={isTarget ? slotRef : null}>
                        {it.img
                          ? ((!isTarget || landed) && (
                              <img src={`${import.meta.env.BASE_URL}${it.img}${assetV()}`}
                                alt={it.n} loading="lazy" decoding="async" />
                            ))
                          : <span className="mcard__mark" aria-hidden="true" />}
                        {it.d && <div className="mcard__over"><p>{it.d}</p></div>}
                      </div>
                      <div className="mcard__foot">
                        <span className="mcard__name">{it.n}</span>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="mgroup mgroup--end">
            <a className="menu__cta" href={storeLink()} target="_blank" rel="noreferrer noopener" data-cursor="cta"
              onClick={(e) => { e.preventDefault(); openStoreSheet(); }}>
              <span>Order the whole thing<br />on the app →</span>
            </a>
          </div>
        </div>
      </div>

      <CupModal item={open} onClose={() => setOpen(null)} />
    </section>
  );
}
