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

  // Add new date (WE REMOVED /attendance/generate)
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

  return (
    <div className="p-6 bg-white">
      {/* CLASS SELECT */}
      <div className="flex items-center gap-4 mb-4">
        <label className="font-semibold">Sinf:</label>
        {loadingInitial ? (
          "Yuklanmoqda..."
        ) : (
          <div className="flex flex-wrap gap-2">
            {classes.map((cls) => (
              <button
                key={cls._id}
                onClick={() => setSelectedClass(cls._id)}
                className={`px-4 py-2 rounded border ${
                  selectedClass === cls._id
                    ? "bg-green-500 text-white"
                    : "bg-white text-black"
                }`}
              >
                {cls.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* TOP TOOLBAR */}
      <div className="flex justify-between mb-4 items-center">
        <div>
          <label className="font-semibold">Sana qo'shish:</label>
          <input
            type="date"
            onChange={(e) => {
              const val = e.target.value;
              if (/^\d{4}-\d{2}-\d{2}$/.test(val)) addDate(val);
            }}
            className="border p-2 rounded"
          />
        </div>

        <div className="flex items-center gap-4">
          <label className="font-semibold">UI:</label>
          <div className="flex rounded overflow-hidden border">
            <button
              onClick={() => setUiMode("select")}
              className={`px-4 py-2 ${
                uiMode === "select" ? "bg-blue-600 text-white" : "bg-white"
              }`}
            >
              Select
            </button>
            <button
              onClick={() => setUiMode("input")}
              className={`px-4 py-2 ${
                uiMode === "input" ? "bg-blue-600 text-white" : "bg-white"
              }`}
            >
              Input
            </button>
            <button
              onClick={() => setUiMode("davomat")}
              className={`px-4 py-2 ${
                uiMode === "davomat" ? "bg-blue-600 text-white" : "bg-white"
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
            className={`px-4 py-2 rounded shadow ${
              unsavedChanges && !loadingTable
                ? "bg-blue-600 text-white"
                : "bg-gray-400 text-gray-200"
            }`}
          >
            Saqlash
          </button>

          <button
            onClick={openKeepModal}
            className="px-4 py-2 bg-purple-600 text-white rounded"
          >
            Screenshot 📸
          </button>

          <button
            onClick={() => fetchGrades(selectedClass)}
            className={`px-4 py-2 text-white rounded ${
              loadingTable ? "bg-gray-500" : "bg-blue-500"
            }`}
          >
            <FaRedo />
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div
        id="grades-table"
        className="overflow-auto max-h-[500px] border border-gray-300 rounded max-w-[1250px]"
      >
        {loadingTable ? (
          <div className="flex items-center justify-center h-[500px]">
            <span className="text-gray-500 text-lg">Yuklanmoqda...</span>
          </div>
        ) : (
          <table className="w-full border-collapse table-auto relative">
            <thead className="bg-gray-200 sticky top-0 z-20">
              <tr>
                <th className="border p-2 sticky left-0 bg-gray-200">T/R</th>
                <th className="border p-2 sticky left-[44px] bg-gray-200">
                  O‘quvchi
                </th>
                {dates.map((d) => (
                  <th key={d} className="border p-2 sticky top-0 bg-gray-200">
                    {new Date(d).toLocaleDateString("en-GB")}
                  </th>
                ))}
                <th className="border p-2 sticky right-0 bg-gray-200 min-w-[120px]">
                  O‘rtacha
                </th>
              </tr>
            </thead>

            <tbody>
              {classes
                .find((el) => el._id === selectedClass)
                ?.students.map((student, index) => (
                  <tr key={student?._id}>
                    <td className="border p-2 sticky left-0 bg-gray-100 text-center">
                      {index + 1}
                    </td>

                    <td className="border p-2 sticky left-[50px] bg-gray-100">
                      {student?.first_name} {student?.last_name}
                    </td>

                    {dates.map((d) => {
                      const grade = gradesByDate[d]?.[student._id]?.toString();
                      let bgColor = "bg-white";

                      // grade coloring
                      if (grade !== undefined && grade !== "") {
                        bgColor =
                          {
                            5: "bg-green-500",
                            4: "bg-orange-400",
                            3: "bg-yellow-300",
                            2: "bg-red-300",
                            1: "bg-red-400",
                            0: "bg-red-500",
                          }[grade] || "bg-white";
                      }

                      return (
                        <td key={d} className="border p-2">
                          {uiMode === "davomat" ? (
                            // 🔥 Davomat uchun maxsus oq fon — baho ranglari ta’sir qilmaydi
                            <div className="bg-white">
                              {(() => {
                                const attendanceStatus =
                                  pendingAttendance[d]?.[student._id] ??
                                  attendanceByDate[d]?.[student._id] ??
                                  (gradesByDate[d]?.[student._id] != null
                                    ? "present"
                                    : "absent");

                                const makeButton = (status, color) => {
                                  const isActive = attendanceStatus === status;
                                  return `
            ${color}
            text-white 
            px-2 py-1 
            rounded 
            transition 
            duration-150
            ${isActive ? "opacity-100 ring-2 ring-black/20" : "opacity-40"}
          `;
                                };

                                return (
                                  <div className="flex gap-2 justify-center">
                                    <button
                                      onClick={() =>
                                        handleAttendanceChange(
                                          student._id,
                                          d,
                                          "present",
                                        )
                                      }
                                      className={makeButton(
                                        "present",
                                        "bg-green-500",
                                      )}
                                    >
                                      Bor
                                    </button>

                                    <button
                                      onClick={() =>
                                        handleAttendanceChange(
                                          student._id,
                                          d,
                                          "late",
                                        )
                                      }
                                      className={makeButton(
                                        "late",
                                        "bg-yellow-400",
                                      )}
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
                                      className={makeButton(
                                        "absent",
                                        "bg-red-500",
                                      )}
                                    >
                                      Yo‘q
                                    </button>
                                  </div>
                                );
                              })()}
                            </div>
                          ) : (
                            // 🔥 Select/Input uchun — baho ranglari ishlaydi
                            <div className={bgColor}>
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
                                  className="border rounded p-1 w-full bg-transparent"
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
                                  className="border rounded p-1 w-full text-center bg-transparent"
                                />
                              )}
                            </div>
                          )}
                        </td>
                      );
                    })}

                    <td className="border p-2 text-center font-semibold bg-gray-100 sticky right-0">
                      {calculateAveragePercent(student._id)}
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

          <div className="relative bg-white rounded-lg p-6 w-[360px] shadow-lg z-60">
            <h3 className="text-lg font-semibold mb-2">
              Screenshot sozlamalari
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Nechta <strong>oxirgi</strong> sanani olish? (0 — hech biri)
            </p>

            <div className="flex items-center gap-2 mb-3">
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
                className="border p-2 rounded w-full"
              />
              <div className="text-sm text-gray-500">/ {dates.length}</div>
            </div>

            {keepError && (
              <div className="text-sm text-red-500 mb-2">{keepError}</div>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowKeepModal(false)}
                className="px-4 py-2 rounded border"
              >
                Bekor qilish
              </button>
              <button
                onClick={confirmKeepAndScreenshot}
                className="px-4 py-2 rounded bg-blue-600 text-white"
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
