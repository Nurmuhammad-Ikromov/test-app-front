import React, { useEffect, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import Navbar from "../../../components/Navbar/Navbar";
import API from "../../../utils/config";

const StudentListPage = () => {


  return (
    <div className="p-8">
      {/* Header */}

      <Navbar title="O'quvchilar ro’yxati" />
      {/* Search Bar */}
      <div className="flex justify-between mb-4">
        <Link
          to={"/teacher/add-student"}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          + Yangi O'quvchi
        </Link>
        <input
          type="text"
          placeholder="Search..."
          className="border border-gray-300 rounded-lg p-2 w-1/4"
        />
      </div>
      <div className="  max-h-[90vh] ">
        <Outlet />
      </div>
    </div>
  );
};

export default StudentListPage;
