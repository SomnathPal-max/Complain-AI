import { useEffect, useRef, useState } from 'react';

export function AnimatedNumber({ value }: { value: number | string }) {
  const element = useRef<HTMLSpanElement>(null);
  const previous = useRef(0);
  const [visible, setVisible] = useState(false);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (!element.current || !('IntersectionObserver' in window)) { setVisible(true); return; }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); observer.disconnect(); }
    });
    observer.observe(element.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (typeof value !== 'number' || !visible || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(value);
      return;
    }
    const from = previous.current;
    const started = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - started) / 850);
      setDisplay(Math.round(from + (value - from) * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = requestAnimationFrame(tick);
      else previous.current = value;
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, visible]);

  return <span ref={element} className="animated-number"><span aria-hidden="true">{display}</span><span className="sr-only">{value}</span></span>;
}
