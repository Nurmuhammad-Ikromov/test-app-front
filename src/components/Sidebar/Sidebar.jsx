import { NavLink } from "react-router-dom";
import { FaGraduationCap } from "react-icons/fa6";
import { BsCardList } from "react-icons/bs";
import { IoPeople } from "react-icons/io5";
import { CgGlass } from "react-icons/cg";

const Sidebar = ({ role }) => {
  const links = [
    {
      label: "Tests",
      icon: <FaGraduationCap />,
      path: `/${role}/tests`,
      roles: ["teacher", "admin"],
    },
    {
      label: "Grades",
      icon: <CgGlass />,
      path: "/student/grades",
      roles: ["student"],
    },
    {
      label: "Exams",
      icon: <BsCardList />,
      path: `/${role}/exams`,
      roles: ["teacher", "admin", "student"],
    },
    // {
    //   label: "Settings",
    //   icon: "IoSettingsSharp",
    //   path: `/settings`,
    //   roles: ["teacher", "student", "admin"],
    // },
    {
      label: "O'quvchilar",
      icon: <IoPeople />,
      path: "/teacher/students",
      roles: ["teacher"],
    },
    {
      label: "Sinflarim",
      icon: <CgGlass />,
      path: "/teacher/classes",
      roles: ["teacher"],
    },


  ];

  return (
    <div className="sidebar h-screen bg-gray-900 text-white flex flex-col p-5">
      {/* Logo */}
      <h1 className="text-2xl font-bold mb-10">Brand.</h1>

      {/* Menu Items */}
      <ul className="space-y-4">
        {links
          .filter((item) => item.roles.includes(role))
          .map((item, idx) => (
            <li key={idx}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex w-full items-center gap-3 cursor-pointer p-3 rounded-lg transition duration-300 ${isActive ? "bg-gray-700" : "hover:bg-gray-700"
                  }`
                }
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </NavLink>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default Sidebar;
