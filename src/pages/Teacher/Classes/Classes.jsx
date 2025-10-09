import React, { useEffect, useState } from "react";
import API from "../../../utils/config";
import { toast } from "react-toastify";
import { handleScreenshot } from "./helpers";
import { FaRedo } from "react-icons/fa";

const Classes = () => {
  const [uiMode, setUiMode] = useState("select");

  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const [dates, setDates] = useState([]);
  const [gradesByDate, setGradesByDate] = useState({});
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [pendingGrades, setPendingGrades] = useState({});

  // Jadval yuklanmoqda
  const [loadingTable, setLoadingTable] = useState(true);
  // Sinflar va fanlar yuklanmoqda
  const [loadingInitial, setLoadingInitial] = useState(true);

  // 🔹 Sinflar va fanlarni birinchi marta olish
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
            seen.add(cls?._id);
            uniqueClasses.push(cls);
          }
        });

        setClasses(uniqueClasses);

        if (uniqueClasses.length > 0) {
          const firstClassId = uniqueClasses[0]?._id;
          setSelectedClass(firstClassId);

          const relatedSubjects = subs.filter(
            (s) => s.class?._id === firstClassId
          );
          if (relatedSubjects.length > 0) {
            setSelectedSubject(relatedSubjects[0]?._id);
          }
        }
      } catch (err) {
        console.error(err);
        toast.error("Ma'lumotlarni yuklashda xatolik ❌");
      } finally {
        setLoadingInitial(false);
      }
    };

    fetchInitial();
  }, []);

  // 🔹 Jadvalni olish funksiyasi
  const fetchGrades = async (classId) => {
    try {
      setLoadingTable(true);
      const res = await API.get(`/grades/class/${classId}`);
      const grades = res.data.grades || [];
      const datesSet = new Set();
      const gradesMap = {};

      grades.forEach((grade) => {
        const d = new Date(grade.date);
        const dateStr = d.toISOString().split("T")[0];

        datesSet.add(dateStr);

        if (!gradesMap[dateStr]) gradesMap[dateStr] = {};
        gradesMap[dateStr][grade.student._id] = grade.value;
      });

      setDates([...datesSet].sort());
      setGradesByDate(gradesMap);
    } catch (err) {
      console.error(err);
      toast.error("Baholarni yuklashda xatolik ❌");
    } finally {
      setLoadingTable(false);
    }
  };

  // 🔹 Sinf tanlanganda jadvalni yangilash
  useEffect(() => {
    if (selectedClass) fetchGrades(selectedClass);
  }, [selectedClass]);

  // 🔹 Sana qo‘shish
  const addDate = (formatted) => {
    if (!dates.includes(formatted)) {
      const updated = [...dates, formatted].sort();
      setDates(updated);
      setUnsavedChanges(true);
    }
  };

  // 🔹 Local baho o‘zgartirish
  const handleGradeChange = (studentId, date, value) => {
    setGradesByDate((prev) => {
      const copy = { ...prev };
      if (!copy[date]) copy[date] = {};
      if (value === "") delete copy[date][studentId];
      else copy[date][studentId] = value;
      return copy;
    });

    setPendingGrades((prev) => {
      const copy = { ...prev };
      if (!copy[date]) copy[date] = {};
      copy[date][studentId] = value === "" ? null : value;
      return copy;
    });

    setUnsavedChanges(true);
  };

  // 🔹 Hammasini saqlash
  const handleSave = async () => {
    const changes = [];
    Object.entries(pendingGrades).forEach(([date, students]) => {
      Object.entries(students).forEach(([studentId, value]) => {
        changes.push({ studentId, date, value });
      });
    });

    if (changes.length === 0) return;

    try {
      await API.post("/grades/bulk", {
        classId: selectedClass,
        subjectId: selectedSubject,
        changes,
      });
      setPendingGrades({});
      setUnsavedChanges(false);
      toast.success("Baholar saqlab qo‘yildi ✅");
    } catch (err) {
      console.error(err);
      toast.error("Xatolik yuz berdi ❌");
    }
  };

  // 🔹 UI
  // if (loadingInitial) {
  //   return (
  //     <div className="flex items-center justify-center h-[400px] text-lg text-gray-500">
  //       Sinflar yuklanmoqda...
  //     </div>
  //   );
  // }

  console.log(unsavedChanges);

  return (
    <div className="p-6 bg-white">
      {/* Sinf tanlash */}
      <div className="flex items-center gap-4 mb-4">
        <label className="font-semibold block mb-2">Sinf:</label>
        {loadingInitial ? (
          "Sinflar yuklanmoqda..."
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

      {/* Fan tanlash */}
      {/* {selectedClass && (
        <div className="mb-4">
          <label className="font-semibold">Fan: </label>
          <select
            value={selectedSubject || ""}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="">Tanlang</option>
            {subjects
              .filter((s) => s.class?._id === selectedClass)
              .map((subj) => (
                <option key={subj._id} value={subj._id}>
                  {subj.name}
                </option>
              ))}
          </select>
        </div>
      )} */}

      {/* Jadval ustidagi toolbar */}
      <div className="flex justify-between mb-4 items-center">
        <div>
          <label htmlFor="date" className="font-semibold">
            Sana qo‘shish:
          </label>
          <input
            id="date"
            type="date"
            onChange={(e) => {
              const val = e.target.value;
              if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
                const year = parseInt(val.split("-")[0], 10);
                if (year >= 2000 && year < 3000) addDate(val);
              }
            }}
            className="border p-2 rounded"
          />
        </div>

        <div className="flex items-center gap-4">
          <label className="font-semibold">UI rejim:</label>
          <div className="flex rounded-lg overflow-hidden border">
            <button
              onClick={() => setUiMode("select")}
              className={`px-4 py-2 transition ${
                uiMode === "select"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              Select
            </button>
            <button
              onClick={() => setUiMode("input")}
              className={`px-4 py-2 transition ${
                uiMode === "input"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              Input
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className={`px-4 py-2 rounded shadow ${
              unsavedChanges && !loadingTable
                ? "bg-blue-600 text-white"
                : "bg-gray-400 text-gray-200 cursor-not-allowed"
            }`}
            disabled={!unsavedChanges || loadingTable}
          >
            Saqlash
          </button>

          <button
            onClick={handleScreenshot}
            className="px-4 py-2 bg-purple-600 text-white rounded"
          >
            Screenshot 📸
          </button>
          <button
            onClick={() => fetchGrades(selectedClass)}
            className={`px-4 py-2 text-white rounded ${
              loadingTable ? `bg-gray-500` : `bg-blue-500`
            }`}
          >
            <FaRedo />
          </button>
        </div>
      </div>

      {/* Jadval */}
      <div
        id="grades-table"
        className="overflow-auto max-h-[500px] border border-gray-300 rounded max-w-[1250px]"
      >
        {loadingTable ? (
          <div className="flex items-center justify-center h-[500px]">
            <span className="text-gray-500 text-lg">Jadval yuklanmoqda...</span>
          </div>
        ) : (
          <table className="w-full border-collapse table-auto relative">
            <thead className="bg-gray-200 sticky top-0 z-20">
              <tr>
                <th
                  className="border p-2 bg-gray-200 z-30"
                  style={{ width: "50px" }}
                >
                  T/R
                </th>
                <th className="border p-2 bg-gray-200 z-30">O‘quvchi</th>
                {dates.map((d) => (
                  <th key={d} className="border p-2">
                    {new Date(d).toLocaleDateString("en-GB")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {classes
                .find((el) => el._id === selectedClass)
                ?.students.map(
                  (student, index) =>
                    student && (
                      <tr key={student._id}>
                        <td
                          className="border p-2 sticky left-0 bg-gray-100 z-10 text-center"
                          style={{ width: "50px" }}
                        >
                          {index + 1}
                        </td>
                        <td className="border p-2 sticky left-[50px] bg-gray-100 z-10">
                          {student.first_name} {student.last_name}
                        </td>
                        {dates.map((d) => {
                          const grade =
                            gradesByDate[d]?.[student._id]?.toString();
                          let bgColor = "bg-white text-black";

                          if (grade !== undefined && grade !== "") {
                            switch (grade) {
                              case "5":
                                bgColor = "bg-green-500 text-black";
                                break;
                              case "4":
                                bgColor = "bg-orange-400 text-black";
                                break;
                              case "3":
                                bgColor = "bg-yellow-300 text-black";
                                break;
                              case "2":
                                bgColor = "bg-red-300 text-black";
                                break;
                              case "1":
                                bgColor = "bg-red-400 text-black";
                                break;
                              case "0":
                                bgColor = "bg-red-500 text-black";
                                break;
                            }
                          }

                          return (
                            <td key={d} className="border p-2">
                              <div className={bgColor}>
                                {uiMode === "select" ? (
                                  <select
                                    value={grade ?? ""}
                                    onChange={(e) =>
                                      handleGradeChange(
                                        student._id,
                                        d,
                                        e.target.value
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
                                        e.target.value
                                      )
                                    }
                                    className="border rounded p-1 w-full text-center bg-transparent"
                                  />
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    )
                )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Classes;
