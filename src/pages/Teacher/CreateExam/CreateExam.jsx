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
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import API from "../../../utils/config";
import { useParams } from "react-router-dom";
import dayjs from "dayjs";

const CreateExam = () => {
    const { testId } = useParams();
    const [classes, setClasses] = useState([]); // Sinflar ro'yxati
    const [formData, setFormData] = useState({
        testId: testId,
        title: "",
        classId: "",
        startDate: null,
        endDate: null
    });

    const token = localStorage.getItem("token");

    // Sinflar ro'yxatini olish uchun API so'rovi
    useEffect(() => {
        API.get("/class")
            .then((res) => setClasses(res.data))
            .catch((err) => console.log(err));
    }, [token]);

    // Formani boshqarish uchun handleChange funksiyasi
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    // Formani yuborish uchun handleSubmit funksiyasi
    const handleSubmit = (e) => {
        e.preventDefault();

        API.post(
            "/exams",
            {
                testId,
                title: formData?.title,
                classId: formData.classId,
                startTime: formData.startDate ? dayjs(formData.startDate).valueOf() : null,
                endTime: formData.endDate ? dayjs(formData.endDate).valueOf() : null,
            }
        )
            .then((res) => {
                alert("Exam successfully created!");
                setFormData({ title: "", classId: "", startDate: null, endDate: null });
            })
            .catch((err) => {
                console.error(err);
                alert("Failed to create exam!");
            });
    };

    const handleDateChange = (name) => (newValue) => {
        setFormData((prevState) => ({
            ...prevState,
            [name]: newValue ? dayjs(newValue) : null,
        }));
    };

    return (
        <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                maxWidth: 400,
                margin: "auto",
                mt: 5,
            }}
        >
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Typography variant="h5" textAlign="center">
                    Create New Exam
                </Typography>

                <TextField
                    label="Exam Title"
                    name="title"
                    value={formData?.title}
                    onChange={handleChange}
                    fullWidth
                    required
                />

                <FormControl fullWidth required>
                    <InputLabel id="class-select-label">Select Class</InputLabel>
                    <Select
                        labelId="class-select-label"
                        name="classId"
                        value={formData.classId}
                        onChange={handleChange}
                        label="Select Class"
                    >
                        {classes?.map((cls) => (
                            <MenuItem key={cls._id} value={cls._id}>
                                {cls.name} {/* Sinf nomini aks ettirish */}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                

                <FormControl fullWidth required>
                    <DatePicker
                        label={"Boshlash vaqtini tanlang"}
                        value={formData.startDate}
                        onChange={handleDateChange("startDate")}
                    />
                </FormControl>

                <FormControl fullWidth required>
                    <DatePicker
                        label={"Tugash vaqtini tanlang"}
                        value={formData.endDate}
                        onChange={handleDateChange("endDate")}
                    />
                </FormControl>

                <Button type="submit" variant="contained" color="primary" fullWidth>
                    Create Exam
                </Button>
            </LocalizationProvider>
        </Box>
    );
};

export default CreateExam;
