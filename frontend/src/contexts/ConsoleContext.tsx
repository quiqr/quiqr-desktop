import { createContext, useContext, useState, useCallback, useEffect, ReactNode, useRef } from 'react';
import mainProcessBridge from '../utils/main-process-bridge';
import { ConsoleMessage, uiServiceSchemas } from '../../types';
import { validateServiceResponse } from '../utils/validation';

interface ConsoleContextValue {
  consoleMessages: ConsoleMessage[];
}

const ConsoleContext = createContext<ConsoleContextValue | null>(null);

interface ConsoleProviderProps {
  children: ReactNode;
}

export function ConsoleProvider({ children }: ConsoleProviderProps) {
  const [messages, setMessages] = useState<ConsoleMessage[]>([
    { id: -2, line: 'This is the application output console. Here you can learn about what is happening behind the scenes.' },
    { id: -1, line: '' }
  ]);
  const [buffer, setBuffer] = useState<ConsoleMessage[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const lastIdRef = useRef(0);

  const processBuffer = useCallback(() => {
    setMessages(prev => {
      const max = 100;
      const combined = [...prev, ...buffer];
      if (combined.length > max) {
        return combined.slice(combined.length - max);
      }
      return combined;
    });
    setBuffer([]);
  }, [buffer]);

  const onConsole = useCallback(({ line }: { line: string }) => {
    const cleanLine = line.replace(/\u001b[^m]*?m/g, '');
    const newMessage: ConsoleMessage = {
      id: lastIdRef.current++,
      line: cleanLine
    };

    setBuffer(prev => [...prev, newMessage]);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      processBuffer();
    }, 50);
  }, [processBuffer]);

  const onHugoOutput = useCallback((line: string) => {
    const cleanLine = line.replace(/\u001b[^m]*?m/g, '');
    const newMessage: ConsoleMessage = {
      id: lastIdRef.current++,
      line: cleanLine
    };

    setBuffer(prev => [...prev, newMessage]);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      processBuffer();
    }, 50);
  }, [processBuffer]);

  useEffect(() => {
    mainProcessBridge.addMessageHandler('console', onConsole);
    mainProcessBridge.addMessageHandler('hugo-output-line', onHugoOutput);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [onConsole, onHugoOutput]);

  const getConsoleMessages = useCallback(() => {
    return validateServiceResponse(
      'getConsoleMessages',
      uiServiceSchemas.getConsoleMessages,
      messages
    );
  }, [messages]);

  const value: ConsoleContextValue = {
    consoleMessages: getConsoleMessages()
  };

  return (
    <ConsoleContext.Provider value={value}>
      {children}
    </ConsoleContext.Provider>
  );
}

export function useConsole(): ConsoleContextValue {
  const context = useContext(ConsoleContext);
  if (!context) {
    throw new Error('useConsole must be used within a ConsoleProvider');
  }
  return context;
}
