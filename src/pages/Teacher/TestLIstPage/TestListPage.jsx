/** @format */
import React, { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import Navbar from "../../../components/Navbar/Navbar";
import { FiPlus, FiSearch } from "react-icons/fi";

const TestListPage = () => {
  // 1. Sahifa holatini boshqarish uchun State
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 3; // Sahifalar soni (buni dinamik qilsangiz ham bo'ladi)

  return (
    <div className="p-8 bg-[#F8F9FB] min-h-screen font-sans text-[#1B2559]">
      {/* HEADER QISMI */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Testlar</h1>
            <p className="text-sm text-[#A3AED0] font-medium mt-1 uppercase tracking-wider">
              Barcha testlar va natijalar
            </p>
          </div>
          <Link
            to="/teacher/tests/create"
            className="bg-[#4318FF] text-white px-7 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-[#3311CC] transition-all flex items-center gap-2 transform hover:scale-105 active:scale-95"
          >
            <FiPlus size={20} /> Yangi test
          </Link>
        </div>

        {/* SEARCH & FILTERS */}
        <div className="bg-white p-4 rounded-[24px] shadow-sm flex justify-between items-center gap-4">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-[#A3AED0]">
              <FiSearch size={20} />
            </span>
            <input
              type="text"
              placeholder="Test qidirish..."
              className="w-full pl-12 pr-4 py-2.5 bg-[#F4F7FE] border-none rounded-2xl focus:ring-2 focus:ring-purple-400 outline-none text-[#1B2559] font-medium placeholder:text-[#A3AED0]"
            />
          </div>
          <div className="flex gap-3">
            <select className="bg-white border border-gray-100 text-[#707EAE] px-5 py-2.5 rounded-2xl text-sm shadow-sm outline-none font-bold hover:text-[#4318FF] transition-colors cursor-pointer">
              <option>Barcha fanlar</option>
            </select>
          </div>
        </div>
      </div>

      {/* JADVAL CHIQADIGAN JOY */}
      <div className="mt-4">
        <Outlet />
      </div>

      {/* 2. ISHLAYDIGAN PAGINATION QISMI */}
      <div className="flex justify-between items-center mt-10 px-4">
        <p className="text-[14px] text-[#A3AED0] font-bold">Jami 5 ta test</p>

        <div className="flex items-center gap-4">
          {/* Oldingi tugmasi */}
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`font-bold text-sm transition-all ${currentPage === 1 ? "text-gray-300 cursor-not-allowed" : "text-[#A3AED0] hover:text-[#4318FF]"}`}
          >
            Oldingi
          </button>

          <div className="flex gap-2">
            {[1, 2, 3].map((n) => (
              <button
                key={n}
                onClick={() => setCurrentPage(n)}
                className={`w-10 h-10 flex items-center justify-center rounded-full font-bold text-sm transition-all ${
                  n === currentPage
                    ? "bg-[#4318FF] text-white shadow-lg shadow-indigo-200 transform scale-110"
                    : "text-[#4318FF] hover:bg-white hover:shadow-sm"
                }`}
              >
                {n}
              </button>
            ))}
          </div>

          {/* Keyingi tugmasi */}
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className={`font-bold text-sm transition-all ${currentPage === totalPages ? "text-gray-300 cursor-not-allowed" : "text-[#4318FF] hover:text-[#3311CC]"}`}
          >
            Keyingi
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestListPage;
