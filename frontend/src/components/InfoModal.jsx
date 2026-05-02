import React from 'react';
import { X } from 'lucide-react';

const InfoModal = ({ open, onClose, title, kicker, children }) => {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        data-testid="info-modal"
        className="relative w-full max-w-2xl card-surface rounded-2xl p-8 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          data-testid="info-modal-close"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-[#262924] text-[#a8a69c]"
        >
          <X className="w-4 h-4" />
        </button>
        {kicker && (
          <div className="text-[#d69e4b] text-xs uppercase tracking-[0.25em] mb-2">
            {kicker}
          </div>
        )}
        <h2 className="font-serif text-3xl text-[#f2f0e6] mb-4">{title}</h2>
        <div className="text-[#a8a69c] text-sm leading-relaxed space-y-3">
          {children}
        </div>
      </div>
    </div>
  );
};

export default InfoModal;
