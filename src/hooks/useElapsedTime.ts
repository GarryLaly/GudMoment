import { useState, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { formatElapsedTime, calculateElapsedTime, getRefreshInterval } from '../utils/timeCalculator';

export function useElapsedTime(dateStr: string, timeStr: string | null): string {
  const [formatted, setFormatted] = useState(() => {
    const d = timeStr ? `${dateStr}T${timeStr}Z` : `${dateStr}T00:00:00Z`;
    return formatElapsedTime(new Date(d));
  });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const getMomentDate = () => {
      const d = timeStr ? `${dateStr}T${timeStr}Z` : `${dateStr}T00:00:00Z`;
      return new Date(d);
    };

    const update = () => {
      const past = getMomentDate();
      setFormatted(formatElapsedTime(past));
      return past;
    };

    const startTimer = () => {
      const past = update();
      const elapsed = calculateElapsedTime(past);
      const interval = getRefreshInterval(elapsed);
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(update, interval);
    };

    startTimer();

    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') startTimer();
      else if (intervalRef.current) clearInterval(intervalRef.current);
    });

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      sub.remove();
    };
  }, [dateStr, timeStr]);

  return formatted;
}
