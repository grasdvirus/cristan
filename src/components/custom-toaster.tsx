
'use client';

import React, { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';

const icons = {
  default: <Info />,
  destructive: <AlertTriangle />,
  success: <CheckCircle />,
  error: <XCircle />,
};

type VisibleToast = ReturnType<typeof useToast>['toasts'][number] & {
  timer?: NodeJS.Timeout;
};


export function CustomToaster() {
  const { toasts, dismiss } = useToast();
  const [visibleToasts, setVisibleToasts] = useState<VisibleToast[]>([]);

  useEffect(() => {
    setVisibleToasts(currentToasts => {
      const newToasts = toasts.filter(
        t => !currentToasts.some(vt => vt.id === t.id)
      );
      const updatedToasts = currentToasts.filter(vt =>
        toasts.some(t => t.id === vt.id)
      );

      newToasts.forEach(toast => {
        if (toast.duration && toast.duration !== Infinity) {
          const timer = setTimeout(() => {
            dismiss(toast.id);
          }, toast.duration);
          (toast as VisibleToast).timer = timer;
        }
      });
      
      return [...newToasts, ...updatedToasts];
    });

  }, [toasts, dismiss]);
  
  useEffect(() => {
    return () => {
        visibleToasts.forEach(toast => {
            if (toast.timer) {
                clearTimeout(toast.timer);
            }
        });
    };
  }, [visibleToasts]);


  const handleDismiss = (toast: VisibleToast) => {
    if (toast.timer) {
      clearTimeout(toast.timer);
    }
    dismiss(toast.id);
  };

  const getPositionClass = (index: number) => {
    if (index === 0) return 'notification-top';
    if (index === 1) return 'notification-middle';
    if (index === 2) return 'notification-bottom';
    return 'hidden';
  };
  
  const getIcon = (variant?: 'default' | 'destructive' | 'success' | 'error') => {
      const finalVariant = variant || 'default';
      return icons[finalVariant] || <Info />;
  }

  return (
    <div className="notification-container">
      {visibleToasts.slice(0, 3).map((toast, index) => (
        <div
          key={toast.id}
          className={cn('notification-card', getPositionClass(index))}
          onClick={() => handleDismiss(toast)}
        >
          <svg className="notification-svg">
            <defs>
              <linearGradient id={`grad${index + 1}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: 'rgba(255,255,255,0.08)' }}></stop>
                <stop offset="50%" style={{ stopColor: 'rgba(255,255,255,0.04)' }}></stop>
                <stop offset="100%" style={{ stopColor: 'rgba(255,255,255,0.02)' }}></stop>
              </linearGradient>
            </defs>
            <path
              d="M 0,40 C 0,0 0,0 40,0 L 340,0 C 380,0 380,0 380,40 C 380,80 380,80 340,80 L 40,80 C 0,80 0,80 0,40 Z"
              fill={`url(#grad${index + 1})`}
              stroke="rgba(255,255,255,0.15)"
              strokeWidth="1"
              className="notification-path"
            ></path>
          </svg>
          <div className="notification-content">
            <div className={cn("notification-avatar", {
                "bg-red-500/20 border-red-500/30": toast.variant === 'destructive',
                "bg-green-500/20 border-green-500/30": toast.variant === 'success',
            })}>
               {getIcon(toast.variant)}
            </div>
            <div className="notification-body">
              <div className="notification-header">
                <div className="notification-title">{toast.title}</div>
              </div>
              {toast.description && <div className="notification-message">{toast.description}</div>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
