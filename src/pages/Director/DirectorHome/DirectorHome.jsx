import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../../../components/Sidebar/Sidebar";
import Header from "../../../components/Header/Header";
import {jwtDecode} from "jwt-decode";

const DirectorHome = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const storedRole = decoded.role;

      if (storedRole !== "director") {
        navigate("/login");
      }
    } catch (err) {
      // Agar token yaroqsiz bo‘lsa (decode xato bersa)
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className="teacher-home">
      <Sidebar role="director" />
      <Header role="director" />
      <Outlet />
    </div>
  );
};

export default DirectorHome;
