import { NavLink, Outlet } from "react-router-dom";

const Profile = () => {
  return (
    <div className="p-6">
      {/* Tabs */}
      <ul className="flex gap-4 border-b-2 pb-2">
        <li>
          <NavLink
            to="info"
            className={({ isActive }) =>
              `px-4 py-2 rounded-t-md ${
                isActive
                  ? "border-b-2 border-gray-800 text-gray-800"
                  : "text-gray-500 hover:border-gray-500 hover:border-b-2"
              }`
            }
          >
            Profile Info
          </NavLink>
        </li>
        <li>
          <NavLink
            to="history"
            className={({ isActive }) =>
              `px-4 py-2 rounded-t-md ${
                isActive
                  ? "border-b-2 border-gray-800 text-gray-800"
                  : "text-gray-500 hover:border-gray-500 hover:border-b-2"
              }`
            }
          >
            History
          </NavLink>
        </li>
      </ul>

      {/* Content */}
      <div className="mt-4">
        <Outlet />
      </div>
    </div>
  );
};

export default Profile;
