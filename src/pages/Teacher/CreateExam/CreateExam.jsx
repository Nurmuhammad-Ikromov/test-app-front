/** @format */

import React, { useEffect, useState } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import {
  Box,
  Button,
  MenuItem,
  Select,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Paper,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import API from "../../../utils/config";
import { useParams, useNavigate } from "react-router-dom";
import dayjs from "dayjs";

const CreateExam = () => {
  const { testId } = useParams(); // URL dan testId ni oladi
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    classId: "",
    startDate: dayjs(), // Bugungi sana default
    endDate: dayjs().add(1, "day"), // Ertangi sana default
  });

  const token = localStorage.getItem("token");

  // Sinflar ro'yxatini olish
  useEffect(() => {
    API.get("/class")
      .then((res) => setClasses(res.data))
      .catch((err) => console.log("Sinflarni yuklashda xato:", err));
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // SERVER KUTAYOTGAN FORMAT
    const payload = {
      testId: testId, // URL dagi haqiqiy ID
      title: formData.title,
      classId: formData.classId,
      startTime: formData.startDate ? formData.startDate.valueOf() : null,
      endTime: formData.endDate ? formData.endDate.valueOf() : null,
    };

    // Imtihon yaratish so'rovi
    API.post("/exams", payload)
      .then((res) => {
        alert("Imtihon muvaffaqiyatli yaratildi!");
        navigate("/teacher/tests"); // Orqaga qaytish
      })
      .catch((err) => {
        console.error("Xato tafsiloti:", err.response?.data);
        const errorMsg =
          err.response?.data?.message || "Imtihon yaratib bo'lmadi!";
        alert(`Xatolik: ${errorMsg}`);
      });
  };

  return (
    <Box
      sx={{
        p: 4,
        display: "flex",
        justifyContent: "center",
        bgcolor: "#F8F9FB",
        minHeight: "90vh",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 5,
          borderRadius: 8,
          maxWidth: 500,
          width: "100%",
          bgcolor: "white",
          boxShadow: "0px 20px 40px rgba(0,0,0,0.05)",
          border: "1px solid #eee",
        }}
      >
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              mb: 4,
              color: "#1B2559",
              textAlign: "center",
            }}
          >
            Yangi imtihon yaratish
          </Typography>

          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "25px" }}
          >
            <TextField
              label="Imtihon nomi"
              name="title"
              value={formData.title}
              onChange={handleChange}
              fullWidth
              required
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 4 } }}
            />

            <FormControl fullWidth required>
              <InputLabel>Sinfni tanlang</InputLabel>
              <Select
                name="classId"
                value={formData.classId}
                onChange={handleChange}
                label="Sinfni tanlang"
                sx={{ borderRadius: 4 }}
              >
                {classes?.map((cls) => (
                  <MenuItem key={cls._id} value={cls._id}>
                    {cls.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <DatePicker
              label="Boshlanish vaqti"
              value={formData.startDate}
              onChange={(newValue) =>
                setFormData({ ...formData, startDate: newValue })
              }
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true,
                  sx: { "& .MuiOutlinedInput-root": { borderRadius: 4 } },
                },
              }}
            />

            <DatePicker
              label="Tugash vaqti"
              value={formData.endDate}
              onChange={(newValue) =>
                setFormData({ ...formData, endDate: newValue })
              }
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true,
                  sx: { "& .MuiOutlinedInput-root": { borderRadius: 4 } },
                },
              }}
            />

            <Button
              type="submit"
              variant="contained"
              sx={{
                bgcolor: "#4318FF",
                py: 2,
                borderRadius: 4,
                fontWeight: 800,
                textTransform: "none",
                fontSize: "16px",
                "&:hover": { bgcolor: "#3311CC" },
                mt: 2,
              }}
            >
              Imtihonni tasdiqlash
            </Button>
          </form>
        </LocalizationProvider>
      </Paper>
    </Box>
  );
};

export default CreateExam;
