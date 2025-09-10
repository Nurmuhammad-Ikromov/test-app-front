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
  const [activeMonth, setActiveMonth] = useState({}); // { fan: "2025-09" }
  const token = localStorage.getItem("token");

  const months = [
    {
      index: 1,
      name: "Yanvar"
    },
    {
      index: 2,
      name: "Fevral"
    },
    {
      index: 3,
      name: "Mart"
    },
    {
      index: 4,
      name: "Aprel"
    },
    {
      index: 5,
      name: "May"
    },
    {
      index: 6,
      name: "Iyun"
    },
    {
      index: 7,
      name: "Iyul"
    },
    {
      index: 8,
      name: "Avgust"
    },
    {
      index: 9,
      name: "Sentyabr"
    },
    {
      index: 10,
      name: "Oktyabr"
    },
    {
      index: 11,
      name: "Noyabr"
    },
    {
      index: 12,
      name: "Dekabr"
    },

  ]

  useEffect(() => {
    API.get("/grades/my", {
      headers: { Authorization: "Bearer " + token },
    })
      .then((data) => {
        const sorted = (data.data.grades || []).sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        setGrades(sorted);
      })
      .catch((err) => console.error("Baholarni olishda xatolik:", err));
  }, []);

  // Sana formatlash: 8-sentyabr
  const formatDay = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    const day = d.getDate();
    const monthName = d.toLocaleDateString("uz-UZ", { month: "long" });
    return `${day}-${months[monthName.slice(2) - 1].name}`;
  };

  // Sana formatlash: 8-sentyabr, 2025 (grafikda to‘liq ko‘rsatish uchun)
  const formatFullDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("uz-UZ", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Oy formatlash: Sentyabr, 2025
  const formatMonth = (monthKey) => {
    const [year, month] = monthKey.split("-");
    const date = new Date(year, Number(month) - 1);
    const monthName = date.toLocaleDateString("uz-UZ", { month: "long" });
    return `${months[monthName.slice(2) - 1].name}, ${year}`;
  };

  // Fan bo‘yicha guruhlash
  const grouped = grades.reduce((acc, grade) => {
    const subjectName = grade.subject?.name || "Noma’lum fan";
    if (!acc[subjectName]) acc[subjectName] = [];
    acc[subjectName].push(grade);
    return acc;
  }, {});

  // Oy bo‘yicha guruhlash helper
  const groupByMonth = (gradesList) => {
    return gradesList.reduce((acc, g) => {
      const date = new Date(g.date);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0"); // 01, 02, ...
      const key = `${year}-${month}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(g);
      return acc;
    }, {});
  };

  console.log(grades);
  

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">📚 Mening baholarim</h1>

      {Object.keys(grouped).length === 0 && (
        <p className="text-gray-600">Hozircha baholar mavjud emas.</p>
      )}

      <div className="space-y-4">
        {Object.keys(grouped).map((subjectName) => {
          const gradesList = grouped[subjectName];
          const teacherName = gradesList[0]?.teacher
            ? `${gradesList[0].teacher.first_name || ""} ${gradesList[0].teacher.last_name || ""
            }`
            : "—";

          // Oylarga ajratish
          const byMonth = groupByMonth(gradesList);

          // Hozirgi aktiv oy (default oxirgi oy)
          const currentMonthKey =
            activeMonth[subjectName] ||
            Object.keys(byMonth)[Object.keys(byMonth).length - 1];

          const currentGrades = byMonth[currentMonthKey] || [];

          // Grafik uchun data
          const chartData = currentGrades.map((g, i) => ({
            index: i + 1,
            date: formatFullDate(g.date),
            value: g.value,
          }));

          return (
            <div
              key={subjectName}
              className="border rounded-lg shadow bg-white overflow-hidden"
            >
              {/* Accordion header */}
              <button
                onClick={() =>
                  setOpenSubject(
                    openSubject === subjectName ? null : subjectName
                  )
                }
                className="w-full flex justify-between items-center p-4 text-left font-semibold bg-gray-100 hover:bg-gray-200"
              >
                <span>{subjectName}</span>
                <span className="text-sm text-gray-700">{teacherName}</span>
                <span className="text-lg">
                  {openSubject === subjectName ? "−" : "+"}
                </span>
              </button>

              {/* Accordion body */}
              {openSubject === subjectName && (
                <div className="p-4 space-y-4">
                  {/* Oylarni tanlash buttonlari */}
                  <div className="flex flex-wrap gap-2">
                    {Object.keys(byMonth).map((monthKey) => (
                      <button
                        key={monthKey}
                        onClick={() =>
                          setActiveMonth((prev) => ({
                            ...prev,
                            [subjectName]: monthKey,
                          }))
                        }
                        className={`px-3 py-1 rounded-lg border ${currentMonthKey === monthKey
                          ? "bg-indigo-500 text-white"
                          : "bg-gray-100 hover:bg-gray-200"
                          }`}
                      >
                        {formatMonth(monthKey)}
                      </button>
                    ))}
                  </div>

                  {/* Jadval + Grafik */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Jadval */}
                    <div className="max-h-64 overflow-y-auto border rounded">
                      <table className="w-full border-collapse text-sm">
                        <thead className="sticky top-0 bg-gray-50">
                          <tr>
                            <th className="border p-2 text-left">Sana</th>
                            <th className="border p-2 text-center">Baho</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentGrades.map((grade) => (
                            <tr key={grade._id}>
                              <td className="border p-2">
                                {formatDay(grade.date)}
                              </td>
                              <td className="border p-2 text-center font-semibold">
                                {grade.value}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Grafik */}
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis domain={[1, 5]} />
                          <Tooltip />
                          <Line
                            type="monotone"
                            dataKey="value"
                            stroke="#4f46e5"
                            strokeWidth={2}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Grades;
