import { useEffect } from "react";
import Sidebar from "../../../components/Sidebar/Sidebar";
import Header from "../../../components/Header/Header";
import { Outlet, useNavigate } from "react-router-dom";
import "./TeacherHome.css";

const TeacherHome = () => {
  const navigate = useNavigate();
  useEffect(() => {
    let storedRole = localStorage.getItem("role");
    if (!["teacher", "director"].includes(storedRole)) {
      navigate("/login");
    }
  }, []);
  return (
    <div className="teacher-home">
      <Sidebar role={"teacher"} />
      <Header role="teacher" />
      <Outlet />
    </div>
  );
};

export default TeacherHome;
