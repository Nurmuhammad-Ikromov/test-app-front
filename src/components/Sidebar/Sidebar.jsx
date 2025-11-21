import { NavLink } from "react-router-dom";
import { FaGraduationCap, FaMedal, FaUsers } from "react-icons/fa6";
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
    // Sidebar hidden on small screens, shows on md+
    <div className="sidebar hidden md:flex h-screen bg-gray-900 text-white flex-col p-4 w-56">
      {/* Logo */}
      <h1 className="text-2xl font-bold mb-8 flex items-center gap-1">
        PDPedu
      </h1>

      {/* Menu Items */}
      <ul className="space-y-4 flex-1">
        {links
          .filter((item) => item.roles.includes(role))
          .map((item, idx) => (
            <li key={idx}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex w-full items-center gap-3 cursor-pointer p-3 rounded-lg transition duration-300 ${
                    isActive ? "bg-gray-700" : "hover:bg-gray-700"
                  }`
                }
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </NavLink>
            </li>
          ))}
      </ul>

      {/* Help / Telegram Link */}
      <div className="mt-5">
        <a
          href="https://t.me/Ikromovs_blog" // shu yerga kanal linkini qo'yasan
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-700 transition duration-300"
        >
          <FaTelegram className="text-xl text-white" />
          <span className="text-sm font-medium">Murojaat uchun</span>
        </a>
      </div>
    </div>
  );
};

export default Sidebar;
