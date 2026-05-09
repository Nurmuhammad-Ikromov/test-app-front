/** @format */

import React, { useEffect, useState } from "react";
import API from "../../../utils/config";
import { toast } from "react-toastify";
import { handleScreenshot } from "../../../helpers/handleScreenshotGrades";
import { FaRedo } from "react-icons/fa";

const Classes = () => {
  const [uiMode, setUiMode] = useState("select");

  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const [dates, setDates] = useState([]);
  const [gradesByDate, setGradesByDate] = useState({});
  const [attendanceByDate, setAttendanceByDate] = useState({});

  const [pendingGrades, setPendingGrades] = useState({});
  const [pendingAttendance, setPendingAttendance] = useState({});

  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [loadingTable, setLoadingTable] = useState(true);
  const [loadingInitial, setLoadingInitial] = useState(true);

  const [showKeepModal, setShowKeepModal] = useState(false);
  const [keepCount, setKeepCount] = useState(3);
  const [keepError, setKeepError] = useState("");

  const calculateAveragePercent = (studentId) => {
    let total = 0;
    let count = 0;

    dates.forEach((d) => {
      const grade = Number(gradesByDate[d]?.[studentId]);
      if (!isNaN(grade)) {
        total += grade;
        count++;
      }
    });

    if (count === 0) return "-";
    const percent = (total / (count * 5)) * 100;
    return percent.toFixed(1) + "%";
  };

  // Initial load (subjects + classes)
  useEffect(() => {
    const fetchInitial = async () => {
      try {
        setLoadingInitial(true);
        const res = await API.get("/subjects/my-subjects");
        const subs = res.data.subjects || [];
        setSubjects(subs);

        const uniqueClasses = [];
        const seen = new Set();
        subs.forEach((subj) => {
          const cls = subj.class;
          if (cls && !seen.has(cls?._id)) {
            seen.add(cls._id);
            uniqueClasses.push(cls);
          }
        });

        setClasses(uniqueClasses);

        if (uniqueClasses.length > 0) {
          const firstClassId = uniqueClasses[0]._id;
          setSelectedClass(firstClassId);

          const related = subs.filter((s) => s.class?._id === firstClassId);
          if (related.length > 0) setSelectedSubject(related[0]._id);
        }
      } catch (err) {
        toast.error("Ma'lumotlarni yuklashda xatolik ❌");
      } finally {
        setLoadingInitial(false);
      }
    };

    fetchInitial();
  }, []);

  // Fetch attendance
  const fetchAttendance = async (classId, subjectId, datesArr) => {
    if (!classId || !subjectId || !datesArr.length) {
      setAttendanceByDate({});
      return;
    }

    try {
      const qs = datesArr.join(",");
      const res = await API.get("/attendance/list", {
        params: { classId, subjectId, dates: qs },
      });
      setAttendanceByDate(res.data || {});
    } catch (err) {
      console.error(err);
      toast.error("Davomatni yuklashda xatolik ❌");
    }
  };

  // Fetch grades + then attendance
  const fetchGrades = async (classId) => {
    try {
      setLoadingTable(true);
      const res = await API.get(`/grades/class/${classId}`);
      const grades = res.data.grades || [];

      const datesSet = new Set();
      const gmap = {};

      grades.forEach((g) => {
        const d = new Date(g.date).toISOString().split("T")[0];
        datesSet.add(d);

        if (!gmap[d]) gmap[d] = {};
        gmap[d][g.student?._id] = g.value;
      });

      const sorted = [...datesSet].sort();
      setDates(sorted);
      setGradesByDate(gmap);

      if (selectedSubject)
        await fetchAttendance(classId, selectedSubject, sorted);
    } catch (err) {
      toast.error("Baholarni yuklashda xatolik ❌");
    } finally {
      setLoadingTable(false);
    }
  };

  useEffect(() => {
    if (selectedClass) fetchGrades(selectedClass);
  }, [selectedClass]);

  // Add new date
  const addDate = (formatted) => {
    if (!dates.includes(formatted)) {
      const updated = [...dates, formatted].sort();
      setDates(updated);
      fetchAttendance(selectedClass, selectedSubject, updated);
      setUnsavedChanges(true);
    }
  };

  // Local grade change
  const handleGradeChange = (studentId, date, value) => {
    setGradesByDate((prev) => {
      const c = { ...prev };
      if (!c[date]) c[date] = {};
      if (value === "") delete c[date][studentId];
      else c[date][studentId] = value;
      return c;
    });

    setPendingGrades((prev) => {
      const c = { ...prev };
      if (!c[date]) c[date] = {};
      c[date][studentId] = value === "" ? null : value;
      return c;
    });

    setUnsavedChanges(true);
  };

  // Local attendance change
  const handleAttendanceChange = (studentId, date, status) => {
    setPendingAttendance((prev) => {
      const c = { ...prev };
      if (!c[date]) c[date] = {};
      c[date][studentId] = status;
      return c;
    });
    setUnsavedChanges(true);
  };

  // Save both grades + attendance
  const handleSave = async () => {
    const gradeChanges = [];
    Object.entries(pendingGrades).forEach(([date, students]) =>
      Object.entries(students).forEach(([studentId, value]) =>
        gradeChanges.push({ studentId, date, value }),
      ),
    );

    const attChanges = [];
    Object.entries(pendingAttendance).forEach(([date, students]) =>
      Object.entries(students).forEach(([studentId, status]) =>
        attChanges.push({ studentId, date, status }),
      ),
    );

    try {
      if (gradeChanges.length) {
        await API.post("/grades/bulk", {
          classId: selectedClass,
          subjectId: selectedSubject,
          changes: gradeChanges,
        });
      }

      if (attChanges.length) {
        await API.post("/attendance/bulk", {
          classId: selectedClass,
          subjectId: selectedSubject,
          changes: attChanges,
        });
      }

      await fetchGrades(selectedClass);
      await fetchAttendance(selectedClass, selectedSubject, dates);

      setPendingGrades({});
      setPendingAttendance({});
      setUnsavedChanges(false);
      toast.success("Ma'lumotlar saqlandi ✅");
    } catch (err) {
      toast.error("Saqlashda xatolik ❌");
    }
  };

  // Screenshot modal
  const openKeepModal = () => {
    setKeepCount(Math.min(3, dates.length));
    setKeepError("");
    setShowKeepModal(true);
  };

  const confirmKeepAndScreenshot = () => {
    const val = Number(keepCount);
    const max = dates.length;

    if (Number.isNaN(val) || val < 0 || val > max) {
      setKeepError(`0 dan ${max} gacha son kiriting.`);
      return;
    }

    handleScreenshot(val);
    setShowKeepModal(false);
  };

  // Get first letter of teacher name for avatar
  const getTeacherInitial = (teacher) => {
    if (!teacher) return "?";
    const firstName = teacher.first_name || "";
    const lastName = teacher.last_name || "";
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  };

  // Prepare class data with additional info
  const classCardsData = classes.map((cls) => {
    const classSubjects = subjects.filter((s) => s.class?._id === cls._id);
    const mainSubject = classSubjects[0]?.subject?.name || "Fan";
    const studentCount = cls.students?.length || 0;
    const teacher = cls.teacher;

    const schedules = {
      "10-A": "Dush, Chor, Jum - 09:00",
      "11-B": "Sesh, Pay, Shan - 14:00",
      "9-A": "Dush, Chor - 10:30",
      "10-B": "Sesh, Jum - 13:00",
      "9-B": "Pay, Chor, Shan - 11:00",
      "11-A": "Dush, Sesh, Jum - 15:00",
    };

    const avgScores = {
      "10-A": 87,
      "11-B": 82,
      "9-A": 85,
      "10-B": 90,
      "9-B": 86,
      "11-A": 88,
    };

    return {
      ...cls,
      subjectName: mainSubject,
      studentCount: studentCount,
      teacherName: teacher
        ? `${teacher.first_name || ""} ${teacher.last_name || ""}`
        : "O'qituvchi",
      teacherInitial: getTeacherInitial(teacher),
      schedule: schedules[cls.name] || "Dush - Jum 09:00",
      avgScore: avgScores[cls.name] || 85,
    };
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* CLASS SELECT BUTTONS */}
      <div className="flex items-center gap-4 mb-6">
        <label className="font-semibold text-gray-700">Sinf:</label>
        {loadingInitial ? (
          <span className="text-gray-500">Yuklanmoqda...</span>
        ) : (
          <div className="flex flex-wrap gap-2">
            {classes.map((cls) => (
              <button
                key={cls._id}
                onClick={() => setSelectedClass(cls._id)}
                className={`px-4 py-2 rounded-lg transition ${
                  selectedClass === cls._id
                    ? "bg-green-500 text-white shadow-md"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                {cls.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* CLASS CARDS SECTION - NEW DESIGN */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Sinflar</h2>
            <p className="text-gray-500 text-sm mt-1">
              Barcha sinflar va ularning ma'lumotlari
            </p>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Qidirish..."
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm w-64 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <svg
              className="absolute left-3 top-2.5 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classCardsData.map((cls) => (
            <div
              key={cls._id}
              onClick={() => setSelectedClass(cls._id)}
              className={`bg-white rounded-2xl border transition-all cursor-pointer hover:shadow-lg ${
                selectedClass === cls._id
                  ? "border-green-500 ring-2 ring-green-200 shadow-md"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="p-5 border-b border-gray-100">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      {cls.name}
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">
                      {cls.subjectName}
                    </p>
                  </div>
                  <div className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-semibold">
                    {cls.studentCount} ta
                  </div>
                </div>
              </div>

              <div className="p-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                    {cls.teacherInitial}
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Sinf rahbari</p>
                    <p className="font-semibold text-gray-800">
                      {cls.teacherName}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{cls.schedule}</p>
                  </div>
                </div>
              </div>

              <div className="p-5 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400">O'rtacha ball</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {cls.avgScore}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">O'quvchilar</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {cls.studentCount}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TOP TOOLBAR */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <label className="font-semibold text-gray-700">Sana qo'shish:</label>
          <input
            type="date"
            onChange={(e) => {
              const val = e.target.value;
              if (/^\d{4}-\d{2}-\d{2}$/.test(val)) addDate(val);
            }}
            className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="flex items-center gap-4">
          <label className="font-semibold text-gray-700">UI:</label>
          <div className="flex rounded-lg overflow-hidden border border-gray-300">
            <button
              onClick={() => setUiMode("select")}
              className={`px-4 py-2 transition ${
                uiMode === "select"
                  ? "bg-green-500 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Select
            </button>
            <button
              onClick={() => setUiMode("input")}
              className={`px-4 py-2 transition ${
                uiMode === "input"
                  ? "bg-green-500 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Input
            </button>
            <button
              onClick={() => setUiMode("davomat")}
              className={`px-4 py-2 transition ${
                uiMode === "davomat"
                  ? "bg-green-500 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Davomat
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={!unsavedChanges || loadingTable}
            className={`px-4 py-2 rounded-lg shadow transition ${
              unsavedChanges && !loadingTable
                ? "bg-green-500 text-white hover:bg-green-600"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Saqlash
          </button>

          <button
            onClick={openKeepModal}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
          >
            Screenshot 📸
          </button>

          <button
            onClick={() => fetchGrades(selectedClass)}
            className={`px-4 py-2 text-white rounded-lg transition ${
              loadingTable ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            <FaRedo />
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div
        id="grades-table"
        className="overflow-auto max-h-[500px] border border-gray-200 rounded-xl bg-white"
      >
        {loadingTable ? (
          <div className="flex items-center justify-center h-[500px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500 mx-auto mb-3"></div>
              <span className="text-gray-500">Yuklanmoqda...</span>
            </div>
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead className="bg-gray-50 sticky top-0 z-20">
              <tr>
                <th className="border-b border-gray-200 p-3 text-left sticky left-0 bg-gray-50 w-[60px]">
                  T/R
                </th>
                <th className="border-b border-gray-200 p-3 text-left sticky left-[60px] bg-gray-50 min-w-[180px]">
                  O‘quvchi
                </th>
                {dates.map((d) => (
                  <th
                    key={d}
                    className="border-b border-gray-200 p-3 text-center min-w-[120px]"
                  >
                    {new Date(d).toLocaleDateString("en-GB")}
                  </th>
                ))}
                <th className="border-b border-gray-200 p-3 text-center sticky right-0 bg-gray-50 min-w-[100px]">
                  O‘rtacha
                </th>
              </tr>
            </thead>
            <tbody>
              {classes
                .find((el) => el._id === selectedClass)
                ?.students.map((student, index) => (
                  <tr
                    key={student?._id}
                    className="hover:bg-gray-50 transition"
                  >
                    <td className="border-b border-gray-100 p-3 sticky left-0 bg-white text-center text-gray-500">
                      {index + 1}
                    </td>
                    <td className="border-b border-gray-100 p-3 sticky left-[60px] bg-white font-medium">
                      {student?.first_name} {student?.last_name}
                    </td>
                    {dates.map((d) => {
                      const grade = gradesByDate[d]?.[student._id]?.toString();
                      let gradeColor = "";

                      if (uiMode !== "davomat" && grade && grade !== "") {
                        const colors = {
                          5: "bg-green-100 text-green-700",
                          4: "bg-orange-100 text-orange-700",
                          3: "bg-yellow-100 text-yellow-700",
                          2: "bg-red-100 text-red-700",
                          1: "bg-red-200 text-red-800",
                          0: "bg-red-300 text-red-900",
                        };
                        gradeColor = colors[grade] || "";
                      }

                      return (
                        <td key={d} className="border-b border-gray-100 p-2">
                          {uiMode === "davomat" ? (
                            <div className="flex gap-1 justify-center">
                              <button
                                onClick={() =>
                                  handleAttendanceChange(
                                    student._id,
                                    d,
                                    "present",
                                  )
                                }
                                className={`px-2 py-1 text-xs rounded transition ${
                                  (pendingAttendance[d]?.[student._id] ??
                                    attendanceByDate[d]?.[student._id]) ===
                                  "present"
                                    ? "bg-green-500 text-white"
                                    : "bg-gray-100 text-gray-500 hover:bg-green-200"
                                }`}
                              >
                                Bor
                              </button>
                              <button
                                onClick={() =>
                                  handleAttendanceChange(student._id, d, "late")
                                }
                                className={`px-2 py-1 text-xs rounded transition ${
                                  (pendingAttendance[d]?.[student._id] ??
                                    attendanceByDate[d]?.[student._id]) ===
                                  "late"
                                    ? "bg-yellow-500 text-white"
                                    : "bg-gray-100 text-gray-500 hover:bg-yellow-200"
                                }`}
                              >
                                Kech
                              </button>
                              <button
                                onClick={() =>
                                  handleAttendanceChange(
                                    student._id,
                                    d,
                                    "absent",
                                  )
                                }
                                className={`px-2 py-1 text-xs rounded transition ${
                                  (pendingAttendance[d]?.[student._id] ??
                                    attendanceByDate[d]?.[student._id]) ===
                                  "absent"
                                    ? "bg-red-500 text-white"
                                    : "bg-gray-100 text-gray-500 hover:bg-red-200"
                                }`}
                              >
                                Yo‘q
                              </button>
                            </div>
                          ) : (
                            <div className={gradeColor}>
                              {uiMode === "select" ? (
                                <select
                                  value={grade ?? ""}
                                  onChange={(e) =>
                                    handleGradeChange(
                                      student._id,
                                      d,
                                      e.target.value,
                                    )
                                  }
                                  className="border border-gray-200 rounded-lg p-1.5 w-full text-center bg-white focus:ring-2 focus:ring-green-500 outline-none"
                                >
                                  <option value="">-</option>
                                  <option value="5">5</option>
                                  <option value="4">4</option>
                                  <option value="3">3</option>
                                  <option value="2">2</option>
                                  <option value="1">1</option>
                                  <option value="0">0</option>
                                </select>
                              ) : (
                                <input
                                  type="number"
                                  min={0}
                                  max={5}
                                  value={grade ?? ""}
                                  onChange={(e) =>
                                    handleGradeChange(
                                      student._id,
                                      d,
                                      e.target.value,
                                    )
                                  }
                                  className="border border-gray-200 rounded-lg p-1.5 w-full text-center bg-white focus:ring-2 focus:ring-green-500 outline-none"
                                />
                              )}
                            </div>
                          )}
                        </td>
                      );
                    })}
                    <td className="border-b border-gray-100 p-3 text-center font-semibold sticky right-0 bg-white">
                      <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm">
                        {calculateAveragePercent(student._id)}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL */}
      {showKeepModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black opacity-40"
            onClick={() => setShowKeepModal(false)}
          />
          <div className="relative bg-white rounded-2xl p-6 w-[400px] shadow-xl">
            <h3 className="text-xl font-bold mb-2">Screenshot sozlamalari</h3>
            <p className="text-gray-500 mb-4">
              Nechta <strong>oxirgi</strong> sanani olish?
            </p>
            <div className="flex items-center gap-3 mb-4">
              <input
                type="number"
                min={0}
                max={dates.length}
                value={keepCount}
                onChange={(e) =>
                  setKeepCount(
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
                className="border border-gray-200 rounded-xl p-3 w-full focus:ring-2 focus:ring-green-500 outline-none"
              />
              <span className="text-gray-500">/ {dates.length}</span>
            </div>
            {keepError && (
              <p className="text-red-500 text-sm mb-3">{keepError}</p>
            )}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowKeepModal(false)}
                className="px-5 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition"
              >
                Bekor qilish
              </button>
              <button
                onClick={confirmKeepAndScreenshot}
                className="px-5 py-2 rounded-xl bg-green-500 text-white hover:bg-green-600 transition"
              >
                Saqlab olish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Classes;
