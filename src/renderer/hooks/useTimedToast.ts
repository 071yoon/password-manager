import * as React from 'react';

type ToastType = 'success' | 'error';

type UseTimedToastArgs = {
  duration?: number;
};

export function useTimedToast({ duration = 1400 }: UseTimedToastArgs = {}) {
  const [message, setMessage] = React.useState('');
  const [type, setType] = React.useState<ToastType>('success');
  const timerRef = React.useRef<number | null>(null);

  const showToast = React.useCallback(
    (nextMessage: string, nextType: ToastType = 'success') => {
      setMessage(nextMessage);
      setType(nextType);
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = window.setTimeout(() => {
        setMessage('');
        timerRef.current = null;
      }, duration);
    },
    [duration],
  );

  React.useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return {
    message,
    type,
    showToast,
  } as const;
}
