import React from 'react';

interface HowToPlayModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  borderColorClass?: string;
}

const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ title, onClose, children, borderColorClass = 'border-blue' }) => {
  return (
    <div 
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="how-to-play-title"
    >
      <div 
        className={`bg-brand-dark p-8 rounded-xl shadow-2xl w-full max-w-2xl mx-4 border-2 ${borderColorClass} relative`}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <button 
          onClick={onClose}
          className={`absolute top-4 right-4 text-gray-400 hover:text-white transition-colors text-3xl font-bold`}
          aria-label="Close"
        >
          &times;
        </button>
        <h2 id="how-to-play-title" className="text-4xl font-bold font-display text-center mb-6">{title}</h2>
        <div className="space-y-4 text-gray-300 text-lg leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
};

export default HowToPlayModal;
