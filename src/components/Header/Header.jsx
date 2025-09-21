import React, { useState } from "react";
import { FaRegBell } from "react-icons/fa6";
import { CiMail } from "react-icons/ci";
import { RxAvatar } from "react-icons/rx";
import { MdKeyboardArrowDown } from "react-icons/md";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Header = ({ userFirstName, role }) => {
  const location = useLocation();

  const getTitle = () => {
    if (location.pathname.startsWith("/teacher/classes")) {
      return "Dars jurnali";
    } else if (location.pathname.startsWith("/teacher/students")) {
      return "O'quvchilar ro'yxati";
    } else if (location.pathname.startsWith("/teacher/exams")) {
      return "Imtihonlar";
    } else if (location.pathname.startsWith("/teacher/tests")) {
      return "Testlar";
    } else if (location.pathname === "/dashboard") {
      return "Bosh sahifa";
    } else {
      return "Platforma";
    }
  };
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem("userData")) || null;
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [avatar] = useState(() => {
    return (
      localStorage.getItem("profileImage") || <RxAvatar className="w-5 h-5" />
    );
  });
  // Dropdownni tashqaridan bosganda yopish
  const handleOutsideClick = (e) => {
    if (!e.target.closest(".profile-dropdown")) {
      setDropdownOpen(false);
    }
  };

  // DOMning boshqa joylariga bosish hodisasini ushlab olish
  React.useEffect(() => {
    document.addEventListener("click", handleOutsideClick);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  return (
    <div className="w-full flex justify-between items-center bg-white p-4  shadow-md">
      <h2 className="font-bold text-2xl">{getTitle()}</h2>

      {/* Bildirishnomalar va Xabarlar */}
      <div className="flex items-center gap-4">
        {/* Foydalanuvchi profili */}
        <div className="relative profile-dropdown ">
          <div
            className="flex items-center gap-2 cursor-pointer bg-gray-100 p-2 rounded-full hover:bg-gray-200"
            onClick={() => setDropdownOpen((prev) => !prev)}
          >
            {avatar.length ? (
              <img
                className="rounded-full w-8 h-8 object-cover"
                src={avatar}
                alt=""
              />
            ) : (
              <RxAvatar className="w-8 h-8" />
            )}
            <span className="text-sm font-medium truncate max-w-[100px]">
              {userData?.user?.first_name
                ? userData.user.first_name
                : "loading"}
            </span>
            <MdKeyboardArrowDown />
          </div>
          {/* Dropdown menyusi */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 shadow-lg rounded-lg z-50">
              <Link
                to={`/${role}/profile/info`}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setDropdownOpen(false)} // Dropdownni yopish
              >
                Profile
              </Link>
              <button
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => {
                  setDropdownOpen(false); // Dropdownni yopish
                  localStorage.removeItem("token");
                  localStorage.removeItem("role");
                  navigate("/login");
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
