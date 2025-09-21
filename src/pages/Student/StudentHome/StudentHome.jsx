import React, { useEffect, useState } from "react";
import Sidebar from "../../../components/Sidebar/Sidebar";
import Header from "../../../components/Header/Header";
import { Outlet, useNavigate } from "react-router-dom";
import "./StudentHome.css";
import API from "../../../utils/config";

const StudentHome = () => {
  const [userFirstName, setUserFirstName] = useState(null);
  const navigate = useNavigate();

  const getUserData = async () => {
    try {
      const res = await API.get("/auth/profile");
      setUserFirstName(res.data.user.first_name);
    } catch (error) {
      navigate("/login");
    }
  };

  useEffect(() => {
    getUserData();
  }, []);

  return (
    <div className="student-home">
      <Sidebar role="student" />
      <Header userFirstName={userFirstName} role="student" />
      <Outlet />
    </div>
  );
};

export default StudentHome;
