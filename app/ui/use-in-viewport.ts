import { type RefObject, useEffect } from "react";

type UseInViewport = (
  target: RefObject<HTMLElement>,
  callback: (entry: IntersectionObserverEntry) => void | Promise<void>,
) => void;

export const useInViewport: UseInViewport = (target, callback) => {
  useEffect(() => {
    if (target.current === null) {
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry === undefined) {
        return;
      }

      callback(entry);
    });

    observer.observe(target.current);

    return () => {
      observer.disconnect();
    };
  }, [callback, target.current]);
};
