/** @format */

import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import API from "../../../utils/config";

const Grades = () => {
  const [grades, setGrades] = useState([]);
  const [openSubject, setOpenSubject] = useState(null);
  const [activeMonth, setActiveMonth] = useState({});

  const token = localStorage.getItem("token");

  const months = [
    { index: 1, name: "Yanvar" },
    { index: 2, name: "Fevral" },
    { index: 3, name: "Mart" },
    { index: 4, name: "Aprel" },
    { index: 5, name: "May" },
    { index: 6, name: "Iyun" },
    { index: 7, name: "Iyul" },
    { index: 8, name: "Avgust" },
    { index: 9, name: "Sentyabr" },
    { index: 10, name: "Oktyabr" },
    { index: 11, name: "Noyabr" },
    { index: 12, name: "Dekabr" },
  ];

  useEffect(() => {
    API.get("/grades/my", {
      headers: {
        Authorization: "Bearer " + token,
      },
    })
      .then((data) => {
        const sorted = (data.data.grades || []).sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        );

        setGrades(sorted);
      })
      .catch((err) => {
        console.error("Baholarni olishda xatolik:", err);
      });
  }, [token]);

  const formatDay = (dateStr) => {
    if (!dateStr) return "—";

    const d = new Date(dateStr);

    const day = d.getDate();
    const monthIndex = d.getMonth();

    const monthName = months[monthIndex]?.name || "";

    return `${day}-${monthName}`;
  };

  const formatFullDate = (dateStr) => {
    if (!dateStr) return "—";

    return new Date(dateStr).toLocaleDateString("uz-UZ", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatMonth = (monthKey) => {
    if (!monthKey) return "Noma’lum sana";

    const [year, month] = monthKey.split("-");

    const monthIndex = Number(month);

    if (isNaN(monthIndex) || monthIndex < 1 || monthIndex > 12) {
      return "Noma’lum sana";
    }

    return `${months[monthIndex - 1].name}, ${year}`;
  };

  const grouped = grades.reduce((acc, grade) => {
    const subjectName = grade.subject?.name || "Noma’lum fan";

    if (!acc[subjectName]) {
      acc[subjectName] = [];
    }

    acc[subjectName].push(grade);

    return acc;
  }, {});

  const groupByMonth = (gradesList) => {
    return gradesList.reduce((acc, g) => {
      const date = new Date(g.date);

      const year = date.getFullYear();

      const month = String(date.getMonth() + 1).padStart(2, "0");

      const key = `${year}-${month}`;

      if (!acc[key]) {
        acc[key] = [];
      }

      acc[key].push(g);

      return acc;
    }, {});
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
            📚 Mening baholarim
          </h1>

          <p className="text-slate-500 mt-2">
            Fanlar bo‘yicha barcha natijalar va statistika
          </p>
        </div>

        {/* Empty */}
        {Object.keys(grouped).length === 0 && (
          <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center shadow-sm">
            <p className="text-slate-500 text-lg">
              Hozircha baholar mavjud emas.
            </p>
          </div>
        )}

        {/* Subjects */}
        <div className="space-y-6">
          {Object.keys(grouped).map((subjectName) => {
            const gradesList = grouped[subjectName];

            const teacherName = gradesList[gradesList.length - 1]?.teacher
              ? `${
                  gradesList[gradesList.length - 1].teacher.first_name || ""
                } ${gradesList[gradesList.length - 1].teacher.last_name || ""}`
              : "—";

            const byMonth = groupByMonth(gradesList);

            const currentMonthKey =
              activeMonth[subjectName] ||
              Object.keys(byMonth)[Object.keys(byMonth).length - 1];

            const currentGrades = byMonth[currentMonthKey] || [];

            const chartData = currentGrades.map((g, i) => ({
              index: i + 1,
              date: formatFullDate(g.date),
              value: g.value,
            }));

            const averageGrade = currentGrades.length
              ? (
                  currentGrades.reduce((a, b) => a + b.value, 0) /
                  currentGrades.length
                ).toFixed(1)
              : "0";

            const highestGrade = currentGrades.length
              ? Math.max(...currentGrades.map((g) => g.value))
              : "0";

            return (
              <div
                key={subjectName}
                className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden"
              >
                {/* Header */}
                <button
                  onClick={() =>
                    setOpenSubject(
                      openSubject === subjectName ? null : subjectName,
                    )
                  }
                  className="w-full px-6 py-5 flex items-center justify-between hover:bg-slate-50 transition-all duration-200"
                >
                  <div className="flex flex-col items-start text-left">
                    <h2 className="text-xl font-semibold text-slate-800">
                      {subjectName}
                    </h2>

                    <p className="text-sm text-slate-500 mt-1">{teacherName}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="hidden md:flex px-3 py-1 rounded-xl bg-indigo-50 text-indigo-600 text-sm font-medium">
                      {currentGrades.length} ta baho
                    </div>

                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl font-bold transition-all duration-300 ${
                        openSubject === subjectName
                          ? "bg-indigo-500 text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {openSubject === subjectName ? "−" : "+"}
                    </div>
                  </div>
                </button>

                {/* Body */}
                {openSubject === subjectName && (
                  <div className="px-6 pb-6 space-y-6">
                    {/* Month Buttons */}
                    <div className="flex flex-wrap gap-3">
                      {Object.keys(byMonth).map((monthKey) => (
                        <button
                          key={monthKey}
                          onClick={() =>
                            setActiveMonth((prev) => ({
                              ...prev,
                              [subjectName]: monthKey,
                            }))
                          }
                          className={`px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-200 ${
                            currentMonthKey === monthKey
                              ? "bg-indigo-500 text-white shadow-md"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          }`}
                        >
                          {formatMonth(monthKey)}
                        </button>
                      ))}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                        <p className="text-slate-500 text-sm">Jami baholar</p>

                        <h3 className="text-3xl font-bold text-slate-800 mt-2">
                          {currentGrades.length}
                        </h3>
                      </div>

                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                        <p className="text-slate-500 text-sm">O‘rtacha baho</p>

                        <h3 className="text-3xl font-bold text-indigo-600 mt-2">
                          {averageGrade}
                        </h3>
                      </div>

                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                        <p className="text-slate-500 text-sm">
                          Eng yuqori baho
                        </p>

                        <h3 className="text-3xl font-bold text-emerald-600 mt-2">
                          {highestGrade}
                        </h3>
                      </div>
                    </div>

                    {/* Table + Chart */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                      {/* Table */}
                      <div className="bg-slate-50 border border-slate-200 rounded-3xl overflow-hidden">
                        <div className="px-5 py-4 bg-white border-b border-slate-200">
                          <h3 className="font-semibold text-slate-800">
                            Baholar jadvali
                          </h3>
                        </div>

                        <div className="max-h-80 overflow-y-auto">
                          <table className="w-full text-sm">
                            <thead className="sticky top-0 bg-slate-100 z-10">
                              <tr>
                                <th className="px-5 py-3 text-left text-slate-600 font-semibold">
                                  Sana
                                </th>

                                <th className="px-5 py-3 text-center text-slate-600 font-semibold">
                                  Baho
                                </th>
                              </tr>
                            </thead>

                            <tbody>
                              {currentGrades.map((grade, index) => (
                                <tr
                                  key={grade._id}
                                  className={`hover:bg-slate-100 transition ${
                                    index !== currentGrades.length - 1
                                      ? "border-b border-slate-200"
                                      : ""
                                  }`}
                                >
                                  <td className="px-5 py-4 text-slate-700">
                                    {formatDay(grade.date)}
                                  </td>

                                  <td className="px-5 py-4 text-center">
                                    <span
                                      className={`px-3 py-1 rounded-xl text-sm font-bold ${
                                        grade.value >= 5
                                          ? "bg-emerald-100 text-emerald-700"
                                          : grade.value >= 4
                                            ? "bg-indigo-100 text-indigo-700"
                                            : "bg-amber-100 text-amber-700"
                                      }`}
                                    >
                                      {grade.value}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Chart */}
                      <div className="bg-white border border-slate-200 rounded-3xl p-5">
                        <div className="mb-4">
                          <h3 className="font-semibold text-slate-800">
                            Baholar statistikasi
                          </h3>

                          <p className="text-sm text-slate-500 mt-1">
                            Oylik o‘zgarish grafigi
                          </p>
                        </div>

                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                              <CartesianGrid
                                strokeDasharray="4 4"
                                stroke="#e2e8f0"
                              />

                              <XAxis
                                dataKey="date"
                                tick={{
                                  fill: "#64748b",
                                  fontSize: 12,
                                }}
                              />

                              <YAxis
                                domain={[1, 5]}
                                tick={{
                                  fill: "#64748b",
                                  fontSize: 12,
                                }}
                              />

                              <Tooltip
                                contentStyle={{
                                  borderRadius: "16px",
                                  border: "1px solid #e2e8f0",
                                  backgroundColor: "#ffffff",
                                }}
                              />

                              <Line
                                type="monotone"
                                dataKey="value"
                                stroke="#6366f1"
                                strokeWidth={4}
                                dot={{
                                  r: 5,
                                  strokeWidth: 3,
                                  fill: "#ffffff",
                                }}
                                activeDot={{
                                  r: 7,
                                }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Grades;
