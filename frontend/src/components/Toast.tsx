import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'info'
};

interface ToastCtx {
  toast: (msg: string, type?: Toast['type']) => void
};

const Ctx = createContext<ToastCtx>({ toast: () => {} });

export const useToast = () => useContext(Ctx);

let nextId = 0;

const icons = {
  success: '✓',
  error: '✕',
  info: 'i',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = nextId++
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3500)
  }, []);

  return (
    <Ctx.Provider value={{ toast: addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-3 rounded-lg shadow-lg text-sm font-medium animate-slide-up border ${
              t.type === 'success'
                ? 'bg-card text-card-foreground border-emerald-500/30'
                : t.type === 'error'
                ? 'bg-card text-card-foreground border-red-500/30'
                : 'bg-card text-card-foreground border-border'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                t.type === 'success' ? 'bg-emerald-500/20 text-emerald-500' :
                t.type === 'error' ? 'bg-red-500/20 text-red-500' :
                'bg-muted text-muted-foreground'
              }`}>
                {icons[t.type]}
              </span>
              <span>{t.message}</span>
            </div>
          </div>
        ))}
      </div>
    </Ctx.Provider>
)};
