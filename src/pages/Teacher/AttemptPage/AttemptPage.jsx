/** @format */

import React from "react";
import Navbar from "../../../components/Navbar/Navbar";
import { Outlet } from "react-router-dom";
import { FiSearch } from "react-icons/fi"; // Qidiruv belgisi uchun

const AttemptPage = () => {
  return (
    <div className="p-8 bg-[#F8F9FB] min-h-screen w-full font-sans text-[#1B2559]">
      
      {/* 1. HEADER / NAVBAR */}
      {/* Navbar komponenti ichida sarlavha va profil chiroyli chiqadi */}
      <div className="mb-8">
        <Navbar title="Imtihonlar" name="Sinovlar ro'yxati" />
      </div>

      {/* 2. SEARCH SECTION */}
      <div className="bg-white p-4 rounded-[24px] shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 border border-gray-50 mb-8 transition-all hover:shadow-md">
        
        {/* Qidiruv paneli - Modern dizayn */}
        <div className="relative flex-1 w-full max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-[#A3AED0]">
            <FiSearch size={20} />
          </span>
          <input
            type="text"
            placeholder="Imtihon nomini yozing..."
            className="w-full pl-12 pr-4 py-3 bg-[#F4F7FE] border-none rounded-2xl focus:ring-2 focus:ring-[#4318FF] outline-none font-medium text-sm transition-all"
          />
        </div>

        {/* Agar kerak bo'lsa bu yerga qo'shimcha filtr tugmalari qo'shish mumkin */}
        <div className="hidden md:block">
           <p className="text-[11px] text-[#A3AED0] font-black uppercase tracking-widest px-4">
             Jami natijalar boshqaruvi
           </p>
        </div>
      </div>

      {/* 3. CONTENT AREA */}
      {/* Outlet ichida jadval yoki kartalar chiqadi */}
      <div className="w-full overflow-visible">
        <Outlet />
      </div>

    </div>
  );
};

export default AttemptPage;
