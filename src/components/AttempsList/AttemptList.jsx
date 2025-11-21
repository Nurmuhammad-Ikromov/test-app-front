import { useCallback, useEffect, useState } from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import { Link } from "react-router-dom";
import { BsEye } from "react-icons/bs";
import { BiBasket } from "react-icons/bi";
import API from "../../utils/config";

const getStatusColor = (status) => (status ? "green" : "red");
const formatDate = (date) => new Date(date).toLocaleDateString("en-GB");

const columns = (role) => {
  if (role === "director") {
    return [
      { id: "id", label: "#", minWidth: 50 },
      { id: "title", label: "Exam Name", minWidth: 170 },
      { id: "status", label: "Status", minWidth: 100 },
      { id: "class.name", label: "Class", minWidth: 100, align: "right" },
      { id: "createdAt", label: "Created At", minWidth: 170, align: "right" },
      { id: "who", label: "Teacher", minWidth: 170, align: "left" },
      { id: "actions", label: "Actions", minWidth: 170, align: "right" },
    ];
  } else {
    return [
      { id: "id", label: "#", minWidth: 50 },
      { id: "title", label: "Exam Name", minWidth: 170 },
      { id: "status", label: "Status", minWidth: 100 },
      { id: "class.name", label: "Class", minWidth: 100, align: "right" },
      { id: "createdAt", label: "Created At", minWidth: 170, align: "right" },
      { id: "actions", label: "Actions", minWidth: 170, align: "right" },
    ];
  }
};

const AttemptList = () => {
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [exams, setExams] = useState([]);
  const token = localStorage.getItem("token");
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedData, setSelectedData] = useState(null);
  let role = localStorage.getItem("role");
  const handleDeleteClick = (id, data) => {
    setSelectedId(id);
    setSelectedData(data);
    setOpenDialog(true);
  };
  const handleConfirmDelete = () => {
    if (selectedId) {
      deleteResponse(selectedId);
      setOpenDialog(false);
      setSelectedId(null);
    }
  };

  const handleCancelDelete = () => {
    setOpenDialog(false);
    setSelectedId(null);
  };
  const fetchExams = useCallback(async () => {
    try {
      const searchUrl = new URLSearchParams({
        limit: rowsPerPage,
        page: page + 1,
      }); // 1-based page index
      const res = await API.get(`/exams?${searchUrl.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExams(res.data.data);
      setTotal(res.data.total); // <-- to‘g‘risi shu
    } catch (err) {
      console.error("Fetch failed", err);
    }
  }, [page, rowsPerPage, token]);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  const deleteResponse = useCallback(
    async (id) => {
      try {
        await API.delete(`/exams/${id}`);
        alert("Test o'chirildi");
        fetchExams();
      } catch (err) {
        alert("Muvaffaqqiyatsiz");
        console.error(err);
      }
    },
    [fetchExams]
  );

  const renderCell = (row, column, index) => {
    switch (column.id) {
      case "id":
        return page * rowsPerPage + index + 1;
      case "status":
        return (
          <span
            style={{ color: getStatusColor(row.status), fontWeight: "bold" }}
          >
            {row.status ? "Enabled" : "Disabled"}
          </span>
        );
      case "createdAt":
        return formatDate(row.createdAt);
      case "class.name":
        return row.class?.name || "N/A";
      case "who":
        return row.who?.first_name + " " + row.who?.last_name || "Teacher";
      case "actions":
        return (
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Link
              to={`/teacher/exams/${row._id}`}
              style={{ textDecoration: "none" }}
            >
              <IconButton color="success" size="small">
                <BsEye />
              </IconButton>
            </Link>
            <IconButton
              color="error"
              size="small"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDeleteClick(row._id, row); // oldingi deleteResponse o‘rniga
              }}
            >
              <BiBasket />
            </IconButton>
          </div>
        );
      default:
        return row[column.id];
    }
  };

  return (
    <>
      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                {columns(role).map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align}
                    style={{ minWidth: column.minWidth }}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {exams.map((row, index) => (
                <TableRow hover key={row._id}>
                  {columns(role).map((column) => (
                    <TableCell key={column.id} align={column.align}>
                      {renderCell(row, column, index)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={total} // <-- to‘g‘risi shu
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(+e.target.value);
            setPage(0);
          }}
        />
      </Paper>

      <Dialog open={openDialog} onClose={handleCancelDelete}>
        <DialogTitle>Testni o‘chirishni xohlaysizmi?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Siz haqiqatdan ham {JSON.stringify(selectedData?.title)} testini
            o'chirmoqchimisiz? Bu amalni bekor qilib bo‘lmaydi. Davom etishni
            istaysizmi?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Bekor qilish</Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
          >
            O‘chirish
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AttemptList;
