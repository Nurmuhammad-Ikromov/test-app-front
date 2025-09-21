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
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { toast } from "react-toastify";
import API from "../../../utils/config";

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const [newName, setNewName] = useState("");
  const [newClass, setNewClass] = useState("");
  const [newTeacher, setNewTeacher] = useState("");

  // 🔹 Ma’lumotlarni olish
  const fetchData = async () => {
    try {
      const [classesRes, teachersRes, subjectsRes] = await Promise.all([
        API.get("/class"),
        API.get("/teacher"),
        API.get("/subjects"),
      ]);

      setClasses(classesRes.data || []);
      setTeachers(teachersRes.data || []);
      setSubjects(subjectsRes.data.subjects || []);
    } catch (err) {
      console.error(err);
      toast.error("Ma’lumotlarni olishda xatolik yuz berdi");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 🔹 Yangi fan qo‘shish
  const handleAddSubject = async () => {
    if (!newName || !newClass || !newTeacher) {
      toast.warn("Iltimos barcha maydonlarni to‘ldiring");
      return;
    }

    try {
      await API.post("/subjects", {
        name: newName,
        classId: newClass,
        teacherId: newTeacher,
      });

      toast.success("Fan muvaffaqiyatli qo‘shildi");

      // reset
      setNewName("");
      setNewClass("");
      setNewTeacher("");

      // jadvalni yangilash
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error("Fan qo‘shishda xatolik yuz berdi");
    }
  };

  return (
    <div className="p-6 flex flex-col items-center">
      <Paper className="p-6 w-full max-w-3xl shadow-lg rounded-xl mb-6">
        <Typography variant="h5" className="mb-6 font-bold">
          Yangi fan qo‘shish
        </Typography>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <TextField
            label="Fan nomi"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <FormControl fullWidth>
            <InputLabel id="class-label">Sinf</InputLabel>
            <Select
              labelId="class-label"
              value={newClass}
              onChange={(e) => setNewClass(e.target.value)}
            >
              {classes.map((cls) => (
                <MenuItem key={cls._id} value={cls._id}>
                  {cls.name} ({cls.year})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="teacher-label">O‘qituvchi</InputLabel>
            <Select
              labelId="teacher-label"
              value={newTeacher}
              onChange={(e) => setNewTeacher(e.target.value)}
            >
              {teachers.map((t) => (
                <MenuItem key={t._id} value={t._id}>
                  {t.first_name} {t.last_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        <Box className="flex justify-end">
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddSubject}
          >
            Qo‘shish
          </Button>
        </Box>
      </Paper>

      <Paper className="p-6 w-full max-w-3xl shadow-lg rounded-xl">
        <Typography variant="h5" className="mb-4 font-bold">
          Mavjud fanlar
        </Typography>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Fan nomi</TableCell>
                <TableCell>Sinf</TableCell>
                <TableCell>O‘qituvchi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {subjects.map((subj) => (
                <TableRow key={subj._id}>
                  <TableCell>{subj.name}</TableCell>
                  <TableCell>
                    {subj.class?.name || "—"} ({subj.class?.year || "—"})
                  </TableCell>
                  <TableCell>
                    {subj.teacher?.first_name} {subj.teacher?.last_name}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </div>
  );
};

export default Subjects;
