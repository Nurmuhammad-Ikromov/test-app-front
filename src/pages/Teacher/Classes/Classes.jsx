import React, { useEffect, useState } from "react";
import API from "../../../utils/config";

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
            <div className="flex  items-center gap-4 mb-4">
                <label className="font-semibold block mb-2">Sinf:</label>
                <div className="flex flex-wrap gap-2">
                    {classes.map((cls) => (
                        <button
                            key={cls._id}
                            onClick={() => setSelectedClass(cls._id)}
                            className={`px-4 py-2 rounded border ${selectedClass === cls._id
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
            <div className="flex justify-between mb-4">
                <div>
                    <label className="font-semibold">Sana qo‘shish: </label>
                    <input
                        type="date"
                        onChange={(e) => addDate(e.target.value)}
                        className="border p-2 rounded"
                    />
                </div>

                {/* Saqlash tugmasi */}
                {unsavedChanges && (
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-blue-600 text-white rounded shadow"
                    >
                        Saqlash
                    </button>
                )}
            </div>



            {/* Jadval */}
            <div className="overflow-auto max-h-[600px] border border-gray-300 rounded">
                <table className="w-full border-collapse table-auto">
                    <thead className="bg-gray-100 sticky top-0 z-20">
                        <tr>
                            <th className="border p-2 sticky left-0 bg-gray-100 z-30">O‘quvchi</th>
                            {dates.map((d) => (
                                <th key={d} className="border p-2">{d}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {classes.find((el) => el._id === selectedClass)?.students.map((student) => (
                            <tr key={student._id}>
                                <td className="border p-2 sticky left-0 bg-gray-100 z-10">
                                    {student.first_name} {student.last_name}
                                </td>
                                {dates.map((d) => {
                                    const grade = gradesByDate[d]?.[student._id]?.toString()

                                    let bgColor = "bg-white text-black";
                                    if (grade !== undefined && grade !== "") {
                                        switch (grade) {
                                            case "5": bgColor = "bg-green-500 text-black"; break;
                                            case "4": bgColor = "bg-orange-400 text-black"; break;
                                            case "3": bgColor = "bg-yellow-300 text-black"; break;
                                            case "2": bgColor = "bg-red-300 text-black"; break;
                                            case "1": bgColor = "bg-red-400 text-black"; break;
                                            case "0": bgColor = "bg-red-500 text-black"; break;
                                        }
                                    }
                                    return gradesByDate && <td key={d} className={`border p-2  `}>
                                        <div className={`${bgColor}`}>
                                            <select
                                                value={grade ?? ""}
                                                onChange={(e) => handleGradeChange(student._id, d, e.target.value)}
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
                                        </div>
                                    </td>
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>


        </div>
    );
};

export default Classes;
