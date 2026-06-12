import React, { createContext, useContext, useState } from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, X } from 'lucide-react';

interface NotificationContextType {
  showToast: (message: string, type?: 'success' | 'error') => void;
  openConfirm: (title: string, message: string, onConfirm: () => void) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const openConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmModal({
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmModal(null);
      },
    });
  };

  return (
    <NotificationContext.Provider value={{ showToast, openConfirm }}>
      {children}

      {toast && (
        <div className={`fixed bottom-8 right-8 z-100 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl border bg-white animate-in slide-in-from-bottom-10 fade-in duration-300 ${
          toast.type === 'success' ? 'border-green-200 text-green-800 bg-green-50' : 'border-red-200 text-red-800 bg-red-50'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="text-green-600" size={24} /> : <AlertCircle className="text-red-600" size={24} />}
          <span className="font-semibold leading-relaxed whitespace-pre-line">{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-4 p-1 hover:bg-black/5 rounded-full transition-colors">
            <X size={18} />
          </button>
        </div>
      )}

      {confirmModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-red-100 p-3 rounded-full text-red-600 shrink-0 mt-1">
                <AlertTriangle size={28} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{confirmModal.title}</h3>
                <p className="text-gray-500 leading-relaxed">{confirmModal.message}</p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <button onClick={() => setConfirmModal(null)} className="px-5 py-2.5 font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                Скасувати
              </button>
              <button onClick={confirmModal.onConfirm} className="px-5 py-2.5 font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-sm">
                Підтвердити
              </button>
            </div>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within a NotificationProvider');
  return context;
}