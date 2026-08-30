import { useState, useEffect, useRef } from 'react';

/**
 * Returns a throttled version of a value that updates at most once every `limit` milliseconds.
 */
export function useThrottle<T>(value: T, limit = 300): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastRan = useRef<number>(Date.now());

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, Math.max(0, limit - (Date.now() - lastRan.current)));

    return () => {
      clearTimeout(handler);
    };
  }, [value, limit]);

  return throttledValue;
}
