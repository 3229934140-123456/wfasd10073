import { useAppStore } from '../../store';
import { XCircle, CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '../../utils';

export function NotificationToast() {
  const { notifications, removeNotification } = useAppStore();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-80">
      {notifications.map((n) => (
        <div
          key={n.id}
          className={cn(
            'animate-slideInRight rounded-xl shadow-lg border p-4 flex items-start gap-3',
            n.type === 'success' && 'bg-green-50 border-green-200',
            n.type === 'error' && 'bg-red-50 border-red-200',
            n.type === 'warning' && 'bg-yellow-50 border-yellow-200',
            n.type === 'info' && 'bg-blue-50 border-blue-200'
          )}
        >
          <div className="flex-shrink-0 mt-0.5">
            {n.type === 'success' && <CheckCircle className="h-5 w-5 text-green-600" />}
            {n.type === 'error' && <XCircle className="h-5 w-5 text-red-600" />}
            {n.type === 'warning' && <AlertCircle className="h-5 w-5 text-yellow-600" />}
            {n.type === 'info' && <Info className="h-5 w-5 text-blue-600" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className={cn(
              'text-sm font-medium',
              n.type === 'success' && 'text-green-900',
              n.type === 'error' && 'text-red-900',
              n.type === 'warning' && 'text-yellow-900',
              n.type === 'info' && 'text-blue-900'
            )}>
              {n.message}
            </p>
          </div>
          <button
            onClick={() => removeNotification(n.id)}
            className="flex-shrink-0 rounded-lg p-1 opacity-60 hover:opacity-100 transition-opacity"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
