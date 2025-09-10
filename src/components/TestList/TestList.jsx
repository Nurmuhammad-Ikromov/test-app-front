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
import moment from "moment";
import { BiBasket } from "react-icons/bi";
import API from "../../utils/config";

const columns = [
  { id: "_id", label: "#", minWidth: 50, fontWeight: "bold" },
  { id: "title", label: "Test Nomi", minWidth: 170, fontWeight: "bold" },
  { id: "status", label: "Status", minWidth: 100, fontWeight: "bold" },
  {
    id: "createdAt",
    label: "Yaratilgan vaqti",
    minWidth: 170,
    align: "right",
    fontWeight: "bold",
  },
  {
    id: "actions",
    label: "Amallar",
    minWidth: 170,
    align: "right",
    fontWeight: "bold",
  },
];

const getStatusColor = (status) => (status ? "green" : "red");

const TestList = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [total, setTotal] = useState(0);
  const [tests, setTests] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const token = localStorage.getItem("token");
  const handleDeleteClick = (test) => {
    setSelectedTest(test);
    setOpenDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedTest) {
      try {
        await API.delete(`/test/${selectedTest._id}`);
        alert("Test o'chirildi");
        fetchTests();
      } catch (err) {
        alert("Muvaffaqqiyatsiz");
      } finally {
        setOpenDialog(false);
        setSelectedTest(null);
      }
    }
  };

  const handleCancelDelete = () => {
    setOpenDialog(false);
    setSelectedTest(null);
  };
  const fetchTests = async () => {
    try {
      const params = new URLSearchParams({ limit: rowsPerPage, page });
      const res = await API.get(`/test/all?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTests(res.data.data);
      setTotal(res.data.total);
    } catch (err) {
      console.error("Failed to fetch tests:", err);
    }
  };

  useEffect(() => {
    fetchTests();
  }, [page, rowsPerPage]);

  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(+e.target.value);
    setPage(0);
  };

  const formatDate = (dateString) => moment(dateString).format("DD.MM.YYYY");

  const deleteTest = useCallback(
    async (id) => {
      try {
        await API.delete(`/test/${id}`);
        alert("Test o'chirildi");
        fetchTests();
      } catch (err) {
        alert("Muvaffaqqiyatsiz");
      }
    },
    [page, rowsPerPage]
  );

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
            {tests.map((test, index) => (
              <TableRow hover key={test._id}>
                {columns.map((column) => {
                  const value = test[column.id];

                  switch (column.id) {
                    case "_id":
                      return (
                        <TableCell key={column.id}>
                          {page * rowsPerPage + index + 1}
                        </TableCell>
                      );
                    case "status":
                      return (
                        <TableCell
                          key={column.id}
                          style={{ color: getStatusColor(value) }}
                        >
                          {value ? "Enabled" : "Disabled"}
                        </TableCell>
                      );
                    case "createdAt":
                      return (
                        <TableCell key={column.id}>
                          {formatDate(value)}
                        </TableCell>
                      );
                    case "actions":
                      return (
                        <TableCell key={column.id} align="right">
                          <div className="flex items-center gap-3 justify-end">
                            <Link
                              to={`/teacher/tests/${test._id}/start`}
                              className="text-green-600 font-sans"
                            >
                              Imtihon yaratish
                            </Link>
                            <IconButton
                              aria-label="delete"
                              size="small"
                              color="error"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleDeleteClick(test);
                              }}
                            >
                              <BiBasket />
                            </IconButton>
                          </div>
                        </TableCell>
                      );
                    default:
                      return <TableCell key={column.id}>{value}</TableCell>;
                  }
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[50]}
        component="div"
        count={total}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      <Dialog open={openDialog} onClose={handleCancelDelete}>
        <DialogTitle>Testni o‘chirishni xohlaysizmi?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <strong>{selectedTest?.title}</strong> nomli testni
            o‘chirmoqchimisiz? Bu amalni bekor qilib bo‘lmaydi.
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
    </Paper>
  );
};

export default TestList;
