import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import API from "../../utils/config"; // axios instance
import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false); // faqat submitdan keyin error chiqsin
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);

    if (!username.trim() || !password.trim()) {
      toast.error("Iltimos, login va parolni kiriting!", {
        position: "top-right",
        autoClose: 2000,
      });
      return;
    }

    setLoading(true);

    try {
      const response = await API.post("/auth/login", {
        username: username.trim(),
        password: password.trim(),
      });

      if (response.data?.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("role", response.data.user.role);
        localStorage.setItem("userData", JSON.stringify(response.data));

        toast.success("Muvaffaqiyatli kirdingiz!", {
          position: "top-right",
          autoClose: 2000,
        });

        // Role bo‘yicha navigatsiya
        if (response.data.user.role === "student") {
          navigate("/student/grades");
        } else if (response.data.user.role === "teacher") {
          navigate("/teacher/classes");
        } else  {
          navigate("/director/teachers"); // default
        }
      } else {
        toast.error("Login yoki parol noto‘g‘ri!", {
          position: "top-right",
          autoClose: 2000,
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(
        error.response?.data?.message ||
          "Xatolik yuz berdi. Qayta urinib ko‘ring!",
        { position: "top-right", autoClose: 2000 }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Chap tomonda rasm */}
      <div className="hidden md:flex flex-1 items-center justify-center bg-[#1D2D5B]">
        <img
          src="/study.svg"
          alt="Illustration"
          className="max-w-[80%] h-auto"
        />
      </div>

      {/* O‘ng tomonda forma */}
      <div className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-sm p-8 rounded-2xl">
          <h2 className="flex items-center justify-center gap-1 text-2xl font-bold text-center text-[#0019FF] mb-6">
            <img width={35} src="/favicon.ico" alt="" />
            PDPedu
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <TextField
              fullWidth
              label="Login"
              variant="outlined"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              error={submitted && !username}
              helperText={submitted && !username ? "Loginni kiriting" : ""}
            />

            <TextField
              fullWidth
              label="Parol"
              type={showPassword ? "text" : "password"}
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={submitted && !password}
              helperText={submitted && !password ? "Parolni kiriting" : ""}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 2,
                backgroundColor: "#1D2D5B",
                "&:hover": { backgroundColor: "#1b263b" },
                borderRadius: "5px",
                textTransform: "none",
                fontSize: "15px",
              }}
              disabled={loading}
            >
              {loading ? "Yuklanmoqda..." : "Kirish"}
            </Button>
          </form>

          <p className="text-xs text-gray-500 text-center mt-6">
            © 2025 Sizning Universitetingiz. Barcha huquqlar himoyalangan.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
