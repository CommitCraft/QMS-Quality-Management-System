import type { ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  footer?: ReactNode;
}

export const Modal = ({ open, title, children, onClose, footer }: ModalProps) => {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-3xl overflow-hidden rounded-[14px] border border-[#b8c7c7] bg-[#f8fbfb] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 border-b border-[#d9e0e4] bg-white px-6 py-4">
          <div>
            <h3 className="text-[20px] font-bold text-slate-900">
              {title}
            </h3>
            <p className="mt-1 text-[13px] text-slate-500">
              Fill the required details and save changes.
            </p>
          </div>

          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#d1d5db] bg-white text-[20px] font-semibold leading-none text-slate-600 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            onClick={onClose}
            aria-label="Close modal"
            title="Close"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[72vh] overflow-y-auto bg-[#f8fbfb] px-6 py-5 text-slate-800">
          {children}
        </div>

        {/* Footer */}
        {footer ? (
          <div className="border-t border-[#d9e0e4] bg-white px-6 py-4">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
};