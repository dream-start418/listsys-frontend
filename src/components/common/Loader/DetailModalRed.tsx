"use client";
import React from "react";
import { useState } from "react";

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const DetailModal: React.FC<DetailModalProps> = ({ isOpen, onClose, children,}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative bg-white rounded-lg shadow-lg p-6 w-full max-w-xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          ✖
        </button>
        {children}
        <div className="flex justify-end my-2">
          <div
            className="ml-2">
            <button
              onClick={onClose}
              className="ml-2 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              閉じる
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailModal;
