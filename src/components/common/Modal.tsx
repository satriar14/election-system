import React, { useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
  hideHeader?: boolean; // <-- PROP BARU
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "lg",
  hideHeader = false, // <-- DEFAULT FALSE
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div
        className={`bg-white rounded-3xl shadow-xl w-full ${maxWidthClasses[maxWidth]} max-h-[calc(100dvh-1.5rem)] overflow-hidden border border-slate-100 transform transition-all flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header — cuma render kalau hideHeader false */}
        {!hideHeader && (
          <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 bg-white border-b border-slate-100 text-slate-800 shrink-0">
            <h3 className="text-base font-extrabold tracking-tight text-slate-900 min-w-0">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 shrink-0 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Content */}
        <div
          className={
            hideHeader
              ? "min-h-0 overflow-y-auto"
              : "p-4 sm:p-6 min-h-0 overflow-y-auto"
          }
        >
          {children}
        </div>
      </div>
    </div>
  );
};
