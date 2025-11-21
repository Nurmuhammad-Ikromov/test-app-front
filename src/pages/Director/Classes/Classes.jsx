import React, { useEffect, useState } from "react";
import API from "../../../utils/config";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";

const AllClasses = () => {
  const [classes, setClasses] = useState([]);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [year, setYear] = useState("");

  // Classlarni olish
  const fetchClasses = async () => {
    try {
      const res = await API.get("/class");
      setClasses(res.data || []);
    } catch (err) {
      console.error("Error fetching classes:", err);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  // Class qo‘shish
  const handleAddClass = async () => {
    try {
      await API.post("/class", {
        name,
        year: Number(year),
        students: [],
      });
      setOpen(false);
      setName("");
      setYear("");
      fetchClasses();
    } catch (err) {
      console.error("Error adding class:", err);
    }
  };

  // Class o'chirish
  const handleDeleteClass = async (classId) => {
    const ok = window.confirm("Sinfni o'chirishni xohlaysizmi? Bu qaytarib bo'lmaydi.");
    if (!ok) return;
    try {
      await API.delete(`/class/${classId}`);
      setClasses((prev) => prev.filter((c) => c._id !== classId));
      toast.success("Sinf o'chirildi ✅");
    } catch (err) {
      console.error("Error deleting class:", err);
      toast.error("Sinfni o'chirishda xatolik ❌");
    }
  };

  const goToClassDetail = (classId) => {
    // navigate to director class detail page
    navigate(`/director/classes/${classId}`);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Classes</h1>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setOpen(true)}
        >
          Add Class
        </Button>
      </div>

      {/* Classes Grid (cards) */}
      {classes.length === 0 ? (
        <p className="text-gray-500">No classes yet.</p>
      ) : (
        <div className="max-h-[60vh] sm:max-h-[70vh] overflow-auto pr-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map((cls) => (
              <div
                key={cls._id}
                className="relative group bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-border border border-transparent hover:border-gray-200"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{cls.name}</h3>
                    <div className="text-sm text-gray-500">Yil: {cls.year}</div>
                    <div className="mt-2 text-sm text-gray-600">Talabalar: {cls.students?.length || 0}</div>
                  </div>
                  <div className="ml-4 text-sm text-gray-400">ID: {cls._id.slice(-6)}</div>
                </div>

                {/* Hover actions */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity flex gap-2">
                  <button
                    onClick={() => goToClassDetail(cls._id)}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    aria-label={`Info ${cls.name}`}
                  >
                    Info
                  </button>
                  <button
                    onClick={() => handleDeleteClass(cls._id)}
                    className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300"
                    aria-label={`Delete ${cls.name}`}
                  >
                    Delete
                  </button>
                </div>

                {/* Card foot */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-xs text-gray-500">Created: {cls.createdAt ? new Date(cls.createdAt).toLocaleDateString() : "—"}</div>
                  <div>
                    <button
                      onClick={() => goToClassDetail(cls._id)}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      View details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Class Modal */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Add New Class</DialogTitle>
        <DialogContent className="flex flex-col gap-4 mt-2">
          <TextField
            label="Class Name"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            label="Year"
            type="number"
            fullWidth
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleAddClass} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AllClasses;
