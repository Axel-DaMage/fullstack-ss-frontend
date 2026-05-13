import { useEffect } from 'react';
import { eventEmitter } from './EventEmitter';

export function useEvent<T = unknown>(
  event: string,
  callback: (data: T) => void
) {
  useEffect(() => {
    const unsubscribe = eventEmitter.on(event, callback);
    return unsubscribe;
  }, [event, callback]);
}