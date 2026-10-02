(() => {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  root.classList.add('motion-ready');

  const home = document.body.classList.contains('page-home');
  const openingFilm = document.querySelector('.mm-opening-film');

  const playSignatureIntro = (force = false) => {
    let seen = false;
    try { seen = sessionStorage.getItem('mmIntroSeen') === '1'; } catch (_) {}
    if (seen && !force) {
      document.body.classList.remove('intro-lock');
      return;
    }

    const intro = document.createElement('div');
    intro.className = 'mm-intro';
    intro.setAttribute('aria-hidden', 'true');
    intro.innerHTML = '<div class="mm-intro-word">MIRROR ME</div><span class="mm-intro-rule"></span>';
    document.body.prepend(intro);
    document.body.classList.add('intro-lock');
    requestAnimationFrame(() => intro.classList.add('is-active'));
    window.setTimeout(() => intro.classList.add('is-leaving'), 820);
    window.setTimeout(() => {
      intro.remove();
      document.body.classList.remove('intro-lock');
    }, 1420);
    try { sessionStorage.setItem('mmIntroSeen', '1'); } catch (_) {}
  };

  if (home && !reduceMotion) {
    let filmSeen = false;
    try { filmSeen = sessionStorage.getItem('mmOpeningFilmSeen') === '1'; } catch (_) {}

    if (openingFilm && !filmSeen) {
      const video = openingFilm.querySelector('.mm-opening-film-video');
      const startButton = openingFilm.querySelector('.mm-opening-film-start');
      const skipButton = openingFilm.querySelector('.mm-opening-film-skip');
      let finished = false;
      document.body.classList.add('intro-lock');

      const finishFilm = () => {
        if (finished) return;
        finished = true;
        try { sessionStorage.setItem('mmOpeningFilmSeen', '1'); } catch (_) {}
        playSignatureIntro(true);
        openingFilm.classList.add('is-leaving');
        window.setTimeout(() => openingFilm.remove(), 560);
      };

      const showSoundGate = () => {
        openingFilm.classList.add('needs-gesture');
        if (startButton) startButton.hidden = false;
      };

      const playWithSound = () => {
        if (!video) {
          finishFilm();
          return;
        }
        video.muted = false;
        video.volume = 1;
        const playback = video.play();
        if (playback && typeof playback.then === 'function') {
          playback.then(() => {
            openingFilm.classList.remove('needs-gesture');
            if (startButton) startButton.hidden = true;
          }).catch(showSoundGate);
        }
      };

      if (video) {
        video.addEventListener('ended', finishFilm, { once: true });
        video.addEventListener('error', finishFilm, { once: true });
      }
      if (startButton) {
        startButton.addEventListener('click', playWithSound);
      }
      if (skipButton) {
        skipButton.addEventListener('click', finishFilm);
      }

      requestAnimationFrame(playWithSound);
      window.setTimeout(() => {
        if (!finished && video && video.paused) showSoundGate();
      }, 900);
    } else {
      if (openingFilm) openingFilm.remove();
      playSignatureIntro(false);
    }
  } else {
    if (openingFilm) openingFilm.remove();
  }


  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  progress.setAttribute('aria-hidden', 'true');
  progress.innerHTML = '<span></span>';
  document.body.appendChild(progress);
  const progressBar = progress.firstElementChild;

  const pageClassForSpine = [...document.body.classList].find(c => c.startsWith('page-'));
  const spineLabels = {
    'page-explorations': 'EXPLORATIONS / MIRROR ME',
    'page-approach': 'APPROCHE / MIRROR ME',
    'page-coaching': 'COACHING / MIRROR ME',
    'page-about': 'MICKAËL MOYAL / MIRROR ME',
    'page-resources': 'RESSOURCES / MIRROR ME',
    'page-sources': 'SOURCES / MIRROR ME',
    'page-distinctions': 'DISTINCTIONS / MIRROR ME'
  };
  if (spineLabels[pageClassForSpine] && window.innerWidth > 1100) {
    const spine = document.createElement('div');
    spine.className = 'editorial-spine';
    spine.setAttribute('aria-hidden', 'true');
    spine.innerHTML = '<span>' + spineLabels[pageClassForSpine] + '</span><i></i><em>PARIS</em>';
    document.body.appendChild(spine);
  }

  const revealSelectors = [
    '.home-hero-meta > *',
    '.home-hero-copy > *',
    '.page-hero > .wrap > *',
    '.section-head > *',
    '.home-question .question',
    '.home-question .answer',
    '.lens-card',
    '.explore-card',
    '.inquiry',
    '.offer',
    '.actor-card',
    '.resource-card',
    '.concept-line',
    '.statement',
    '.section.dark .copy',
    '.about-photo',
    '.approach-visual-media',
    '.about-copy > *',
    '.approach-visual-copy > *'
  ];

  const revealEls = [...new Set(revealSelectors.flatMap(s => [...document.querySelectorAll(s)]))];
  revealEls.forEach((el, i) => {
    el.classList.add('will-reveal');
    el.style.setProperty('--reveal-order', i % 8);
  });

  if (!reduceMotion && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -9% 0px', threshold: 0.08 });
    revealEls.forEach(el => observer.observe(el));
    // The title mask has no painted intersection until it opens. The service
    // link also sits below the observer's bottom margin on the opening shot.
    // Reveal these first-screen elements independently.
    requestAnimationFrame(() => {
      document.querySelectorAll('.home-hero-copy h1, .home-hero-copy .hero-service-link, .page-hero h1').forEach(el => {
        el.classList.add('is-visible');
        observer.unobserve(el);
      });
    });
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  const header = document.querySelector('.site-header');
  const homeHero = document.querySelector('.home-hero');
  const heroCopy = document.querySelector('.home-hero-copy');
  const heroMeta = document.querySelector('.home-hero-meta');
  const parallaxImages = [...document.querySelectorAll('.home-hero img, .about-photo img, .approach-visual-media img')];
  let ticking = false;

  const updateScroll = () => {
    const y = window.scrollY || 0;
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    progressBar.style.transform = `scaleX(${Math.min(1, y / max)})`;
    if (header) header.classList.toggle('is-scrolled', y > 24);
    document.body.classList.toggle('has-scrolled', y > 90);

    if (!reduceMotion && window.innerWidth > 900) {
      if (homeHero && heroCopy && y < window.innerHeight * 1.15) {
        const hp = Math.min(1, y / (window.innerHeight * .82));
        heroCopy.style.setProperty('--hero-copy-y', `${hp * -34}px`);
        heroCopy.style.setProperty('--hero-copy-opacity', `${1 - hp * .42}`);
        if (heroMeta) {
          heroMeta.style.setProperty('--hero-meta-y', `${hp * -14}px`);
          heroMeta.style.setProperty('--hero-meta-opacity', `${1 - hp * .58}`);
        }
        homeHero.style.setProperty('--hero-shade', `${.67 + hp * .08}`);
      }

      parallaxImages.forEach(img => {
        const frame = img.parentElement.getBoundingClientRect();
        const vh = window.innerHeight;
        if (frame.bottom > 0 && frame.top < vh) {
          const centerDelta = (frame.top + frame.height / 2 - vh / 2) / vh;
          img.style.setProperty('--parallax-y', `${centerDelta * -24}px`);
        }
      });
    }
    ticking = false;
  };

  const requestTick = () => {
    if (!ticking) {
      requestAnimationFrame(updateScroll);
      ticking = true;
    }
  };

  window.addEventListener('scroll', requestTick, { passive: true });
  window.addEventListener('resize', requestTick, { passive: true });
  requestTick();

  if (!reduceMotion && window.matchMedia('(pointer:fine)').matches) {
    document.querySelectorAll('.section.dark, .approach-visual').forEach(section => {
      section.addEventListener('pointermove', e => {
        const r = section.getBoundingClientRect();
        section.style.setProperty('--pointer-x', `${e.clientX - r.left}px`);
        section.style.setProperty('--pointer-y', `${e.clientY - r.top}px`);
      }, { passive: true });
    });
  }



  if (!home && window.innerWidth > 900) {
    const chapterPages = document.body.matches('.page-explorations, .page-distinctions, .page-sources');
    const scenes = chapterPages
      ? [...document.querySelectorAll('.page-hero, .inquiry')]
      : [...document.querySelectorAll('.page-hero, .about-hero, .approach-visual, main > .section')];

    if (scenes.length > 1) {
      const rail = document.createElement('div');
      rail.className = 'scene-counter';
      rail.setAttribute('aria-hidden', 'true');
      rail.innerHTML = '<span class="scene-current">01</span><i></i><span class="scene-total">' +
        String(scenes.length).padStart(2, '0') + '</span><em>MIRROR ME</em>';
      document.body.appendChild(rail);
      const current = rail.querySelector('.scene-current');

      const sceneObserver = new IntersectionObserver((entries) => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a,b) => Math.abs(a.boundingClientRect.top - innerHeight * .34) - Math.abs(b.boundingClientRect.top - innerHeight * .34))[0];
        if (visible) {
          const idx = scenes.indexOf(visible.target) + 1;
          const next = String(idx).padStart(2, '0');
          if (current.textContent !== next) {
            current.classList.add('is-changing');
            window.setTimeout(() => {
              current.textContent = next;
              current.classList.remove('is-changing');
            }, 110);
          }
          rail.classList.add('is-active');
        }
      }, { rootMargin: '-18% 0px -52% 0px', threshold: 0 });

      scenes.forEach(scene => sceneObserver.observe(scene));
    }
  }

  const pageClass = [...document.body.classList].find(c => c.startsWith('page-'));
  const pageMap = {
    'page-home': '/',
    'page-explorations': '/explorations/',
    'page-approach': '/approche/',
    'page-coaching': '/coaching/',
    'page-about': '/mickael/',
    'page-resources': '/ressources/',
    'page-sources': '/sources/',
    'page-distinctions': '/distinctions/'
  };
  const currentPath = pageMap[pageClass];
  if (currentPath) {
    document.querySelectorAll('.nav-links a, .mobile-panel a').forEach(link => {
      const href = link.getAttribute('href');
      if (href === currentPath) link.setAttribute('aria-current', 'page');
    });
  }


  if (!reduceMotion) {
    const wipe = document.createElement('div');
    wipe.className = 'page-wipe';
    wipe.setAttribute('aria-hidden', 'true');
    document.body.appendChild(wipe);

    document.querySelectorAll('a[href]').forEach(link => {
      link.addEventListener('click', e => {
        const href = link.getAttribute('href');
        if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
        if (link.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

        let url;
        try { url = new URL(link.href, location.href); } catch (_) { return; }
        if (url.origin !== location.origin) return;
        if (url.pathname === location.pathname && url.hash) return;

        e.preventDefault();
        document.body.classList.add('page-is-leaving');
        wipe.classList.add('is-active');
        window.setTimeout(() => { location.href = url.href; }, 310);
      });
    });
  }

  document.querySelectorAll('.mobile-menu a').forEach(link => {
    link.addEventListener('click', () => {
      const details = link.closest('details');
      if (details) details.open = false;
    });
  });
})();
