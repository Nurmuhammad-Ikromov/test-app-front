/** @format */

import React from "react";
import { Link, Outlet } from "react-router-dom";
import { FiPlus, FiSearch } from "react-icons/fi";

const StudentListPage = () => {
  return (
    /* 
       MUHIM: 
       1. h-screen: Sahifani ekran bo'yiga tenglaydi.
       2. overflow-y-auto: Agar kartalar ko'p bo'lsa, faqat shu blok ichida scroll chiqaradi.
       3. custom-scrollbar: (Ixtiyoriy) chiroyli scroll uchun.
    */
    <div className="p-8 bg-[#F8F9FB] h-screen overflow-y-auto font-sans text-[#1B2559] flex flex-col">
      {/* HEADER SECTION - Bu ham scroll bilan birga tepaga chiqib ketadi */}
      <div className="shrink-0 mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold uppercase tracking-tight">
              O'quvchilar
            </h1>
            <p className="text-sm text-[#A3AED0] font-medium mt-1 uppercase">
              Barcha o'quvchilar ro'yxati
            </p>
          </div>
          <Link
            to="/teacher/add-student"
            className="bg-[#4318FF] text-white px-7 py-3 rounded-2xl font-bold shadow-lg hover:bg-[#3311CC] transition-all flex items-center gap-2 transform hover:scale-105"
          >
            <FiPlus size={20} /> Yangi o'quvchi
          </Link>
        </div>

        {/* SEARCH BAR */}
        <div className="bg-white p-4 rounded-[24px] shadow-sm flex justify-between items-center gap-4 border border-gray-50">
          <div className="relative flex-1 max-w-md">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-[#A3AED0]">
              <FiSearch size={20} />
            </span>
            <input
              type="text"
              placeholder="O'quvchi qidirish..."
              className="w-full pl-12 pr-4 py-2.5 bg-[#F4F7FE] border-none rounded-2xl focus:ring-2 focus:ring-purple-400 outline-none font-medium text-sm"
            />
          </div>
          <select className="bg-white border border-gray-100 text-[#707EAE] px-5 py-2.5 rounded-2xl text-sm shadow-sm font-bold outline-none cursor-pointer">
            <option>Barcha sinflar</option>
          </select>
        </div>
      </div>

      {/* CARDS AREA (Outlet) */}
      <div className="pb-10">
        <Outlet />
      </div>
    </div>
  );
};

export default StudentListPage;
