import React, { useEffect, useState } from "react";
import API from "../../../utils/config";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { handleDailyStatsScreenshot } from "../../../helpers/DailyStatsScreenshot";

const DailyStats = () => {
  const { classId } = useParams();

  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [grades, setGrades] = useState({});

  const fetchData = async () => {
    try {
      setLoading(true);

      const res = await API.get(
        `/director/class/${classId}/daily?date=${date}`
      );

      const data = res.data;

      setSubjects(data.subjects);
      setStudents(data.students);
      setAttendance(data.attendance);
      setGrades(data.grades);
    } catch (err) {
      toast.error("Ma'lumotlarni yuklashda xatolik ❌");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [date]);

  return (
    <div className="p-4 sm:p-6 bg-white max-w-7xl mx-auto">
      {/* HEADER - responsive: stack on small screens */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold">Kunlik Statistika</h2>
          <div className="text-sm text-gray-500">{new Date(date).toLocaleDateString()}</div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleDailyStatsScreenshot}
            className="px-4 py-2 bg-purple-600 text-white rounded"
          >
            Screenshot 📸
          </button>

          <input
            type="date"
            className="border p-2 rounded text-base"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">Yuklanmoqda...</div>
      ) : (
        <>
          {/* Desktop/table view */}
          <div id="daily-stats-table" className="hidden md:block border rounded w-full overflow-auto">
            <table className="w-full min-w-[900px] border-collapse">
            <thead className="bg-gray-200 sticky top-0">
              <tr>
                <th className="border p-2">T/R</th>
                <th className="border p-2">O‘quvchi</th>

                {subjects.map((sub) => (
                  <th
                    key={`head-${sub._id}`}
                    colSpan={2}
                    className="border p-2 text-center bg-gray-300"
                  >
                    {sub.name}
                    <div className="text-xs text-gray-600">{sub.teacher}</div>
                  </th>
                ))}
              </tr>

              <tr className="bg-gray-100">
                <th></th>
                <th></th>
                {subjects.map((sub) => (
                  <React.Fragment key={`sub-${sub._id}`}>
                    <th className="border p-2">Davomat</th>
                    <th className="border p-2">Baho</th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>

            <tbody>
              {students.map((s, i) => (
                <tr key={s._id}>
                  <td className="border p-2 text-center">{i + 1}</td>

                  <td className="border p-2">{s.name}</td>

                  {subjects.map((sub) => {
                    const att = attendance[s._id]?.[sub._id] || "-";

                    const grade = grades[s._id]?.[sub._id] ?? "-";

                    return (
                      <React.Fragment key={`row-${s._id}-${sub._id}`}>
                        <td className="border p-2 text-center">
                          {att === "present"
                            ? "Bor"
                            : att === "late"
                            ? "Kech"
                            : "Yo‘q"}
                        </td>

                        <td className="border p-2 text-center">{grade}</td>
                      </React.Fragment>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          </div>

          {/* Mobile/card view */}
          <div className="md:hidden space-y-3">
            {students.map((s, i) => (
              <div key={s._id} className="border rounded p-3 bg-white shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">{i + 1}. {s.name}</div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {subjects.map((sub) => {
                    const att = attendance[s._id]?.[sub._id] || "-";
                    const grade = grades[s._id]?.[sub._id] ?? "-";
                    return (
                      <div key={`${s._id}-${sub._id}`} className="p-2 border rounded">
                        <div className="text-sm font-semibold">{sub.name}</div>
                        <div className="text-xs text-gray-600">O'qituvchi: {sub.teacher}</div>
                        <div className="mt-2 text-sm">Davomat: {att === "present" ? "Bor" : att === "late" ? "Kech" : "Yo'q"}</div>
                        <div className="text-sm">Baho: {grade}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default DailyStats;
