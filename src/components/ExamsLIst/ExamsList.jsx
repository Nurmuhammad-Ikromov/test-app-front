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
    { id: "title", label: "Exam Name", minWidth: 170, fontWeight: "bold" },
    { id: "status", label: "Status", minWidth: 100, fontWeight: "bold" },
    { id: "questions", label: "Questions", minWidth: 100, align: "right", fontWeight: "bold" },
    { id: "date", label: "Created At", minWidth: 170, align: "right", fontWeight: "bold" },
];

const getStatusColor = (status) => {
    switch (status) {
        case true:
            return "green";
        case false:
            return "red";
        default:
            return "black";
    }
};

const ExamsList = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(50);
    const [tests, setTests] = useState([]);
    const token = localStorage.getItem("token");


    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    useEffect(() => {
        API.get("/test/all", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((res) => setTests(res.data.data))
            .catch((err) => console.log(err));
    }, [token]);

    // Pagination logikasi
    const paginatedTests = tests.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-GB"); // DD/MM/YYYY format
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
                                    style={{ minWidth: column.minWidth, fontWeight: column?.fontWeight }}
                                >
                                    {column.label}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedTests.map((row, index) => (
                            <TableRow hover role="checkbox" tabIndex={-1} key={row._id}>
                                <Link
                                    to={`/tests/${row._id}`}
                                    style={{ textDecoration: "none", display: "contents" }}
                                >
                                    {columns.map((column) => {
                                        const value = row[column.id];

                                        if (column.id === "status") {
                                            return (
                                                <TableCell
                                                    key={column.id}
                                                    align={column.align}
                                                    style={{
                                                        color: getStatusColor(value),
                                                    }}
                                                >
                                                    {value ? "Enabled" : "Disabled"}
                                                </TableCell>
                                            );
                                        }

                                        if (column.id === "_id") {
                                            return (
                                                <TableCell key={column.id} align={column.align}>
                                                    {page * rowsPerPage + index + 1}
                                                </TableCell>
                                            );
                                        }

                                        if (column.id === "date") {
                                            return (
                                                <TableCell key={column.id} align={column.align}>
                                                    {formatDate(value)}
                                                </TableCell>
                                            );
                                        }


                                        return (
                                            <TableCell
                                                key={column.id}
                                                align={column.align}
                                                style={
                                                    column.id === "status"
                                                        ? { color: getStatusColor(value), fontWeight: "bold" }
                                                        : {}
                                                }
                                            >
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
                count={tests.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </Paper>
    );
};

export default ExamsList;
