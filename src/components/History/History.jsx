import React, { useEffect, useState } from "react";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import { Link } from "react-router-dom";
import API from "../../utils/config";

const columns = [
  { id: "_id", label: "#", minWidth: 50, fontWeight: "bold" },
  { id: "examTitle", label: "Exam Name", minWidth: 170, fontWeight: "bold" },
  { id: "date", label: "Created At", minWidth: 100, fontWeight: "bold" },
  { id: "status", label: "Status", minWidth: 100, align: "right", fontWeight: "bold" },
  { id: "score", label: "Score", minWidth: 170, align: "right", fontWeight: "bold" },
  { id: "total", label: "Total", minWidth: 170, align: "right", fontWeight: "bold" },
];

const getStatusColor = (status) => {
  switch (status) {
    case "pending":
      return "orange";
    case "completed":
      return "green";
    default:
      return "black";
  }
};

const History = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [grades, setGrades] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    API.get("/auth/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        const formattedGrades = res.data.user.grades.map((item, index) => {
          // Natija o'qituvchi tomonidan yopilgan bo'lsa, ball ko'rsatilmaydi
          const hidden = item.resultHidden || !item.exam_response;
          return {
            _id: index + 1,
            examTitle: item.exam?.title,
            date: new Date(item.createdAt).toLocaleDateString("en-GB"),
            status: hidden ? "yopiq" : item.status,
            score: hidden
              ? "—"
              : Object.values(JSON.parse(item.exam_response)).filter((q) => q.check).length,
            total: hidden
              ? "—"
              : Object.keys(JSON.parse(item.exam_response)).length,
          };
        });
        setGrades(formattedGrades);
      })
      .catch((err) => console.log(err));
  }, [token]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth, fontWeight: column.fontWeight }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {grades.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
              <TableRow hover role="checkbox" tabIndex={-1} key={row._id}>
                <Link
                  to={`/grades/${row._id}`}
                  style={{ textDecoration: "none", display: "contents" }}
                >
                  {columns.map((column) => {
                    const value = row[column.id];
                    return (
                      <TableCell key={column.id} align={column.align} style={column.id === "status" ? { color: getStatusColor(value) } : {}}>
                        {value}
                      </TableCell>
                    );
                  })}
                </Link>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[50]}
        component="div"
        count={grades.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default History;