/** @format */

import React, { useEffect, useState } from "react";
import ExamCard from "../../../components/ExamCard/ExamCard";
import API from "../../../utils/config";
import { CircularProgress, Typography, Grid2 } from "@mui/material";

const StudentExams = () => {
  const currentTime = new Date().getTime();

  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const getUserGrades = async () => {
    try {
      setLoading(true);
      setError(false);

      const res = await API.get("auth/profile");

      const availableExams = res.data?.aviableExamine || [];

      const filteredExams = availableExams.filter((exam) => {
        return exam?.endTime > currentTime && exam?.status;
      });

      setExams(filteredExams);

      localStorage.setItem("userData", JSON.stringify(res.data.user));
    } catch (err) {
      console.log(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUserGrades();
  }, []);

  // Loading State
  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-slate-50 rounded-3xl">
        <div className="flex flex-col items-center gap-4">
          <CircularProgress />

          <Typography variant="h6" className="!text-slate-600">
            Imtihonlar yuklanmoqda...
          </Typography>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="bg-white border border-red-200 rounded-3xl shadow-sm p-10 text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>

          <h2 className="text-2xl font-bold text-red-500">Xatolik yuz berdi</h2>

          <p className="text-slate-500 mt-3">
            Imtihonlarni yuklashda muammo bo‘ldi
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
              📝 Student Exams
            </h1>

            <p className="text-slate-500 mt-2 text-lg">
              Siz uchun mavjud bo‘lgan barcha imtihonlar
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl px-6 py-4 shadow-sm w-fit">
            <p className="text-sm text-slate-500">Aktiv imtihonlar</p>

            <h2 className="text-4xl font-bold text-indigo-600 mt-1">
              {exams?.length || 0}
            </h2>
          </div>
        </div>

        {/* Exams */}
        {exams?.length > 0 ? (
          <Grid2 container spacing={3}>
            {exams.map((exam, index) => (
              <Grid2 xs={12} sm={6} lg={4} key={exam?._id || exam?.id || index}>
                <div className="h-full">
                  <ExamCard {...exam} />
                </div>
              </Grid2>
            ))}
          </Grid2>
        ) : (
          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-12 text-center">
            <div className="text-7xl mb-5">📚</div>

            <h2 className="text-3xl font-bold text-slate-800">
              Hozircha imtihonlar yo‘q
            </h2>

            <p className="text-slate-500 mt-3 text-lg">
              Siz uchun aktiv imtihonlar mavjud emas
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentExams;
