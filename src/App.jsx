import { useCallback, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { loadManifest } from './lib/frames';
import { setPaletteInstant } from './lib/palette';
import { FLAVORS, STORY_ORDER } from './data/flavors';
import { FlavorProvider } from './hooks/useFlavor';
import { useLenis, lenis } from './hooks/useLenis';

import Cursor from './components/Cursor';
import Loader from './components/Loader';
import Header from './components/Header';
import HeroStory from './components/HeroStory';
import Menu from './components/Menu';
import Community from './components/Community';
import Visit from './components/Visit';
import Footer from './components/Footer';
import StoreModal from './components/StoreModal';

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const [ready, setReady] = useState(false);   // manifest loaded
  const [done, setDone] = useState(false);     // loader finished
  useLenis(ready);

  useEffect(() => {
    /* key off STORY_ORDER, not a hard-coded id — renaming the lead drink
       silently blew up the whole app last time */
    setPaletteInstant(FLAVORS[STORY_ORDER[0]].palette);
    document.body.classList.add('is-loading');
    loadManifest().then(() => setReady(true));
  }, []);

  const onLoaderDone = useCallback(() => {
    document.body.classList.remove('is-loading');
    lenis()?.start();
    ScrollTrigger.refresh();
    setDone(true);
  }, []);

  return (
    <FlavorProvider>
      <div className="grain" aria-hidden="true" />
      <div className="ambient" aria-hidden="true">
        <span className="ambient__blob ambient__blob--a" />
        <span className="ambient__blob ambient__blob--b" />
      </div>
      <Cursor />
      {ready && !done && <Loader onDone={onLoaderDone} />}
      {ready && (
        <>
          <Header />
          <main id="top">
            <HeroStory />
            <Menu />
            <Community />
            <Visit />
          </main>
          <Footer />
          <StoreModal />
        </>
      )}
    </FlavorProvider>
  );
}
