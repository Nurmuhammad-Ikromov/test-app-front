import React, { useEffect, useState } from "react";
import API from "../../../utils/config";
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
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [year, setYear] = useState("");

  // Classlarni olish
  const fetchClasses = async () => {
    try {
      const res = await API.get("/class");
      setClasses(res.data);
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

      {/* Classes List */}
      {classes.length === 0 ? (
        <p className="text-gray-500">No classes yet.</p>
      ) : (
        <ul className="space-y-2">
          {classes.map((cls) => (
            <li
              key={cls._id}
              className="p-3 bg-gray-100 rounded-lg shadow flex justify-between items-center"
            >
              <span className="font-medium">
                {cls.name} — {cls.year}
              </span>
            </li>
          ))}
        </ul>
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
