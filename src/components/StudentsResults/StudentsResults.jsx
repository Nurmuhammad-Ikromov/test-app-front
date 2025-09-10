import React, { useCallback, useEffect, useState } from "react";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import { Button, IconButton } from "@mui/material";
import API from "../../utils/config";
import { IoRefreshCircle } from "react-icons/io5";
import { RiFileExcel2Line, RiDownload2Fill } from "react-icons/ri";
import { Link } from "react-router-dom";

const columns = [
  { id: "_id", label: "#", minWidth: 50, fontWeight: "bold" },
  { id: "examTitle", label: "Exam Name", minWidth: 170, fontWeight: "bold" },
  { id: "student", label: "Student Name", minWidth: 170, fontWeight: "bold" },
  { id: "date", label: "Created At", minWidth: 100, fontWeight: "bold" },
  {
    id: "status",
    label: "Status",
    minWidth: 100,
    align: "right",
    fontWeight: "bold",
  },
  {
    id: "score",
    label: "Score",
    minWidth: 170,
    align: "right",
    fontWeight: "bold",
  },
  {
    id: "total",
    label: "Total",
    minWidth: 170,
    align: "right",
    fontWeight: "bold",
  },
  {
    id: "actions",
    label: "Actions",
    minWidth: 170,
    align: "right",
    fontWeight: "bold",
  },
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

const History = ({ id }) => {
  const [data, setResults] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const deleteResponse = useCallback(
    async (id) => {
      API.delete(`/exams/response/${id}`)
        .then((res) => {
          alert("Test o'chirildi");
          getExams();
        })
        .catch((err) => {
          alert("Muvaffaqqiyatsiz");
        });
    },
    [data]
  );

  const formattedData = data.map((item, index) => ({
    _id: index + 1,
    examTitle: item?.exam?.title,
    student: `${item.who.first_name} ${item.who.last_name}`,
    date: new Date(item.createdAt).toLocaleDateString("en-GB"),
    status: item.status,
    score: item.grade?.grade || 0,
    total: item.grade?.total || 0,
    actions: (
      <div className="flex gap-2">
        <Link to={`/teacher/student-rating/${item._id}`}>
          <Button variant="outlined" color="warn">
            Baholash
          </Button>
        </Link>
        <Button
          variant="outlined"
          color="error"
          onClick={() => deleteResponse(item._id)}
        >
          O'chirish
        </Button>
      </div>
    ),
  }));

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };
  function getExams() {
    let searchUrl = new URLSearchParams({ limit: rowsPerPage, page: page });

    API.get(`/exams/students/${id}/results?${searchUrl.toString()}`)
      .then((res) => {
        console.log(res.data);
        setResults(res.data.data);
      })
      .catch((err) => console.log(err));
  }
  useEffect(() => {
    getExams();
  }, []);
  const getExamsExcel = async () => {
    API.get(`/exams/students/${id}/results-excel`, {
      responseType: "blob",
    }).then((res) => {
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "results.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    });
  };
  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      <div className="flex justify-end p-3">
        <Button
          className="self-end"
          color="success"
          variant="outlined"
          onClick={getExamsExcel}
        >
          <RiFileExcel2Line />
          Donwload
        </Button>
        <IconButton className="self-end" color="primary" onClick={getExams}>
          <IoRefreshCircle />
        </IconButton>
      </div>
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{
                    minWidth: column.minWidth,
                    fontWeight: column.fontWeight,
                  }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {formattedData
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => (
                <TableRow hover role="checkbox" tabIndex={-1} key={row._id}>
                  {columns.map((column) => {
                    const value = row[column.id];
                    return (
                      <TableCell
                        key={column.id}
                        align={column.align}
                        style={
                          column.id === "status"
                            ? { color: getStatusColor(value) }
                            : {}
                        }
                      >
                        {value}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[50]}
        component="div"
        count={formattedData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default History;
