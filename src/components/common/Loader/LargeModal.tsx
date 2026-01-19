"use client";
import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const LargeModal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative bg-white rounded-lg shadow-lg p-6 w-full max-w-xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-black hover:text-gray-300"
        >
          ✖
        </button>
        {children}
      </div>
    </div>
  );
};

export default LargeModal;
