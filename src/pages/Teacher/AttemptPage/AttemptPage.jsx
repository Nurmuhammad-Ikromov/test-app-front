import React from "react";
import Navbar from "../../../components/Navbar/Navbar";
import { Link, Outlet, useParams } from "react-router-dom";

const AttemptPage = () => {
    return <div className="p-8">
        {/* Header */}

        <Navbar title="Sinovlar ro’yxati" />
        {/* Search Bar */}
        <div className="flex justify-between mb-4">
            {/* <Link to={"/exams/create"} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
                + Yangi Imtihon
            </Link> */}
            <input
                type="text"
                placeholder="Search..."
                className="border border-gray-300 rounded-lg p-2 w-1/4"
            />
        </div>

        <Outlet />

    </div>;;
};

export default AttemptPage;
