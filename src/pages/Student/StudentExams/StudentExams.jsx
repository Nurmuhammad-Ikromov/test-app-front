import React, { useEffect, useState } from "react";
import ExamCard from "../../../components/ExamCard/ExamCard";
import API from "../../../utils/config";
import { CircularProgress, Typography, Grid2, Box } from "@mui/material";
import "./StudentExams.css";

const StudentExams = () => {
  const time = new Date().getTime();
  const [exams, setExams] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [userGrades, setUserGrades] = useState(null);

  const getUserGrades = async () => {
    try {
      const res = await API.get("auth/profile");
      setUserGrades(res.data.user.grades);
      setExams(
        res.data?.aviableExamine?.filter((exam) => {
          return exam.endTime > time && exam.status;
        })
      );
      localStorage.setItem("userData", JSON.stringify(res.data.user));
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getUserGrades();
  }, []);
  if (loading) {
    return (
      <div className="p-4 loading-container flex min-[450px] items-center justify-center flex-col">
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading exams...
        </Typography>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 error-container">
        <Typography variant="h6" color="error">
          Failed to load exams. Please try again later.
        </Typography>
      </div>
    );
  }

  return (
    <Box className="student-exams p-3 ">
      <Typography variant="h4" gutterBottom>
        Student Exams
      </Typography>
      <Grid2 container spacing={3}>
        {exams?.length ? (
          exams.map((exam) => (
            <Grid2 xs={12} sm={6} md={4} key={exam.id}>
              <ExamCard {...exam} />
            </Grid2>
          ))
        ) : (
          <Typography variant="h4" gutterBottom>
            Siz uchun hozirda imtihonlar yo'q
          </Typography>
        )}
      </Grid2>
    </Box>
  );
};

export default StudentExams;
