import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Enhancement only: content stays visible if observers or motion are unavailable.
export function PageMotion() {
  const { pathname } = useLocation();
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (preference.matches || !('IntersectionObserver' in window)) return;

    const elements = new Set<HTMLElement>();
    let sequence = 0;
    let frame = 0;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (!isIntersecting) return;
        target.classList.add('motion-visible');
        observer.unobserve(target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });

    const discover = () => {
      document.querySelectorAll<HTMLElement>([
        '.section-intro', '.process-list article', '.demo-copy', '.example-panel',
        '.capability-band > div', '.capability-band dl > div', '.audience-grid article',
        '.footer-cta', '.footer-columns > *', '.page-heading', '.metrics-grid .metric',
        '.dashboard-columns > *', '.analytics-grid > *', '.workspace-content > .panel',
        '.auth-story', '.auth-form-wrap',
      ].join(',')).forEach(element => {
        if (elements.has(element)) return;
        elements.add(element);
        element.style.setProperty('--reveal-delay', `${(sequence++ % 3) * 90}ms`);
        element.classList.add('motion-reveal');
        observer.observe(element);
      });
    };

    const updateScroll = () => {
      frame = 0;
      const hero = document.querySelector<HTMLElement>('.landing-hero');
      if (!hero) return;
      const progress = Math.min(1, Math.max(0, -hero.getBoundingClientRect().top / hero.offsetHeight));
      hero.style.setProperty('--hero-parallax', `${progress * 64}px`);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(updateScroll); };
    const mutations = new MutationObserver(discover);
    mutations.observe(document.getElementById('main-content') || document.body, { childList: true, subtree: true });
    discover();
    updateScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    const revealAll = () => {
      if (preference.matches) {
        elements.forEach(element => element.classList.add('motion-visible'));
        observer.disconnect();
        document.querySelector<HTMLElement>('.landing-hero')?.style.removeProperty('--hero-parallax');
        window.removeEventListener('scroll', onScroll);
      }
    };
    preference.addEventListener('change', revealAll);
    return () => {
      observer.disconnect();
      mutations.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      preference.removeEventListener('change', revealAll);
      elements.forEach(element => {
        element.classList.remove('motion-reveal', 'motion-visible');
        element.style.removeProperty('--reveal-delay');
      });
    };
  }, [pathname]);
  return null;
}
