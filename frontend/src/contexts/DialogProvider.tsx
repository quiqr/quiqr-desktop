import { useState, useCallback, useRef, ReactNode, useEffect } from 'react';
import { useLocation } from 'react-router';
import { DialogContext } from './DialogContext';
import { DialogRenderer } from '../dialogs/DialogRenderer';
import type { DialogState, DialogContextValue } from './DialogContext';
import type { DialogPropsMap } from '../dialogs/types';

interface DialogProviderProps {
  children: ReactNode;
}

/**
 * DialogProvider manages global dialog state and provides the dialog API
 * Place this at the app root to enable dialog management throughout the app
 */
export function DialogProvider({ children }: DialogProviderProps) {
  const [dialogs, setDialogs] = useState<DialogState[]>([]);
  const dialogIdCounter = useRef(0);
  const location = useLocation();

  // Close all dialogs when route changes (user requirement)
  useEffect(() => {
    setDialogs([]);
  }, [location.pathname]);

  const openDialog = useCallback<DialogContextValue['openDialog']>(
    (component, props) => {
      const id = `dialog-${++dialogIdCounter.current}`;
      const priority = dialogs.length; // Higher priority = more recent = higher z-index

      setDialogs(prev => [...prev, { id, component, props, priority }]);
      return id;
    },
    [dialogs.length]
  );

  const closeDialog = useCallback((id?: string) => {
    if (id) {
      // Close specific dialog
      setDialogs(prev => prev.filter(d => d.id !== id));
    } else {
      // Close all dialogs
      setDialogs([]);
    }
  }, []);

  const isDialogOpen = useCallback((component: string) => {
    return dialogs.some(d => d.component === component);
  }, [dialogs]);

  const value: DialogContextValue = {
    openDialog,
    closeDialog,
    activeDialogs: dialogs,
    isDialogOpen,
  };

  return (
    <DialogContext.Provider value={value}>
      {children}
      <DialogRenderer dialogs={dialogs} onClose={closeDialog} />
    </DialogContext.Provider>
  );
}
