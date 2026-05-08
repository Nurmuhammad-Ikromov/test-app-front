/** @format */
import React, { useState, useEffect } from "react";
import { Link, Outlet, useSearchParams } from "react-router-dom";
import { FiPlus, FiSearch, FiChevronDown } from "react-icons/fi";
import API from "../../../utils/config";

const StudentListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [inputValue, setInputValue] = useState(
    searchParams.get("search") || "",
  );
  const [classes, setClasses] = useState([]);
  const token = localStorage.getItem("token");

  // 1. Sinflarni yuklash
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const { data } = await API.get("/class", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setClasses(data);
      } catch (err) {
        console.error("Sinflarni yuklashda xato:", err);
      }
    };
    fetchClasses();
  }, [token]);

  // 2. Qidiruv funksiyasi
  const handleSearch = () => {
    const newParams = new URLSearchParams(searchParams);
    if (inputValue.trim()) {
      newParams.set("search", inputValue);
    } else {
      newParams.delete("search");
    }
    newParams.set("page", "1"); // Yangi qidiruvda 1-betga qaytish
    setSearchParams(newParams);
  };

  // 3. Sinf bo'yicha filtr
  const handleClassChange = (classId) => {
    const newParams = new URLSearchParams(searchParams);
    if (classId) {
      newParams.set("class", classId);
    } else {
      newParams.delete("class");
    }
    newParams.set("page", "1");
    setSearchParams(newParams);
  };

  return (
    <div className="h-screen overflow-y-auto bg-[#F8F9FB] p-8 w-full font-sans text-[#1B2559]">
      {/* HEADER */}
      <div className="mb-8">
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
            className="bg-[#4318FF] text-white px-7 py-3 rounded-2xl font-bold shadow-lg hover:bg-[#3311CC] transition-all flex items-center gap-2 transform hover:scale-105 active:scale-95"
          >
            <FiPlus size={20} /> Yangi o'quvchi
          </Link>
        </div>

        {/* SEARCH & FILTER BAR */}
        <div className="bg-white p-4 rounded-[24px] shadow-sm flex flex-col lg:flex-row justify-between items-center gap-4 border border-gray-50">
          {/* INPUT QISMI */}
          <div className="relative flex-1 w-full max-w-xl flex gap-3">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-[#A3AED0]">
                <FiSearch size={20} />
              </span>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="O'quvchi ismini yozing..."
                className="w-full pl-12 pr-4 py-3 bg-[#F4F7FE] border-none rounded-2xl focus:ring-2 focus:ring-[#4318FF] outline-none font-medium text-sm"
              />
            </div>
            <button
              onClick={handleSearch}
              className="bg-[#4318FF] text-white px-8 py-3 rounded-2xl font-bold hover:bg-[#3311CC] transition-all active:scale-95 shadow-md"
            >
              Izlash
            </button>
          </div>

          {/* SINF SELECT */}
          <div className="relative w-full lg:w-64">
            <select
              value={searchParams.get("class") || ""}
              onChange={(e) => handleClassChange(e.target.value)}
              className="w-full bg-[#F4F7FE] border-none text-[#707EAE] px-5 py-3 rounded-2xl text-sm font-bold outline-none cursor-pointer appearance-none focus:ring-2 focus:ring-[#4318FF]"
            >
              <option value="">Barcha sinflar</option>
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-[#707EAE]">
              <FiChevronDown size={18} />
            </div>
          </div>
        </div>
      </div>

      <div className="pb-32">
        <Outlet />
      </div>
    </div>
  );
};

export default StudentListPage;
