import { X } from "lucide-react";
import { create } from "zustand";

interface ToastItem {
  id: number;
  title: string;
  tone?: "success" | "error" | "info";
}

interface ToastState {
  items: ToastItem[];
  push: (title: string, tone?: ToastItem["tone"]) => void;
  remove: (id: number) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  items: [],
  push: (title, tone = "info") => {
    const id = Date.now();
    set((state) => ({ items: [...state.items, { id, title, tone }] }));
    window.setTimeout(() => set((state) => ({ items: state.items.filter((item) => item.id !== id) })), 3200);
  },
  remove: (id) => set((state) => ({ items: state.items.filter((item) => item.id !== id) })),
}));

export function ToastViewport() {
  const { items, remove } = useToastStore();
  return (
    <div className="fixed bottom-4 right-4 z-50 grid w-[min(360px,calc(100vw-32px))] gap-2">
      {items.map((item) => (
        <div key={item.id} className="flex items-center justify-between gap-3 rounded-md border border-brand-line bg-white p-4 text-sm shadow-soft">
          <span className={item.tone === "error" ? "text-brand-red" : "text-zinc-900"}>{item.title}</span>
          <button className="rounded p-1 hover:bg-brand-muted" onClick={() => remove(item.id)} aria-label="Закрыть"><X size={16} /></button>
        </div>
      ))}
    </div>
  );
}
