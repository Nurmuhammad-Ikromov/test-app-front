import { useEffect, useState, useCallback } from "react";
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  TablePagination,
  IconButton,
  Select,
  MenuItem,
  Box,
  FormControl,
  InputLabel,
} from "@mui/material";
import { BiEdit } from "react-icons/bi";
import StudentEditModal from "./StudentEditModal";
import API from "../../../utils/config";

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editOpen, setEditOpen] = useState(false);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: rowsPerPage.toString(),
        page: (page + 1).toString(),
        class: selectedClass,
      });

      const { data } = await API.get(`/students/all?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setStudents(data.data);
      setTotal(data.total);
      setError(null);
    } catch {
      setError("Talabalarni yuklashda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  }, [rowsPerPage, page, selectedClass, token]);

  const fetchClasses = useCallback(async () => {
    try {
      const { data } = await API.get("/class", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClasses(data);
    } catch {
      console.error("Sinf maʼlumotlarini olishda xatolik yuz berdi");
    }
  }, [token]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const handleChangePage = (_, newPage) => setPage(newPage);

  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const handleEditClick = (student) => {
    setSelectedStudent(student);
    setEditOpen(true);
  };

  const handleEditSave = async (updatedStudent) => {
    try {
      await API.put(`/students/update/${updatedStudent._id}`, updatedStudent, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Talaba ma’lumotlari yangilandi");
      setEditOpen(false);
      fetchStudents();
    } catch {
      alert("Xatolik yuz berdi");
    }
  };

  return (
    <>
      <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5">Talabalar ro‘yxati</Typography>

          <FormControl sx={{ minWidth: 240 }}>
            <InputLabel id="class-select-label">Sinfni tanlang</InputLabel>
            <Select
              labelId="class-select-label"
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setPage(0);
              }}
              label="Sinfni tanlang"
            >
              {classes.map((cls) => (
                <MenuItem key={cls._id} value={cls._id}>
                  {cls.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {loading ? (
          <Box mt={4} display="flex" justifyContent="center">
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mt: 3 }}>
            {error}
          </Alert>
        ) : (
          <Box mt={2} position="relative">
            <List sx={{ maxHeight: "50vh", overflow: "auto" }}>
              {students.map((student, index) => (
                <ListItem key={student._id} divider>
                  <ListItemText
                    primaryTypographyProps={{ fontWeight: "bold" }}
                    primary={`${page * rowsPerPage + index + 1}. ${student.first_name} ${student.last_name}`}
                    secondary={student?.class?.name}
                  />
                  <IconButton
                    edge="end"
                    color="primary"
                    onClick={() => handleEditClick(student)}
                  >
                    <BiEdit />
                  </IconButton>
                </ListItem>
              ))}
            </List>

            <TablePagination
              component="div"
              count={total}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          </Box>
        )}
      </Paper>

      <StudentEditModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        student={selectedStudent}
        onSave={handleEditSave}
      />
    </>
  );
};

export default StudentList;
