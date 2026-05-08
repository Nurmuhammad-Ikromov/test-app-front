/** @format */

import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import {
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import { BiEdit, BiTrash } from "react-icons/bi";
import { FiMail, FiChevronDown } from "react-icons/fi";
import { HiOutlineArrowTrendingUp } from "react-icons/hi2";
import { BsCheckCircle, BsAward } from "react-icons/bs";
import { toast } from "react-toastify";
import StudentEditModal from "./StudentEditModal";
import API from "../../../utils/config";

const StudentList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteStudent, setDeleteStudent] = useState(null);

  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pagination dropdown uchun state va ref
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const token = localStorage.getItem("token");

  // URL-dan hamma parametrlarni o'qish
  const searchKey = searchParams.get("search") || "";
  const classFilter = searchParams.get("class") || "";
  const currentPage = parseInt(searchParams.get("page")) || 1;
  const rowsPerPage = 8;

  const totalPages = Math.ceil(total / rowsPerPage) || 1;

  // Sahifani o'zgartirish funksiyasi
  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Tashqariga bosilganda dropdownni yopish
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        limit: rowsPerPage,
        page: currentPage,
        class: classFilter,
        search: searchKey,
      };

      const { data } = await API.get(`/students/all`, {
        params: params,
        headers: { Authorization: `Bearer ${token}` },
      });

      setStudents(data.data);
      setTotal(data.total);
      setError(null);
    } catch (err) {
      setError("Ma'lumotlarni yuklashda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  }, [rowsPerPage, currentPage, classFilter, searchKey, token]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleEditSave = async (updatedStudent) => {
    try {
      await API.put(`/students/update/${updatedStudent._id}`, updatedStudent, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Talaba ma’lumotlari yangilandi");
      setEditOpen(false);
      fetchStudents();
    } catch {
      toast.error("Xatolik yuz berdi");
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await API.post(`/students/remove-student`, {
        studentId: deleteStudent._id,
      });
      toast.success("Talaba o‘chirildi");
      setDeleteStudent(null);
      fetchStudents();
    } catch {
      toast.error("Xatolik yuz berdi");
    }
  };

  return (
    <div className="w-full pb-40 overflow-visible flex flex-col">
      {loading ? (
        <div className="flex justify-center items-center py-40">
          <CircularProgress />
        </div>
      ) : error ? (
        <Alert severity="error" className="rounded-2xl">
          {error}
        </Alert>
      ) : (
        <div className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {students.length > 0 ? (
              students.map((student) => (
                <div
                  key={student._id}
                  className="bg-white p-7 rounded-[40px] shadow-sm hover:shadow-2xl transition-all duration-500 group relative border border-transparent hover:border-indigo-100 flex flex-col items-center text-center"
                >
                  <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <button
                      onClick={() => {
                        setSelectedStudent(student);
                        setEditOpen(true);
                      }}
                      className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                    >
                      <BiEdit size={18} />
                    </button>
                    <button
                      onClick={() => setDeleteStudent(student)}
                      className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                    >
                      <BiTrash size={18} />
                    </button>
                  </div>

                  <div className="w-20 h-20 bg-[#4318FF] text-white rounded-full flex items-center justify-center text-2xl font-bold mb-5 shadow-2xl shadow-indigo-100 group-hover:scale-110 transition-transform">
                    {student.first_name?.charAt(0)}
                    {student.last_name?.charAt(0)}
                  </div>

                  <h3 className="text-xl font-bold text-[#1B2559] mb-1 leading-tight">
                    {student.first_name} {student.last_name}
                  </h3>
                  <p className="text-[11px] font-bold text-[#A3AED0] mb-5 uppercase tracking-[0.2em]">
                    {student?.class?.name || "Guruhsiz"}
                  </p>

                  <div className="w-full mb-8 flex items-center justify-center gap-2 text-[14px] text-[#707EAE] font-medium">
                    <FiMail className="text-indigo-400 shrink-0" />
                    <span className="truncate">
                      {student.email || "misol@pdp.uz"}
                    </span>
                  </div>

                  <div className="flex justify-center gap-8 w-full pt-6 border-t border-gray-50 mt-auto">
                    <div className="flex flex-col items-center">
                      <div className="p-3 bg-blue-50 rounded-full mb-1 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
                        <HiOutlineArrowTrendingUp size={18} />
                      </div>
                      <span className="text-[14px] font-extrabold text-[#1B2559]">
                        {student.average_score || 0}
                      </span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="p-3 bg-green-50 rounded-full mb-1 text-green-500 group-hover:bg-green-500 group-hover:text-white transition-all duration-300">
                        <BsCheckCircle size={18} />
                      </div>
                      <span className="text-[14px] font-extrabold text-[#1B2559]">
                        {student.attendance || 0}%
                      </span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="p-3 bg-purple-50 rounded-full mb-1 text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-all duration-300">
                        <BsAward size={18} />
                      </div>
                      <span className="text-[14px] font-extrabold text-[#1B2559]">
                        {student.achievements || 0}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center text-[#A3AED0] font-bold italic">
                Hech qanday o'quvchi topilmadi.
              </div>
            )}
          </div>

          {/* 🏁 PAGINATION (DROPDOWN VA STRELKA BILAN) */}
          <div className="flex justify-center items-center mt-20 mb-10">
            <div className="flex items-center gap-6 bg-white px-8 py-3.5 rounded-full shadow-lg border border-gray-50 relative">
              <button
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
                className="text-[12px] font-black text-[#A3AED0] hover:text-[#4318FF] disabled:opacity-20 uppercase tracking-widest transition-all"
              >
                Oldingi
              </button>

              <div className="h-6 w-[1px] bg-gray-100"></div>

              <div
                className="flex items-center gap-3 relative"
                ref={dropdownRef}
              >
                <span className="bg-[#4318FF] text-white w-10 h-10 flex items-center justify-center rounded-full font-bold shadow-lg shadow-indigo-200 transform scale-110">
                  {currentPage}
                </span>
                <span className="text-[#A3AED0] font-bold text-sm mx-1">
                  dan
                </span>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-1 text-[#A3AED0] hover:text-[#4318FF] font-black text-lg transition-all"
                >
                  <span>{totalPages}</span>
                  <FiChevronDown
                    className={`transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isDropdownOpen && (
                  <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 bg-white border border-gray-100 shadow-2xl rounded-2xl p-2 min-w-[120px] max-h-60 overflow-y-auto z-50 animate-in fade-in zoom-in duration-200">
                    <div className="grid grid-cols-2 gap-1">
                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            handlePageChange(i + 1);
                            setIsDropdownOpen(false);
                          }}
                          className={`px-3 py-2 rounded-xl text-sm font-bold transition-all ${
                            currentPage === i + 1
                              ? "bg-[#4318FF] text-white"
                              : "text-[#707EAE] hover:bg-[#F4F7FE] hover:text-[#4318FF]"
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="h-6 w-[1px] bg-gray-100"></div>

              <button
                disabled={currentPage >= totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                className="text-[12px] font-black text-[#A3AED0] hover:text-[#4318FF] disabled:opacity-20 uppercase tracking-widest transition-all"
              >
                Keyingi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALS */}
      <StudentEditModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        student={selectedStudent}
        onSave={handleEditSave}
        showUsername={true}
      />
      <Dialog
        open={!!deleteStudent}
        onClose={() => setDeleteStudent(null)}
        PaperProps={{ style: { borderRadius: 30, padding: 10 } }}
      >
        <DialogTitle className="font-black text-[#1B2559]">
          O'chirishni tasdiqlaysizmi?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Rostdan ham{" "}
            <b>
              {deleteStudent?.first_name} {deleteStudent?.last_name}
            </b>
            ni o'chirmoqchimisiz?
          </DialogContentText>
        </DialogContent>
        <DialogActions className="p-6">
          <Button onClick={() => setDeleteStudent(null)}>Bekor qilish</Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            className="rounded-xl shadow-lg"
          >
            Ha, o'chirilsin
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default StudentList;
