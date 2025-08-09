import { ReactNode } from 'react';
import { AlertTriangle, Info, CheckCircle, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/Dialog';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children?: ReactNode;
  type?: 'warning' | 'info' | 'success' | 'error';
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmVariant?: 'default' | 'destructive' | 'outline' | 'secondary';
}

export const ConfirmDialog = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  type = 'info',
  confirmText = 'Conferma',
  cancelText = 'Annulla',
  onConfirm,
  onCancel,
  confirmVariant = 'default'
}: ConfirmDialogProps) => {
  const icons = {
    warning: AlertTriangle,
    info: Info,
    success: CheckCircle,
    error: X,
  };

  const iconColors = {
    warning: 'text-yellow-500',
    info: 'text-blue-500',
    success: 'text-green-500',
    error: 'text-red-500',
  };

  const Icon = icons[type];

  const handleConfirm = () => {
    onConfirm?.();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <Icon className={`w-6 h-6 ${iconColors[type]}`} />
            <DialogTitle>{title}</DialogTitle>
          </div>
        </DialogHeader>
        <div className="py-4">
          {description && (
            <p className="text-sm text-gray-600 mb-4 whitespace-pre-line">
              {description}
            </p>
          )}
          {children}
        </div>
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={handleCancel}>
            {cancelText}
          </Button>
          <Button variant={confirmVariant} onClick={handleConfirm}>
            {confirmText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};