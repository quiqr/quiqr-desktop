import { Suspense } from 'react';
import { DialogRegistry } from './DialogRegistry';
import type { DialogState } from '../contexts/DialogContext';

interface DialogRendererProps {
  dialogs: DialogState[];
  onClose: (id: string) => void;
}

/**
 * Renders all active dialogs with proper z-index stacking
 * Dialogs are lazy-loaded and wrapped in Suspense
 */
export function DialogRenderer({ dialogs, onClose }: DialogRendererProps) {
  return (
    <Suspense fallback={null}>
      {dialogs.map((dialogState) => {
        const DialogComponent = DialogRegistry[dialogState.component as keyof typeof DialogRegistry];
        if (!DialogComponent) {
          console.warn(`Dialog component not found: ${dialogState.component}`);
          return null;
        }

        return (
          <DialogComponent
            key={dialogState.id}
            {...dialogState.props}
            open={true}
            onClose={() => onClose(dialogState.id)}
            style={{ zIndex: 1300 + dialogState.priority }}
          />
        );
      })}
    </Suspense>
  );
}
