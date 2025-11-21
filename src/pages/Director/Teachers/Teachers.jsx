import React, { useEffect, useState } from "react";
import API from "../../../utils/config";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    teacher: null,
  });

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Fetch teachers
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setLoading(true);
        const res = await API.get("/teacher");

        setTeachers(res.data || []);
      } catch (err) {
        console.error("Error fetching teachers:", err);
        toast.error("Failed to load teachers");
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  // Create teacher
  const createTeacher = async () => {
    if (!firstName || !lastName || !username || !password) {
      toast.warn("Fill in all fields");
      return;
    }

    try {
      const res = await API.post("/teacher", {
        first_name: firstName,
        last_name: lastName,
        username,
        password,
        role: "teacher",
        status: true,
      });

      toast.success(res.data?.message || "Teacher created successfully");
      setTeachers((prev) => [...prev, res.data?.teacher]);

      // reset
      setFirstName("");
      setLastName("");
      setUsername("");
      setPassword("");
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error creating teacher:", err);
      toast.error(err.response?.data?.message || "Failed to add teacher");
    }
  };

  // Delete teacher
  const deleteTeacher = async () => {
    try {
      const id = deleteModal.teacher._id;
      const res = await API.delete(`/teacher/${id}`);

      const data = await res.data;

      setTeachers((prev) => prev.filter((t) => t._id !== id));
      toast.success("Teacher deleted successfully");
      setDeleteModal({ open: false, teacher: null });
    } catch (err) {
      console.error("Error deleting teacher:", err);
      toast.error(err.response?.data?.message || "Failed to delete teacher");
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">Teachers</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Add Teacher
        </button>
      </div>

      {/* Teachers List */}
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : teachers.length === 0 ? (
        <p className="text-gray-500">No teachers yet.</p>
      ) : (
        <ul className="space-y-2">
          {teachers.map((teacher) => (
            <li
              key={teacher._id}
              className="p-3 bg-gray-100 rounded-md shadow-sm flex justify-between items-center"
            >
              <span>
                {teacher?.first_name} {teacher?.last_name} ({teacher?.username})
              </span>
              <div className="space-x-2">
                <button
                  onClick={() =>
                    navigate(`/director/teachers/${teacher._id}`, {
                      state: teacher,
                    })
                  }
                  className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Info
                </button>
                <button
                  onClick={() => setDeleteModal({ open: true, teacher })}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Add Teacher Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-96 shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Add New Teacher</h2>

            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First Name"
              className="w-full border rounded-lg px-3 py-2 mb-3"
            />
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last Name"
              className="w-full border rounded-lg px-3 py-2 mb-3"
            />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="w-full border rounded-lg px-3 py-2 mb-3"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full border rounded-lg px-3 py-2 mb-4"
            />

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={createTeacher}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-96 shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Confirm Delete</h2>
            <p className="mb-4">
              Haqiqatdan ham{" "}
              <strong>
                {deleteModal.teacher.first_name} {deleteModal.teacher.last_name}
              </strong>{" "}
              ni o‘chirmoqchimisiz?
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setDeleteModal({ open: false, teacher: null })}
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
              >
                Yo‘q
              </button>
              <button
                onClick={deleteTeacher}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Ha
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teachers;
