import { ReactNode } from 'react';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/Dialog';
import { Progress } from '../ui/Progress';

interface ProgressStep {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  description?: string;
}

interface ProgressDialogProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  title: string;
  description?: string;
  steps?: ProgressStep[];
  currentStep?: string;
  progress?: number;
  children?: ReactNode;
  canClose?: boolean;
  onClose?: () => void;
}

export const ProgressDialog = ({
  open,
  onOpenChange,
  title,
  description,
  steps = [],
  currentStep,
  progress,
  children,
  canClose = false,
  onClose
}: ProgressDialogProps) => {
  const handleClose = () => {
    if (canClose) {
      onClose?.();
      onOpenChange?.(false);
    }
  };

  const getStepIcon = (step: ProgressStep) => {
    switch (step.status) {
      case 'running':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <div className="w-4 h-4 rounded-full border-2 border-gray-300" />;
    }
  };

  const getStepClassName = (step: ProgressStep) => {
    switch (step.status) {
      case 'running':
        return 'text-blue-600 font-medium';
      case 'completed':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <Dialog open={open} onOpenChange={canClose ? onOpenChange : undefined}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
            <span>{title}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-6">
          {description && (
            <p className="text-sm text-gray-600">{description}</p>
          )}

          {progress !== undefined && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progresso</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {steps.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-900">Passaggi:</h4>
              <div className="space-y-2">
                {steps.map((step) => (
                  <div key={step.id} className="flex items-start space-x-3">
                    {getStepIcon(step)}
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm ${getStepClassName(step)}`}>
                        {step.label}
                      </div>
                      {step.description && (
                        <div className="text-xs text-gray-500 mt-1">
                          {step.description}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {children}
        </div>

        {canClose && (
          <div className="flex justify-end">
            <Button onClick={handleClose}>
              Chiudi
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};