/** @format */

import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiBookOpen, FiMoreVertical, FiPlus, FiTrash2 } from "react-icons/fi";
// MUI komponentlarini import qilamiz
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from "@mui/material";

const TestListPage = () => {
  const navigate = useNavigate();
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  // Modal uchun holatlar (State)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedTestId, setSelectedTestId] = useState(null);

  const [tests, setTests] = useState([
    { id: 1, name: "Kamron uchun", status: "Enabled", date: "30.04.2026" },
    { id: 2, name: "React 1", status: "Enabled", date: "30.04.2026" },
    { id: 3, name: "11-C Uz English", status: "Enabled", date: "29.04.2026" },
    { id: 4, name: "11-B Ru English", status: "Enabled", date: "29.04.2026" },
    { id: 5, name: "10-D Uz English", status: "Enabled", date: "29.04.2026" },
    { id: 6, name: "10-A Ru English", status: "Enabled", date: "29.04.2026" },
  ]);

  // --- FUNKSIYALAR ---

  // 1. O'chirish modalini ochish
  const openDeleteModal = (id) => {
    setSelectedTestId(id);
    setDeleteModalOpen(true);
    setOpenMenuId(null);
  };

  // 2. Modal ichida tasdiqlanganda o'chirish
  const confirmDelete = () => {
    setTests(tests.filter((test) => test.id !== selectedTestId));
    setDeleteModalOpen(false);
    setSelectedTestId(null);
  };

  const handleCreateExam = (id) => {
    navigate(`/teacher/tests/${id}/start`);
    setOpenMenuId(null);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target))
        setOpenMenuId(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="p-8 bg-[#F8F9FB] min-h-screen font-sans text-[#1B2559]">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold">Testlar</h1>
          <p className="text-sm text-[#A3AED0] font-medium mt-1">
            Barcha testlar ro'yxati
          </p>
        </div>
        <Link
          to="/teacher/tests/create"
          className="bg-[#4318FF] text-white px-7 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-[#3311CC] transition-all flex items-center gap-2"
        >
          <span className="text-xl">+</span> Yangi test
        </Link>
      </div>

      <div className="w-full overflow-x-auto overflow-y-visible pb-24">
        <table className="w-full border-separate border-spacing-y-4">
          <thead>
            <tr className="text-[#A3AED0] text-[13px] font-bold uppercase tracking-widest">
              <th className="text-left pb-2 pl-6">#</th>
              <th className="text-left pb-2">Test Nomi</th>
              <th className="text-left pb-2">Status</th>
              <th className="text-left pb-2">Yaratilgan vaqti</th>
              <th className="text-center pb-2 pr-6">Amallar</th>
            </tr>
          </thead>
          <tbody ref={menuRef}>
            {tests.map((test, index) => (
              <tr
                key={test.id}
                className="bg-white hover:shadow-lg transition-all group"
              >
                <td className="py-5 pl-6 rounded-l-[24px] font-bold">
                  {index + 1}
                </td>
                <td className="py-5">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#4318FF] rounded-2xl text-white shadow-inner">
                      <FiBookOpen size={20} />
                    </div>
                    <span className="font-bold text-[15px]">{test.name}</span>
                  </div>
                </td>
                <td className="py-5">
                  <span className="px-4 py-1.5 bg-green-50 text-[#05CD99] rounded-xl text-[12px] font-bold border border-green-100">
                    ● {test.status}
                  </span>
                </td>
                <td className="py-5 font-bold tracking-tight">{test.date}</td>
                <td className="py-5 pr-6 rounded-r-[24px] text-center relative">
                  <button
                    onClick={() =>
                      setOpenMenuId(openMenuId === test.id ? null : test.id)
                    }
                    className="p-2 text-[#A3AED0] hover:bg-gray-100 rounded-full transition-all focus:outline-none"
                  >
                    <FiMoreVertical size={22} />
                  </button>
                  {openMenuId === test.id && (
                    <div className="absolute right-10 top-12 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 py-2 animate-in fade-in zoom-in duration-200">
                      <button
                        onClick={() => handleCreateExam(test.id)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold hover:bg-purple-50 hover:text-[#4318FF] transition-colors text-left"
                      >
                        <FiPlus className="text-[#4318FF] text-lg" /> Imtihon
                        yaratish
                      </button>
                      <div className="h-[1px] bg-gray-100 my-1 mx-2"></div>
                      <button
                        onClick={() => openDeleteModal(test.id)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 font-bold transition-colors text-left"
                      >
                        <FiTrash2 className="text-lg" /> O'chirish
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- MODAL (CONFIRM DIALOG) --- */}
      <Dialog
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        PaperProps={{
          style: {
            borderRadius: 24,
            padding: 10,
            width: "100%",
            maxWidth: 400,
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 800,
            color: "#1B2559",
            textAlign: "center",
            fontSize: "1.5rem",
          }}
        >
          O'chirishni tasdiqlang
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            sx={{ fontWeight: 600, textAlign: "center", color: "#707EAE" }}
          >
            Haqiqatdan ham ushbu testni o'chirib tashlamoqchimisiz? Bu amalni
            ortga qaytarib bo'lmaydi.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", gap: 2, pb: 3 }}>
          <Button
            onClick={() => setDeleteModalOpen(false)}
            sx={{
              color: "#A3AED0",
              fontWeight: 700,
              textTransform: "none",
              fontSize: "1rem",
            }}
          >
            Bekor qilish
          </Button>
          <Button
            onClick={confirmDelete}
            variant="contained"
            color="error"
            sx={{
              borderRadius: 4,
              fontWeight: 700,
              textTransform: "none",
              px: 4,
              py: 1,
              boxShadow: "0px 10px 20px rgba(238, 93, 107, 0.2)",
            }}
          >
            Ha, o'chirilsin
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default TestListPage;
