import React from "react";

export default function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null; // Don't render if not open

  return (
    <div className="fixed inset-0 flex items-start justify-center bg-black/70 backdrop-blue-md z-50">
      <div className="bg-gray-300 mt-12 p-6 rounded-2xl shadow-lg max-w-43 sm:max-w-72 w-full text-right">
        {children}
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Close
        </button>
      </div>
    </div>
  );
};