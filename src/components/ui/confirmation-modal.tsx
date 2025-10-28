import React from 'react';
import { AlertTriangle, Trash2, Info, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'destructive' | 'warning' | 'info';
  isLoading?: boolean;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'destructive',
  isLoading = false,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (variant) {
      case 'destructive':
        return <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />;
      case 'warning':
        return <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />;
      case 'info':
        return <Info className="h-6 w-6 text-blue-600 dark:text-blue-400" />;
      default:
        return <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />;
    }
  };

  const getConfirmButtonStyle = () => {
    switch (variant) {
      case 'destructive':
        return {
          backgroundColor: '#dc2626',
          color: '#ffffff',
          border: 'none'
        };
      case 'warning':
        return {
          backgroundColor: '#d97706',
          color: '#ffffff',
          border: 'none'
        };
      case 'info':
        return {
          backgroundColor: '#2563eb',
          color: '#ffffff',
          border: 'none'
        };
      default:
        return {
          backgroundColor: '#dc2626',
          color: '#ffffff',
          border: 'none'
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 dark:bg-black/90 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className="relative rounded-lg shadow-xl max-w-md w-full mx-4 p-6 border transition-colors duration-300"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border-primary)',
          color: 'var(--text-primary)'
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          {getIcon()}
          <h2 
            className="text-lg font-semibold"
            style={{ color: 'var(--text-primary)' }}
          >
            {title}
          </h2>
        </div>
        
        {/* Description */}
        <p 
          className="text-sm leading-relaxed mb-6"
          style={{ color: 'var(--text-secondary)' }}
        >
          {description}
        </p>
        
        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="mt-2 sm:mt-0 transition-colors"
            style={{
              borderColor: 'var(--border-secondary)',
              color: 'var(--text-primary)',
              backgroundColor: 'transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
              e.currentTarget.style.borderColor = 'var(--border-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderColor = 'var(--border-secondary)';
            }}
          >
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            style={getConfirmButtonStyle()}
            onMouseEnter={(e) => {
              if (!e.currentTarget.disabled) {
                const currentBg = e.currentTarget.style.backgroundColor;
                if (currentBg === 'rgb(220, 38, 38)') {
                  e.currentTarget.style.backgroundColor = '#b91c1c';
                } else if (currentBg === 'rgb(217, 119, 6)') {
                  e.currentTarget.style.backgroundColor = '#b45309';
                } else if (currentBg === 'rgb(37, 99, 235)') {
                  e.currentTarget.style.backgroundColor = '#1d4ed8';
                }
              }
            }}
            onMouseLeave={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.backgroundColor = getConfirmButtonStyle().backgroundColor;
              }
            }}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </div>
            ) : (
              confirmText
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Convenience hook for managing confirmation modal state
export function useConfirmationModal() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [config, setConfig] = React.useState<{
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'destructive' | 'warning' | 'info';
    onConfirm?: () => void;
  }>({
    title: '',
    description: '',
  });

  const showConfirmation = (confirmationConfig: typeof config) => {
    setConfig(confirmationConfig);
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

  return {
    isOpen,
    config,
    showConfirmation,
    hideConfirmation,
    handleConfirm,
  };
}