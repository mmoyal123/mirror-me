(() => {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  root.classList.add('motion-ready');

  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  progress.setAttribute('aria-hidden', 'true');
  progress.innerHTML = '<span></span>';
  document.body.appendChild(progress);
  const progressBar = progress.firstElementChild;

  const revealSelectors = [
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
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  const header = document.querySelector('.site-header');
  const parallaxImages = [...document.querySelectorAll('.home-hero img, .about-photo img, .approach-visual-media img')];
  let ticking = false;

  const updateScroll = () => {
    const y = window.scrollY || 0;
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    progressBar.style.transform = `scaleX(${Math.min(1, y / max)})`;
    if (header) header.classList.toggle('is-scrolled', y > 24);

    if (!reduceMotion && window.innerWidth > 900) {
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

  document.querySelectorAll('.mobile-menu a').forEach(link => {
    link.addEventListener('click', () => {
      const details = link.closest('details');
      if (details) details.open = false;
    });
  });
})();