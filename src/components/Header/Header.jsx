/** @format */

import React, { useState, useEffect } from "react";
import { RxAvatar } from "react-icons/rx";
import { MdKeyboardArrowDown } from "react-icons/md";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiUser, FiLogOut, FiSettings } from "react-icons/fi"; // Chiroyli ikonkalar

const Header = ({ role }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const userData = JSON.parse(localStorage.getItem("userData")) || null;
  const userFirstName = userData?.user?.first_name || "loading";
  const userLastName = userData?.user?.last_name || "";

  const getTitle = () => {
    const path = location.pathname;
    if (path.startsWith("/teacher/classes")) return "Dars jurnali";
    if (path.startsWith("/teacher/students")) return "O'quvchilar ro'yxati";
    if (path.startsWith("/teacher/exams")) return "Imtihonlar";
    if (path.startsWith("/teacher/tests")) return "Testlar";
    if (path === "/dashboard") return "Bosh sahifa";
    return "Platforma";
  };

  // Dropdownni tashqaridan bosganda yopish
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest(".profile-dropdown")) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  return (
    <div className="w-full flex justify-between items-center bg-transparent py-4 px-6">
      {/* Sahifa sarlavhasi */}
      <h2 className="font-extrabold text-2xl text-slate-800 tracking-tight">
        {getTitle()}
      </h2>

      <div className="flex items-center gap-4">
        {/* 👤 FOYDALANUVCHI PROFILI (Kattaroq va chiroyli variant) */}
        <div className="relative profile-dropdown">
          <div
            className={`flex items-center gap-3 cursor-pointer p-1.5 pr-5 rounded-[20px] transition-all duration-300 border-2 ${
              dropdownOpen
                ? "bg-white border-indigo-100 shadow-lg shadow-indigo-100/50"
                : "bg-white border-transparent shadow-sm hover:shadow-md hover:border-indigo-50"
            }`}
            onClick={() => setDropdownOpen((prev) => !prev)}
          >
            {/* Avatar qismi - kattaroq qilingan */}
            <div className="relative">
              <div className="w-11 h-11 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-inner overflow-hidden border-2 border-white">
                {userData?.user?.avatar ? (
                  <img
                    className="w-full h-full object-cover"
                    src={userData.user.avatar}
                    alt=""
                  />
                ) : (
                  <span className="font-bold text-lg uppercase">
                    {userFirstName.charAt(0)}
                  </span>
                )}
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            </div>

            {/* Ism va Rol */}
            <div className="hidden md:flex flex-col">
              <span className="text-[14px] font-bold text-slate-800 leading-none">
                {userFirstName} {userLastName}
              </span>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-1">
                {role || "Ustoz"}
              </span>
            </div>

            <MdKeyboardArrowDown
              className={`text-slate-400 text-xl transition-transform duration-300 ${dropdownOpen ? "rotate-180" : ""}`}
            />
          </div>

          {/* 🔽 Dropdown menyusi - Chiroyli dizayn */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-3 w-56 bg-white border border-indigo-50 shadow-2xl rounded-2xl p-2 z-50 animate-in fade-in zoom-in duration-200">
              <div className="px-4 py-3 border-b border-slate-50 mb-1">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Hisob boshqaruvi
                </p>
              </div>

              <Link
                to={`/${role}/profile/info`}
                className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all"
                onClick={() => setDropdownOpen(false)}
              >
                <FiUser size={18} /> Profil ma'lumotlari
              </Link>

              <Link
                to={`/${role}/settings`}
                className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all"
                onClick={() => setDropdownOpen(false)}
              >
                <FiSettings size={18} /> Sozlamalar
              </Link>

              <div className="h-px bg-slate-50 my-1 mx-2"></div>

              <button
                className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all"
                onClick={() => {
                  setDropdownOpen(false);
                  localStorage.removeItem("token");
                  localStorage.removeItem("role");
                  navigate("/login");
                }}
              >
                <FiLogOut size={18} /> Tizimdan chiqish
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
