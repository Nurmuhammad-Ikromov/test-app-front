/** @format */

import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import { toast } from "react-toastify";
import API from "../../utils/config";
import {
  MdVisibility,
  MdVisibilityOff,
  MdLockOutline,
  MdPersonOutline,
} from "react-icons/md";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (!username.trim() || !password.trim()) {
      toast.error("Iltimos, login va parolni kiriting!");
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
        toast.success("Muvaffaqiyatli kirdingiz!");
        if (response.data.user.role === "student") navigate("/student/grades");
        else if (response.data.user.role === "teacher")
          navigate("/teacher/classes");
        else navigate("/director/teachers");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#f3f4f9] overflow-hidden">
      {/* 1. Asosiy Vizual Blok (Chap taraf) */}
      <div className="hidden lg:flex flex-[1.2] relative bg-[#1D2D5B] items-center justify-center p-12">
        {/* Orqa fondagi katta dekorativ harf yoki element */}
        <div className="absolute -top-20 -left-20 text-[40rem] font-black text-white/5 select-none">
          P
        </div>

        <div className="relative z-10 w-full max-w-lg">
          <div className="mb-12">
            <span className="bg-[#5c4ae3] text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest">
              Education System
            </span>
            <h1 className="text-5xl font-black text-white mt-6 leading-tight">
              Ta'lim sifatini <br />{" "}
              <span className="text-[#5c4ae3]">raqamli</span> boshqaring.
            </h1>
            <p className="text-white/50 mt-4 text-lg">
              PDP Edu — o'qituvchi va o'quvchilar uchun yagona ekotizim.
            </p>
          </div>

          <img
            src="/study.svg"
            alt="Illustration"
            className="w-full h-auto drop-shadow-[0_35px_35px_rgba(0,0,0,0.4)] animate-float"
          />
        </div>

        {/* Formani "kesib o'tuvchi" burchak */}
        <div className="absolute top-0 right-0 h-full w-32 bg-gradient-to-l from-[#f3f4f9] to-transparent z-20"></div>
      </div>

      {/* 2. Login Blok (O'ng taraf) */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        <div className="w-full max-w-md">
          {/* Mobil uchun Logo (faqat kichik ekranlarda ko'rinadi) */}
          <div className="lg:hidden flex justify-center mb-8">
            <img width={60} src="/favicon.ico" alt="logo" />
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-4xl font-extrabold text-[#1D2D5B] mb-3">
              Tizimga kirish
            </h2>
            <p className="text-gray-500 font-medium">
              Davom etish uchun ma'lumotlaringizni kiriting
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <TextField
                fullWidth
                label="Foydalanuvchi nomi"
                variant="filled"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                error={submitted && !username}
                helperText={submitted && !username ? "Loginni kiriting" : ""}
                InputProps={{
                  disableUnderline: true,
                  startAdornment: (
                    <MdPersonOutline className="mr-2 text-xl text-gray-400" />
                  ),
                }}
                sx={{
                  "& .MuiFilledInput-root": {
                    borderRadius: "20px",
                    backgroundColor: "#fff",
                    border: "1px solid #e2e8f0",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      backgroundColor: "#fff",
                      borderColor: "#5c4ae3",
                    },
                    "&.Mui-focused": {
                      backgroundColor: "#fff",
                      borderColor: "#5c4ae3",
                      boxShadow: "0 0 0 4px rgba(92, 74, 227, 0.1)",
                    },
                  },
                }}
              />
            </div>

            <div className="relative">
              <TextField
                fullWidth
                label="Parol"
                type={showPassword ? "text" : "password"}
                variant="filled"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={submitted && !password}
                helperText={submitted && !password ? "Parolni kiriting" : ""}
                InputProps={{
                  disableUnderline: true,
                  startAdornment: (
                    <MdLockOutline className="mr-2 text-xl text-gray-400" />
                  ),
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
                sx={{
                  "& .MuiFilledInput-root": {
                    borderRadius: "20px",
                    backgroundColor: "#fff",
                    border: "1px solid #e2e8f0",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      backgroundColor: "#fff",
                      borderColor: "#5c4ae3",
                    },
                    "&.Mui-focused": {
                      backgroundColor: "#fff",
                      borderColor: "#5c4ae3",
                      boxShadow: "0 0 0 4px rgba(92, 74, 227, 0.1)",
                    },
                  },
                }}
              />
            </div>

            <div className="flex items-center justify-end text-sm">
              <a href="#" className="text-[#5c4ae3] font-bold hover:underline">
                Parolni unutdingizmi?
              </a>
            </div>

            <Button
              type="submit"
              fullWidth
              disabled={loading}
              sx={{
                py: 2.5,
                backgroundColor: "#1D2D5B",
                color: "#fff",
                fontWeight: "900",
                borderRadius: "20px",
                textTransform: "none",
                fontSize: "17px",
                letterSpacing: "0.5px",
                transition: "all 0.4s ease",
                "&:hover": {
                  backgroundColor: "#5c4ae3",
                  transform: "translateY(-2px)",
                  boxShadow: "0 10px 20px rgba(92, 74, 227, 0.3)",
                },
              }}
            >
              {loading ? "Tekshirilmoqda..." : "Kirish"}
            </Button>
          </form>

          <div className="mt-12 text-center">
            <p className="text-gray-400 text-xs font-medium uppercase tracking-[2px]">
              © 2025 PDP SCHOOL ECOSYSTEM
            </p>
          </div>
        </div>
      </div>

      {/* Global CSS for floating animation */}
      <style tabIndex="text/css">{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
