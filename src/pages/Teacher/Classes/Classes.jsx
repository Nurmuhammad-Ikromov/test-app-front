import React, { useEffect, useState } from "react";
import API from "../api"; // API instance joylashgan faylni to‘g‘ri import qil

const Classes = () => {
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [selectedClass, setSelectedClass] = useState(null);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [dates, setDates] = useState([]);
    const [gradesByDate, setGradesByDate] = useState({});
    const [unsavedChanges, setUnsavedChanges] = useState(false);
    const [pendingGrades, setPendingGrades] = useState({});

    // 🔹 Sinflarni olish
    useEffect(() => {
        API.get("/class/my-classes")
            .then((res) => {
                setClasses(res.data.classes);
                setSelectedClass(res.data.classes[0]?._id);
            })
            .catch((err) => console.error(err));
    }, []);

    // 🔹 Fanlarni olish
    useEffect(() => {
        if (!selectedClass) return;

        API.get(`/subjects/class/${selectedClass}`)
            .then((res) => {
                setSubjects(res.data.subjects || []);
            })
            .catch((err) => console.error(err));
    }, [selectedClass]);

    // 🔹 Default subject
    useEffect(() => {
        API.get("/subjects/my-subjects")
            .then((res) => {
                if (res.data.subjects?.length > 0) {
                    setSelectedSubject(res.data.subjects[0]._id);
                }
            })
            .catch((err) => console.error(err));
    }, []);

    // 🔹 Baholarni olish
    useEffect(() => {
        if (!selectedClass || !selectedSubject) return;

        API.get(`/grades/class/${selectedClass}?subject=${selectedSubject}`)
            .then((res) => {
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
            })
            .catch((err) => console.error(err));
    }, [selectedClass, selectedSubject]);

    // 🔹 Sana qo‘shish
    const addDate = (newDate) => {
        if (!newDate) return;

        const formatted = new Date(newDate).toISOString().split("T")[0];
        if (!dates.includes(formatted)) {
            const updated = [...dates, formatted].sort();
            setDates(updated);
            setUnsavedChanges(true);
        }
    };

    // 🔹 Localda bahoni o‘zgartirish
    const handleGradeChange = (studentId, date, value) => {
        setGradesByDate((prev) => {
            const copy = { ...prev };
            if (!copy[date]) copy[date] = {};

            if (value === "") {
                delete copy[date][studentId];
            } else {
                copy[date][studentId] = value;
            }
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
            alert("Saqlab qo‘yildi ✅");
        } catch (error) {
            console.error(error);
            alert("Xatolik yuz berdi ❌");
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-xl font-bold mb-4">Dars jurnali</h1>

            {/* Sinf tanlash */}
            <div className="mb-4">
                <label className="font-semibold block mb-2">Sinf:</label>
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
            </div>

            {/* Fan tanlash */}
            {subjects.length > 1 && (
                <div className="mb-4">
                    <label className="font-semibold">Fan: </label>
                    <select
                        value={selectedSubject || ""}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        className="border p-2 rounded"
                    >
                        <option value="">Tanlang</option>
                        {subjects.map((subj) => (
                            <option key={subj._id} value={subj._id}>
                                {subj.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Sana qo‘shish */}
            <div className="mb-4">
                <label className="font-semibold">Sana qo‘shish: </label>
                <input
                    type="date"
                    onChange={(e) => addDate(e.target.value)}
                    className="border p-2 rounded"
                />
            </div>

            {/* Saqlash tugmasi */}
            {unsavedChanges && (
                <div className="mb-4">
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-blue-600 text-white rounded shadow"
                    >
                        Saqlash
                    </button>
                </div>
            )}

            {/* Jadval */}
            <div className="overflow-x-auto">
                <table className="w-full border border-gray-300">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border p-2">O‘quvchi</th>
                            {dates.map((d) => (
                                <th key={d} className="border p-2">
                                    {d}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {classes.find((el) => el._id === selectedClass)?.students.map((student) => (
                            <tr key={student._id}>
                                <td className="border p-2">
                                    {student.first_name} {student.last_name}
                                </td>
                                {dates.map((d) => (
                                    <td key={d} className="border p-2">
                                        <select
                                            value={gradesByDate[d]?.[student._id] || ""}
                                            onChange={(e) =>
                                                handleGradeChange(student._id, d, e.target.value)
                                            }
                                            className="border rounded p-1"
                                        >
                                            <option value="">-</option>
                                            <option value="5">5</option>
                                            <option value="4">4</option>
                                            <option value="3">3</option>
                                            <option value="2">2</option>
                                            <option value="0">0</option>
                                        </select>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Classes;
