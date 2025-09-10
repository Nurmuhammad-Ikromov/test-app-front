import { useEffect, useState } from "react";
import API from "./config";

export const useStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await API.get("/students/all");
        setStudents(res.data);
      } catch (err) {
        setError(err.message || "Nomaʼlum xatolik");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  return { students, loading, error };
};
