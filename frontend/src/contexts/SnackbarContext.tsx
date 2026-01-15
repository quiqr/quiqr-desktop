import { createContext, useContext, useState, useCallback, useEffect, ReactNode, useRef } from 'react';
import { SnackMessage, uiServiceSchemas } from '../../types';
import { validateServiceResponse } from '../utils/validation';

interface SnackbarContextValue {
  currentSnackMessage: SnackMessage | undefined;
  previousSnackMessage: SnackMessage | undefined;
  addSnackMessage: (
    message: string,
    options: Omit<SnackMessage, 'message'>
  ) => void;
  reportSnackDismiss: () => void;
}

const SnackbarContext = createContext<SnackbarContextValue | null>(null);

interface SnackbarProviderProps {
  children: ReactNode;
}

export function SnackbarProvider({ children }: SnackbarProviderProps) {
  const [queue, setQueue] = useState<SnackMessage[]>([]);
  const [current, setCurrent] = useState<SnackMessage | undefined>(undefined);
  const [previous, setPrevious] = useState<SnackMessage | undefined>(undefined);
  const processingRef = useRef(false);

  const addSnackMessage = useCallback((
    message: string,
    { severity, action, onActionClick, autoHideDuration = 3000 }: Omit<SnackMessage, 'message'>
  ) => {
    const snackMessage: SnackMessage = {
      message,
      severity,
      action,
      onActionClick,
      autoHideDuration
    };
    setQueue(prev => [...prev, snackMessage]);
  }, []);

  const reportSnackDismiss = useCallback(() => {
    setPrevious(current);
    setCurrent(undefined);
    processingRef.current = false;
  }, [current]);

  useEffect(() => {
    if (!current && queue.length > 0 && !processingRef.current) {
      processingRef.current = true;
      const nextMessage = queue[0];
      setQueue(prev => prev.slice(1));
      setCurrent(nextMessage);
    }
  }, [current, queue]);

  const getCurrentSnackMessage = useCallback(() => {
    return validateServiceResponse(
      'getCurrentSnackMessage',
      uiServiceSchemas.getCurrentSnackMessage,
      current
    );
  }, [current]);

  const getPreviousSnackMessage = useCallback(() => {
    return validateServiceResponse(
      'getPreviousSnackMessage',
      uiServiceSchemas.getPreviousSnackMessage,
      previous
    );
  }, [previous]);

  const value: SnackbarContextValue = {
    currentSnackMessage: getCurrentSnackMessage(),
    previousSnackMessage: getPreviousSnackMessage(),
    addSnackMessage,
    reportSnackDismiss
  };

  return (
    <SnackbarContext.Provider value={value}>
      {children}
    </SnackbarContext.Provider>
  );
}

export function useSnackbar(): SnackbarContextValue {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  return context;
}
