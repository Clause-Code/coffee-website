import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

/* Smooth scrolling bridged into ScrollTrigger. Scroll stays locked until the
   loader finishes (see App.jsx). Native momentum is left alone on touch --
   syncing it fights the OS and feels worse than doing nothing. */
export function useLenis(enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const lenis = new Lenis({
      duration: 1.45,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: false,
      touchMultiplier: 1.5
    });
    window.__lenis = lenis;

    lenis.on('scroll', ScrollTrigger.update);
    const raf = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    lenis.stop();                        // released by the loader

    let t;
    const onResize = () => {
      clearTimeout(t);
      t = setTimeout(() => ScrollTrigger.refresh(), 260);
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      gsap.ticker.remove(raf);
      lenis.destroy();
      window.__lenis = null;
    };
  }, [enabled]);
}

export const lenis = () => window.__lenis;
