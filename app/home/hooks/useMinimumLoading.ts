// path: app/home/hooks/useMinimumLoading.ts

import { useState, useEffect } from "react";

export function useMinimumLoading(
  loading: boolean,
  minDuration: number = 300,
): boolean {
  const [displayLoading, setDisplayLoading] = useState(loading);

  useEffect(() => {
    if (loading) {
      setDisplayLoading(true);
    } else {
      const timer = setTimeout(() => {
        setDisplayLoading(false);
      }, minDuration);

      return () => clearTimeout(timer);
    }
  }, [loading, minDuration]);

  return displayLoading;
}
