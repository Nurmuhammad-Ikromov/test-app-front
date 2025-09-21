import React from "react";
import { useLocation } from "react-router-dom";

const SingleTeacher = () => {
  const { state } = useLocation();
  const teacher = state; // navigate'dan kelgan teacher
  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">
        {teacher?.first_name} {teacher?.last_name}
      </h1>
      <p>Username: {teacher.username}</p>
      <p>Status: {teacher.active ? "Active" : "Inactive"}</p>
      <p>Role: {teacher.role}</p>
    </div>
  );
};

export default SingleTeacher;
