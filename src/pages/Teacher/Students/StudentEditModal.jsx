import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
} from "@mui/material";
import { useState, useEffect } from "react";
import API from "../../../utils/config";

const StudentEditModal = ({ open, onClose, student, onSave }) => {
  const [classes, setClasses] = useState([]);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    classId: "",
    password: "",
  });

  useEffect(() => {
    if (student) {
      setFormData({
        first_name: student?.first_name || "",
        last_name: student?.last_name || "",
        classId: student?.class?._id || "",
        password: "",
      });
    }

    API.get("/class")
      .then((res) => setClasses(res.data))
      .catch((err) => console.log(err));
  }, [student]);
  useEffect(() => {
    setFormData({
      first_name: "",
      last_name: "",
      classId: "",
      password: "",
    });
  }, []);
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    onSave({ ...formData, _id: student._id });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Talaba ma’lumotlarini tahrirlash</DialogTitle>
      <DialogContent>
        <TextField
          margin="dense"
          label="Ism"
          fullWidth
          name="first_name"
          value={formData.first_name}
          onChange={handleChange}
        />
        <TextField
          margin="dense"
          label="Familiya"
          fullWidth
          name="last_name"
          value={formData.last_name}
          onChange={handleChange}
        />
        {/* <TextField
          margin="dense"
          label="Sinf ID"
          fullWidth
          name="class"
          value={formData.class}
          onChange={handleChange}
        /> */}
        <Select
          labelId="class-select-label"
          name="classId"
          className="w-full"
          value={formData.classId}
          onChange={handleChange}
          label="Sinfni tanlang"
        >
          {classes?.map((cls) => (
            <MenuItem key={cls._id} value={cls._id}>
              {cls.name}
            </MenuItem>
          ))}
        </Select>
        <TextField
          margin="dense"
          label="Password"
          fullWidth
          name="password"
          value={formData.password}
          onChange={handleChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Bekor qilish
        </Button>
        <Button onClick={handleSubmit} variant="contained">
          Saqlash
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StudentEditModal;
