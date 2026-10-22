import { useEffect, useState } from "react";

/**
 * True while the element is on screen (IntersectionObserver).
 * Used for infinite scroll: a sentinel below the grid loads the next page when it appears.
 *
 * Returns a callback ref instead of a ref object: the element often mounts later than the
 * component (e.g. after a loading skeleton), and a callback ref re-attaches the observer
 * whenever the element appears or changes. A useRef + useEffect version would miss that.
 */
export function useInView<TElement extends Element>(rootMargin = "200px") {
  const [element, setElement] = useState<TElement | null>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry?.isIntersecting ?? false);
      },
      { rootMargin },
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, [element, rootMargin]);

  return { ref: setElement, isInView };
}
