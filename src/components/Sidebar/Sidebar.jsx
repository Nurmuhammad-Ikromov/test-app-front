import { NavLink } from "react-router-dom";
import { FaGraduationCap, FaMedal, FaUsers } from "react-icons/fa6";
import { BsCardList } from "react-icons/bs";
import { IoPeople } from "react-icons/io5";
import { CgGlass } from "react-icons/cg";
import { MdMenuBook, MdOutlineClass } from "react-icons/md";
import { FaChalkboardTeacher } from "react-icons/fa";

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
    <div className="sidebar h-screen bg-gray-900 text-white flex flex-col p-5">
      {/* Logo */}
      <h1 className="text-2xl font-bold mb-10 flex items-center gap-1">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="50"
          height="30"
          version="1.0"
          viewBox="0 0 1280 774"
          fill="white"
        >
          <path d="M472 65.9c-87.7 35.6-228.8 92.8-313.5 127.1C73.8 227.3 4.1 255.7 3.6 256.1c-.5.4 46.1 24.1 103.6 52.7l104.5 51.9.6 6.9c.3 3.8 1.4 22.7 2.3 42l1.8 35-3.1 4c-5.7 7.1-6.2 14.9-1.4 22.9 1.2 2 2.1 5 2.1 6.7 0 1.6-1.8 17.2-4 34.7-9.1 72.6-13.6 117.2-12 120 1.4 2.8 12.7 11.4 18.7 14.5 2.9 1.4 7.8 3.3 11 4.1 11.2 2.9 34.2 1.2 39-3l2.6-2.1-1.6-11.5c-4.9-34.5-7.6-72.3-8.3-116.9-.4-28.5-.3-35.9.8-37.6 7.3-11.8 7.3-11.8 7.2-17.5-.1-4.1-.8-6.8-2.9-10.6l-2.9-5.1 2.3-27.8c1.2-15.3 2.5-28.2 2.7-28.6.3-.5 1.2-.8 2-.8s83.3 41 183.4 91c100.1 50.1 182.7 91 183.5 91 .8 0 101.7-50.3 224.2-111.9 122.5-61.5 266.6-133.7 320.1-160.6 53.6-26.8 97-49.1 96.5-49.5-.9-.7-643.5-249-644.3-248.9-.3 0-72.3 29.2-160 64.8z" />
          <path d="M327.5 438.2c-.2.7-2.5 20.4-4.9 43.8-12.7 119.8-14.8 138.9-16.6 155.3-1.1 9.8-1.8 18.3-1.5 18.7.8 1.4 23.3 16.6 38.5 26.2 44.8 28.3 95.4 52.4 139.6 66.8 45.2 14.6 91.7 22.8 141.4 24.7 12.8.5 20.1.1 54-3.3 71.2-7.1 145.7-32.3 220-74.7 20.7-11.8 61.1-37.4 62.4-39.6.2-.3 0-4.4-.5-9.1-1.3-12.8-18.9-193.5-19.5-200.5-.3-3.3-.8-6.6-1-7.3-.3-.9-48.1 22.6-152.2 74.8l-151.7 76.2-153.3-76.6C398 471.5 328.8 437 328.5 437c-.3 0-.8.6-1 1.2z" />
        </svg>{" "}
        PDPedu
      </h1>

      {/* Menu Items */}
      <ul className="space-y-4">
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
    </div>
  );
};

export default Sidebar;
