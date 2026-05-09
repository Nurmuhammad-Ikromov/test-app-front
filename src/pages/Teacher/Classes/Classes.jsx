/** @format */

import React, { useEffect, useState } from "react";
import API from "../../../utils/config";
import { toast } from "react-toastify";
import { handleScreenshot } from "../../../helpers/handleScreenshotGrades";
import { FaRedo, FaCamera, FaSave } from "react-icons/fa";

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
      toast.error("Davomatni yuklashda xatolik ❌");
    }
  };

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

  const addDate = (formatted) => {
    if (!dates.includes(formatted)) {
      const updated = [...dates, formatted].sort();
      setDates(updated);
      fetchAttendance(selectedClass, selectedSubject, updated);
      setUnsavedChanges(true);
    }
  };

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

  const handleAttendanceChange = (studentId, date, status) => {
    setPendingAttendance((prev) => {
      const c = { ...prev };
      if (!c[date]) c[date] = {};
      c[date][studentId] = status;
      return c;
    });
    setUnsavedChanges(true);
  };

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
      setPendingGrades({});
      setPendingAttendance({});
      setUnsavedChanges(false);
      toast.success("Ma'lumotlar saqlandi ✅");
    } catch (err) {
      toast.error("Saqlashda xatolik ❌");
    }
  };

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
    <div className="p-6 bg-[#f8faff] min-h-screen font-sans">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1e293b]">
            Dars jurnali
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            Barcha sinflar va fanlar bo'yicha hisobot
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={!unsavedChanges || loadingTable}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm ${
              unsavedChanges && !loadingTable
                ? "bg-[#5c4ae3] text-white hover:bg-[#4a39c5] shadow-lg active:scale-95"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            <FaSave /> Saqlash
          </button>
          <button
            onClick={openKeepModal}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#ff4d4f] text-white rounded-xl font-bold text-sm hover:bg-[#e03a3a] shadow-lg transition-all active:scale-95"
          >
            <FaCamera /> Screenshot
          </button>
          <button
            onClick={() => fetchGrades(selectedClass)}
            className={`p-3 rounded-xl transition-all border ${
              loadingTable
                ? "bg-gray-100 text-gray-400 border-gray-200"
                : "bg-white text-[#5c4ae3] border-[#5c4ae3] hover:bg-[#f0efff]"
            }`}
          >
            <FaRedo className={loadingTable ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* CLASS SELECTOR CARD */}
      <div className="mb-6 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4 overflow-x-auto pb-2">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">
            Sinflar:
          </span>
          {loadingInitial ? (
            <div className="animate-pulse text-gray-400 italic">
              Yuklanmoqda...
            </div>
          ) : (
            <div className="flex gap-2">
              {classes.map((cls) => (
                <button
                  key={cls._id}
                  onClick={() => setSelectedClass(cls._id)}
                  className={`px-5 py-2 rounded-xl text-sm font-bold transition-all duration-200 whitespace-nowrap ${
                    selectedClass === cls._id
                      ? "bg-[#5c4ae3] text-white shadow-md ring-4 ring-[#5c4ae3]/10"
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-100"
                  }`}
                >
                  {cls.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* TOOLBAR: DATE & UI MODE */}
      <div className="flex flex-wrap justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 bg-white p-2 px-4 rounded-2xl shadow-sm border border-gray-100">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Yangi sana:
          </label>
          <input
            type="date"
            onChange={(e) => {
              const val = e.target.value;
              if (/^\d{4}-\d{2}-\d{2}$/.test(val)) addDate(val);
            }}
            className="bg-[#f3f4f6] border-none px-3 py-2 rounded-xl text-sm font-semibold text-[#1e293b] focus:ring-2 focus:ring-[#5c4ae3] outline-none cursor-pointer"
          />
        </div>

        <div className="bg-[#eef2ff] p-1.5 rounded-2xl shadow-inner flex gap-1 border border-gray-100">
          {[
            { id: "select", label: "Ko'rish" },
            { id: "input", label: "Baholash" },
            { id: "davomat", label: "Davomat" },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setUiMode(mode.id)}
              className={`px-8 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                uiMode === mode.id
                  ? "bg-white text-[#5c4ae3] shadow-md"
                  : "text-gray-500 hover:text-[#5c4ae3]"
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN TABLE CARD */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        {loadingTable ? (
          <div className="flex flex-col items-center justify-center h-[500px]">
            <div className="w-12 h-12 border-4 border-[#5c4ae3] border-t-transparent rounded-full animate-spin mb-4"></div>
            <span className="text-gray-400 font-bold animate-pulse uppercase tracking-widest text-xs">
              Jurnal yuklanmoqda...
            </span>
          </div>
        ) : (
          <div id="grades-table" className="overflow-auto max-h-[650px]">
            <table className="w-full border-separate border-spacing-0">
              <thead className="bg-[#fcfcff] sticky top-0 z-30">
                <tr className="border-b border-gray-50">
                  <th className="p-4 text-center text-[10px] font-extrabold text-gray-400 uppercase tracking-wider border-b border-gray-50 sticky left-0 bg-[#fcfcff] z-40 w-12">
                    T/R
                  </th>
                  <th className="p-4 text-left text-[10px] font-extrabold text-gray-400 uppercase tracking-wider border-b border-gray-50 sticky left-[48px] bg-[#fcfcff] z-40 min-w-[220px]">
                    O‘quvchi
                  </th>
                  {dates.map((d) => (
                    <th
                      key={d}
                      className="p-4 text-center text-[10px] font-extrabold text-gray-400 uppercase tracking-wider border-b border-l border-gray-50 bg-[#fcfcff]"
                    >
                      {new Date(d).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                      })}
                    </th>
                  ))}
                  <th className="p-4 text-center text-[10px] font-extrabold text-[#5c4ae3] uppercase tracking-wider border-b border-l border-gray-100 sticky right-0 bg-[#fcfcff] z-40 min-w-[100px]">
                    O'rtacha %
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {classes
                  .find((el) => el._id === selectedClass)
                  ?.students.map((student, index) => (
                    <tr
                      key={student?._id}
                      className="hover:bg-[#fbfbff] transition-colors group"
                    >
                      <td className="p-4 text-xs font-bold text-gray-300 text-center sticky left-0 bg-white group-hover:bg-[#fbfbff] z-10">
                        {index + 1}
                      </td>
                      <td className="p-4 text-sm font-bold text-[#1e293b] sticky left-[48px] bg-white group-hover:bg-[#fbfbff] z-10 border-r border-gray-50 shadow-[4px_0_10px_-5px_rgba(0,0,0,0.05)]">
                        {student?.first_name} {student?.last_name}
                      </td>
                      {dates.map((d) => {
                        const grade =
                          gradesByDate[d]?.[student._id]?.toString();
                        let gradeColor = "bg-white";
                        if (grade !== undefined && grade !== "") {
                          gradeColor =
                            {
                              5: "bg-[#4cc9f0] text-white",
                              4: "bg-[#4895ef] text-white",
                              3: "bg-[#4361ee] text-white",
                              2: "bg-[#f72585] text-white",
                              1: "bg-[#7209b7] text-white",
                              0: "bg-[#3f37c9] text-white",
                            }[grade] || "bg-white text-gray-700";
                        }

                        return (
                          <td
                            key={d}
                            className="p-2 text-center border-l border-gray-50"
                          >
                            {uiMode === "davomat" ? (
                              <div className="flex gap-1 justify-center scale-90">
                                {(() => {
                                  const status =
                                    pendingAttendance[d]?.[student._id] ??
                                    attendanceByDate[d]?.[student._id] ??
                                    (gradesByDate[d]?.[student._id] != null
                                      ? "present"
                                      : "absent");
                                  const btn = (s, c, l) => (
                                    <button
                                      onClick={() =>
                                        handleAttendanceChange(
                                          student._id,
                                          d,
                                          s,
                                        )
                                      }
                                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all ${status === s ? `${c} text-white shadow-md ring-2 ring-white` : "bg-gray-100 text-gray-400 opacity-50"}`}
                                    >
                                      {l}
                                    </button>
                                  );
                                  return (
                                    <>
                                      {btn("present", "bg-emerald-500", "BOR")}
                                      {btn("late", "bg-amber-400", "KESH")}
                                      {btn("absent", "bg-rose-500", "YO'Q")}
                                    </>
                                  );
                                })()}
                              </div>
                            ) : (
                              <div
                                className={`rounded-xl p-1 transition-all duration-300 ${gradeColor} ${uiMode === "input" ? "ring-2 ring-transparent hover:ring-[#5c4ae3]/20" : ""}`}
                              >
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
                                    className="bg-transparent text-center font-bold text-sm w-full outline-none cursor-pointer"
                                  >
                                    <option value="" className="text-gray-400">
                                      -
                                    </option>
                                    {[5, 4, 3, 2, 1, 0].map((v) => (
                                      <option
                                        key={v}
                                        value={v}
                                        className="text-gray-700"
                                      >
                                        {v}
                                      </option>
                                    ))}
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
                                    className="bg-transparent font-bold text-sm w-full text-center outline-none"
                                  />
                                )}
                              </div>
                            )}
                          </td>
                        );
                      })}
                      <td className="p-4 text-center font-extrabold text-[#5c4ae3] bg-[#fcfcff] sticky right-0 z-10 border-l border-gray-100 shadow-[-4px_0_10px_-5px_rgba(0,0,0,0.05)]">
                        {calculateAveragePercent(student._id)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SCREENSHOT MODAL */}
      {showKeepModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-[#1e293b]/60 backdrop-blur-sm"
            onClick={() => setShowKeepModal(false)}
          />
          <div className="relative bg-white rounded-[2rem] p-8 w-full max-w-[400px] shadow-2xl z-[110] transform transition-all animate-in fade-in zoom-in duration-300">
            <div className="bg-[#eef2ff] w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <FaCamera className="text-[#5c4ae3] text-2xl" />
            </div>
            <h3 className="text-xl font-black text-center text-[#1e293b] mb-2">
              Screenshot sozlamalari
            </h3>
            <p className="text-sm text-center text-gray-500 mb-6 font-medium">
              Oxirgi nechta dars natijasini rasmga olmoqchisiz?
            </p>
            <div className="flex items-center gap-3 mb-6 bg-gray-50 p-4 rounded-2xl border border-gray-100">
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
                className="bg-white border border-gray-200 p-3 rounded-xl w-full text-center font-bold text-[#5c4ae3] focus:ring-2 focus:ring-[#5c4ae3] outline-none"
              />
              <div className="text-xs font-bold text-gray-400">
                / {dates.length}
              </div>
            </div>
            {keepError && (
              <div className="text-xs text-red-500 mb-4 text-center font-bold">
                {keepError}
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowKeepModal(false)}
                className="px-4 py-3 rounded-xl font-bold text-sm text-gray-500 hover:bg-gray-50 transition-all"
              >
                Bekor qilish
              </button>
              <button
                onClick={confirmKeepAndScreenshot}
                className="px-4 py-3 rounded-xl font-bold text-sm bg-[#5c4ae3] text-white shadow-lg shadow-[#5c4ae3]/30 hover:bg-[#4a39c5] transition-all active:scale-95"
              >
                Rasmga olish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Classes;
