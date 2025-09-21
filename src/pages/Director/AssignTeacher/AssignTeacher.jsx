import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Typography,
  Paper,
} from "@mui/material";
import { toast } from "react-toastify";
import API from "../../../utils/config";

const AssignTeacher = () => {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  // Classes va teachersni olish
  useEffect(() => {
    const fetchData = async () => {
      try {
        const classRes = await API.get("/class");
        setClasses(classRes.data);

        const teacherRes = await API.get("/teacher");
        setTeachers(teacherRes.data);
      } catch (err) {
        console.error(err);
        toast.error("Malumotlarni olishda xatolik yuz berdi");
      }
    };
    fetchData();
  }, []);

  // Subjectlarni olish, class va teacher tanlanganda
  useEffect(() => {
    if (selectedClass && selectedTeacher) {
      const fetchSubjects = async () => {
        try {
          const res = await API.get(
            `/subject/class/${selectedClass}?teacherId=${selectedTeacher}`
          );
          setSubjects(res.data.subjects);
        } catch (err) {
          console.error(err);
          toast.error("Fanlarni olishda xatolik yuz berdi");
        }
      };
      fetchSubjects();
    } else {
      setSubjects([]);
      setSelectedSubject("");
    }
  }, [selectedClass, selectedTeacher]);

  const handleSubmit = async () => {
    if (!selectedClass || !selectedTeacher || !selectedSubject) {
      toast.warn("Iltimos barcha maydonlarni to‘ldiring");
      return;
    }

    try {
      await API.post(`/class/${selectedClass}/assign-teacher`, {
        teacherId: selectedTeacher,
        subjectId: selectedSubject,
      });
      toast.success("O‘qituvchi sinfga muvaffaqiyatli biriktirildi");
      setSelectedClass("");
      setSelectedTeacher("");
      setSelectedSubject("");
    } catch (err) {
      console.error(err);
      toast.error("Biriktirishda xatolik yuz berdi");
    }
  };

  return (
    <div className="p-6 flex justify-center">
      <Paper className="p-6 w-full max-w-md shadow-lg rounded-xl">
        <Typography variant="h5" className="mb-6 font-bold">
          O‘qituvchi biriktirish
        </Typography>

        <FormControl fullWidth className="mb-4">
          <InputLabel id="class-label">Sinf</InputLabel>
          <Select
            labelId="class-label"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            {classes.map((cls) => (
              <MenuItem key={cls._id} value={cls._id}>
                {cls.name} ({cls.year})
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth className="mb-4">
          <InputLabel id="teacher-label">O‘qituvchi</InputLabel>
          <Select
            labelId="teacher-label"
            value={selectedTeacher}
            onChange={(e) => setSelectedTeacher(e.target.value)}
          >
            {teachers.map((t) => (
              <MenuItem key={t._id} value={t._id}>
                {t.first_name} {t.last_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth className="mb-6">
          <InputLabel id="subject-label">Fan</InputLabel>
          <Select
            labelId="subject-label"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            disabled={subjects.length === 0}
          >
            {subjects.map((s) => (
              <MenuItem key={s._id} value={s._id}>
                {s.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box className="flex justify-end">
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={!selectedClass || !selectedTeacher || !selectedSubject}
          >
            Biriktirish
          </Button>
        </Box>
      </Paper>
    </div>
  );
};

export default AssignTeacher;
