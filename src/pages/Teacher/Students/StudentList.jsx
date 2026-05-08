/** @format */

import { useEffect, useState, useCallback } from "react";
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
import { FiMail, FiPhone } from "react-icons/fi";
import { HiOutlineArrowTrendingUp } from "react-icons/hi2";
import { BsCheckCircle, BsAward } from "react-icons/bs";
import { toast } from "react-toastify";
import StudentEditModal from "./StudentEditModal";
import API from "../../../utils/config";

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteStudent, setDeleteStudent] = useState(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(8);
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
      toast.error("Sinf maʼlumotlarini olishda xatolik yuz berdi");
    }
  }, [token]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);
  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

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
    /* MUHIM: min-h-screen va pb-40 sahifani bemalol scroll bo'lishiga yo'l ochadi */
    <div className="w-full min-h-screen pb-40 overflow-y-visible flex flex-col">
      {/* 1. FILTER HEADER */}
      <div className="bg-white p-6 rounded-[24px] shadow-sm mb-10 flex justify-between items-center border border-gray-50 shrink-0">
        <h2 className="text-xl font-extrabold text-[#1B2559]">
          Talabalar ro‘yxati
        </h2>
        <select
          value={selectedClass}
          onChange={(e) => {
            setSelectedClass(e.target.value);
            setPage(0);
          }}
          className="bg-[#F4F7FE] border-none text-[#707EAE] px-5 py-2.5 rounded-2xl text-sm font-bold outline-none cursor-pointer"
        >
          <option value="">Sinfni tanlang</option>
          {classes.map((cls) => (
            <option key={cls._id} value={cls._id}>
              {cls.name}
            </option>
          ))}
        </select>
      </div>

      {/* 2. MAIN CONTENT AREA */}
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
          {/* CARDS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {students.map((student) => (
              <div
                key={student._id}
                className="bg-white p-7 rounded-[40px] shadow-sm hover:shadow-2xl transition-all duration-500 group relative border border-transparent hover:border-indigo-100 flex flex-col items-center text-center"
              >
                {/* ACTION BUTTONS */}
                <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <button
                    onClick={() => {
                      setSelectedStudent(student);
                      setEditOpen(true);
                    }}
                    className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all"
                  >
                    <BiEdit size={20} />
                  </button>
                  <button
                    onClick={() => setDeleteStudent(student)}
                    className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all"
                  >
                    <BiTrash size={20} />
                  </button>
                </div>

                <div className="w-20 h-20 bg-[#4318FF] text-white rounded-full flex items-center justify-center text-2xl font-bold mb-5 shadow-2xl shadow-indigo-100 group-hover:scale-110 transition-transform">
                  {student.first_name?.charAt(0)}
                  {student.last_name?.charAt(0)}
                </div>

                <h3 className="text-xl font-bold text-[#1B2559] mb-1">
                  {student.first_name} {student.last_name}
                </h3>
                <p className="text-[11px] font-bold text-[#A3AED0] mb-6 uppercase tracking-[0.2em]">
                  {student?.class?.name || "Guruhsiz"}
                </p>

                <div className="w-full space-y-3 mb-10">
                  <div className="flex items-center justify-center gap-3 text-[14px] text-[#707EAE] font-medium">
                    <FiMail className="text-indigo-400 shrink-0" />
                    <span className="truncate">
                      {student.email || "example@pdp.uz"}
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-3 text-[14px] text-[#707EAE] font-medium">
                    <FiPhone className="text-indigo-400 shrink-0" />
                    <span>{student.phone || "+998 90 000 00 00"}</span>
                  </div>
                </div>

                <div className="flex justify-between w-full pt-6 border-t border-gray-50 mt-auto">
                  <div className="flex flex-col items-center">
                    <div className="p-3 bg-blue-50 rounded-full mb-2 text-blue-500">
                      <HiOutlineArrowTrendingUp size={18} />
                    </div>
                    <span className="text-[14px] font-extrabold text-[#1B2559]">
                      {student.average_score || 0}
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="p-3 bg-green-50 rounded-full mb-2 text-green-500">
                      <BsCheckCircle size={18} />
                    </div>
                    <span className="text-[14px] font-extrabold text-[#1B2559]">
                      {student.attendance || 0}%
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="p-3 bg-purple-50 rounded-full mb-2 text-purple-500">
                      <BsAward size={18} />
                    </div>
                    <span className="text-[14px] font-extrabold text-[#1B2559]">
                      {student.achievements || 0}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 3. PAGINATION (Kartalardan keyin bemalol joylashadi) */}
          <div className="flex justify-center items-center mt-20">
            <div className="flex items-center gap-8 bg-white px-10 py-4 rounded-full shadow-xl border border-gray-50">
              <button
                disabled={page === 0}
                onClick={() => {
                  setPage((p) => p - 1);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="text-[12px] font-black text-[#A3AED0] hover:text-[#4318FF] disabled:opacity-20 transition-all uppercase tracking-widest"
              >
                Oldingi
              </button>

              <div className="flex items-center gap-4">
                <span className="bg-[#4318FF] text-white w-12 h-12 flex items-center justify-center rounded-full font-black shadow-lg shadow-indigo-200 transform scale-110">
                  {page + 1}
                </span>
                <span className="text-[#A3AED0] font-bold text-sm">
                  / {Math.ceil(total / rowsPerPage) || 1}
                </span>
              </div>

              <button
                disabled={(page + 1) * rowsPerPage >= total}
                onClick={() => {
                  setPage((p) => p + 1);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="text-[12px] font-black text-[#A3AED0] hover:text-[#4318FF] disabled:opacity-20 transition-all uppercase tracking-widest"
              >
                Keyingi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALLAR */}
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
        <DialogTitle className="font-black text-[#1B2559] text-xl">
          O'chirishni tasdiqlaysizmi?
        </DialogTitle>
        <DialogContent>
          <DialogContentText className="text-[#707EAE] font-medium">
            Haqiqatdan ham{" "}
            <b>
              {deleteStudent?.first_name} {deleteStudent?.last_name}
            </b>
            ni o'chirib tashlamoqchimisiz?
          </DialogContentText>
        </DialogContent>
        <DialogActions className="p-6">
          <Button
            onClick={() => setDeleteStudent(null)}
            className="text-[#A3AED0] font-bold px-6"
          >
            Bekor qilish
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            className="rounded-2xl font-bold px-8 py-2.5 shadow-lg shadow-red-100"
          >
            O'chirilsin
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default StudentList;
