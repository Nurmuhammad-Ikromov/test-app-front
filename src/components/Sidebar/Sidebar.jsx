/** @format */

import { NavLink } from "react-router-dom";
import { FaGraduationCap, FaMedal } from "react-icons/fa6";
import { BsCardList } from "react-icons/bs";
import { IoPeople } from "react-icons/io5";
import { CgGlass } from "react-icons/cg";
import { MdMenuBook } from "react-icons/md";
import { FaChalkboardTeacher, FaTelegram } from "react-icons/fa";

const Sidebar = ({ role }) => {
  const links = [
    {
      label: "Testlar",
      icon: <FaGraduationCap />,
      path: `/${role}/tests`,
      roles: ["teacher", "admin"],
    },
    {
      label: "Baholar",
      icon: <FaMedal />,
      path: "/student/grades",
      roles: ["student"],
    },
    {
      label: "Imtihonlar",
      icon: <BsCardList />,
      path: `/${role}/exams`,
      roles: ["teacher", "admin", "student"],
    },
    {
      label: "O'quvchilar",
      icon: <IoPeople />,
      path: "/teacher/students",
      roles: ["teacher"],
    },
    {
      label: "Sinflarim",
      icon: <FaChalkboardTeacher />,
      path: "/teacher/classes",
      roles: ["teacher"],
    },
    {
      label: "O'qituvchilar",
      icon: <IoPeople />,
      path: "/director/teachers",
      roles: ["director"],
    },
    {
      label: "Sinflar",
      icon: <CgGlass />,
      path: "/director/classes",
      roles: ["director"],
    },
    {
      label: "Fanlar",
      icon: <MdMenuBook />,
      path: "/director/subjects",
      roles: ["director"],
    },
  ];

  return (
    <div className="sidebar hidden md:flex h-screen bg-[#0F172A] text-slate-300 flex-col w-64 border-r border-slate-800 transition-all duration-300">
      {/* 1. Logo Section */}
      <div className="p-6 mb-2">
        <h1 className="text-2xl font-black tracking-wider text-white flex items-center gap-2 italic">
          <span className="bg-indigo-600 text-white px-2 py-0.5 rounded shadow-lg shadow-indigo-500/20">PDP</span>
          <span className="text-indigo-400">edu</span>
        </h1>
      </div>

      {/* 2. Menu Items */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
        <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Asosiy Menu</p>
        
        {links
          .filter((item) => item.roles.includes(role))
          .map((item, idx) => (
            <NavLink
              key={idx}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group group font-medium ${
                  isActive 
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/20" 
                    : "hover:bg-slate-800/50 hover:text-white"
                }`
              }
            >
              <span className="text-xl group-hover:scale-110 transition-transform">{item.icon}</span>
              <span className="text-sm">{item.label}</span>
            </NavLink>
          ))}
      </nav>

      {/* 3. Footer / Help Section */}
      <div className="p-4 border-t border-slate-800 mt-auto">
        <a
          href="https://t.me/Ikromovs_blog"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-4 rounded-2xl bg-slate-800/40 hover:bg-indigo-600/10 hover:border-indigo-500/50 border border-transparent transition-all group overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 p-1 opacity-10 group-hover:scale-150 transition-transform">
             <FaTelegram size={40} />
          </div>
          <div className="z-10 bg-indigo-500 p-2 rounded-lg text-white shadow-md group-hover:bg-indigo-600">
            <FaTelegram className="text-lg" />
          </div>
          <div className="z-10">
            <p className="text-xs font-bold text-white leading-none mb-1">Bog'lanish</p>
            <p className="text-[10px] text-slate-400 font-medium group-hover:text-slate-300">Ikromov's IT blog</p>
          </div>
        </a>
      </div>
    </div>
  );
};

export default Sidebar;
