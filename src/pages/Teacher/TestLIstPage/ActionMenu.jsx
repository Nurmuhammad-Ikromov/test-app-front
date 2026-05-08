/** @format */

import React, { useState, useEffect, useRef } from "react";
import { FiMoreVertical, FiPlus, FiTrash2 } from "react-icons/fi";

const ActionMenu = ({ onEdit, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Menyu tashqarisini bosganda uni yopish
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative flex justify-center" ref={menuRef}>
      {/* Uch nuqta tugmasi */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-[#A3AED0] hover:bg-gray-100 rounded-full transition-all focus:outline-none"
      >
        <FiMoreVertical size={20} />
      </button>

      {/* Ochiladigan menyu (Dropdown) */}
      {isOpen && (
        <div className="absolute right-0 top-10 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl z-[999] py-2 animate-in fade-in zoom-in duration-200">
          <button
            onClick={() => {
              onEdit && onEdit();
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#1B2559] hover:bg-purple-50 hover:text-[#4318FF] font-bold transition-colors"
          >
            <FiPlus className="text-[#4318FF] text-lg" />
            Imtihon yaratish
          </button>

          <div className="h-[1px] bg-gray-100 my-1 mx-2"></div>

          <button
            onClick={() => {
              onDelete && onDelete();
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 font-bold transition-colors"
          >
            <FiTrash2 className="text-lg" />
            O'chirish
          </button>
        </div>
      )}
    </div>
  );
};

export default ActionMenu;
