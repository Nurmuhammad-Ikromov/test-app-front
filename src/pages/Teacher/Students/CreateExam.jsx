import { useEffect, useState } from "react";
import {
  Box,
  Button,
  MenuItem,
  Select,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  IconButton,
} from "@mui/material";
import API from "../../../utils/config";
import { BsEyeFill, BsEyeSlash } from "react-icons/bs";

const AddStudent = () => {
  const [show, setShow] = useState(false);
  const [classes, setClasses] = useState([]);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    password: "",
    role: "student",
    classId: "",
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    API.get("/class")
      .then((res) => setClasses(res.data))
      .catch((err) => console.log(err));
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    API.post("/auth/add", formData)
      .then((res) => {
        alert("Student successfully created!");
        setFormData({
          first_name: "",
          last_name: "",
          username: "",
          password: "",
          role: "student",
          classId: "",
        });
      })
      .catch((err) => {
        console.error(err);
        alert("Failed to create student!");
      });
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        maxWidth: 900,
        margin: "auto",
        mt: 5,
      }}
      className="w-full"
    >
      <Typography variant="h5" textAlign="center">
        Add New Student
      </Typography>

      <TextField
        label="First Name"
        name="first_name"
        value={formData.first_name}
        onChange={handleChange}
        fullWidth
        required
      />

      <TextField
        label="Last Name"
        name="last_name"
        value={formData.last_name}
        onChange={handleChange}
        fullWidth
        required
      />

      <TextField
        label="Username"
        name="username"
        value={formData.username}
        onChange={handleChange}
        fullWidth
        required
      />
      <div className="relative">
        <TextField
          label="Password"
          name="password"
          type={show ? "text" : "password"}
          value={formData.password}
          onChange={handleChange}
          fullWidth
          required
        />
        <IconButton
          size="sm"
          color="primary"
          className="!absolute z-3 top-2 right-0  border"
          type="button"
          onClick={() => setShow((prev) => !prev)}
        >
          {show ? <BsEyeSlash /> : <BsEyeFill />}
        </IconButton>
      </div>

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
              {cls.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button type="submit" variant="contained" color="primary" fullWidth>
        Create Student
      </Button>
    </Box>
  );
};

export default AddStudent;
