'use client';
import { useState, useEffect, useRef } from 'react';

type PollingCallback = () => Promise<boolean>;

export const usePolling = (callback: PollingCallback, interval: number) => {
  const [isPolling, setIsPolling] = useState(false);
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);

  const startPolling = () => {
    setIsPolling(true);
  };

  const stopPolling = () => {
    setIsPolling(false);
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
    }
  };

  useEffect(() => {
    if (!isPolling) {
      return;
    }

    const poll = async () => {
      const shouldStop = await callback();
      if (shouldStop) {
        stopPolling();
      } else {
        timeoutIdRef.current = setTimeout(poll, interval);
      }
    };

    poll();

    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    };
  }, [isPolling, callback, interval]);

  return { startPolling, stopPolling, isPolling };
};
