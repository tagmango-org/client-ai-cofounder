import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';

interface ConfirmationConfig {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'destructive' | 'warning' | 'info';
  onConfirm?: () => void;
}

interface ConfirmationModalContextType {
  showConfirmation: (config: ConfirmationConfig) => void;
  hideConfirmation: () => void;
}

const ConfirmationModalContext = createContext<ConfirmationModalContextType | undefined>(undefined);

export function ConfirmationModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<ConfirmationConfig>({
    title: '',
    description: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    variant: 'destructive',
  });

  const showConfirmation = (confirmationConfig: ConfirmationConfig) => {
    setConfig({
      ...confirmationConfig,
      confirmText: confirmationConfig.confirmText || 'Confirm',
      cancelText: confirmationConfig.cancelText || 'Cancel',
      variant: confirmationConfig.variant || 'destructive',
    });
    setIsOpen(true);
  };

  const hideConfirmation = () => {
    setIsOpen(false);
  };

  const handleConfirm = () => {
    if (config.onConfirm) {
      config.onConfirm();
    }
    hideConfirmation();
  };

  return (
    <ConfirmationModalContext.Provider value={{ showConfirmation, hideConfirmation }}>
      {children}
      <ConfirmationModal
        isOpen={isOpen}
        onClose={hideConfirmation}
        onConfirm={handleConfirm}
        title={config.title}
        description={config.description}
        confirmText={config.confirmText}
        cancelText={config.cancelText}
        variant={config.variant}
      />
    </ConfirmationModalContext.Provider>
  );
}

export function useConfirmationModal() {
  const context = useContext(ConfirmationModalContext);
  if (context === undefined) {
    throw new Error('useConfirmationModal must be used within a ConfirmationModalProvider');
  }
  return context;
}

