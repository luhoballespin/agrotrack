export default function Modal({ open, title, children, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-xl rounded-t-2xl border bg-white p-4 shadow-2xl sm:inset-0 sm:my-10 sm:rounded-2xl sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">{title}</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border px-3 py-1.5 text-sm hover:bg-slate-50"
          >
            Cerrar
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

