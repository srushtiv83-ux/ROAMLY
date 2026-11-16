import React from 'react';
import { CheckCircle2, Info } from 'lucide-react';
import { useRoamly } from '../context/RoamlyContext';

export function ToastContainer() {
  const { toasts } = useRoamly();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-[90vw] max-w-sm pointer-events-none"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="px-4 py-3 rounded-2xl bg-[#172B3A] text-white text-xs sm:text-sm font-medium shadow-lg flex items-center gap-2.5"
        >
          {toast.tone === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-[#9EF1E9] shrink-0" />
          ) : (
            <Info className="w-4 h-4 text-[#FF7043] shrink-0" />
          )}
          <span className="truncate">{toast.text}</span>
        </div>
      ))}
    </div>
  );
}
