import { useState } from "react";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";

const columns = [
  { id: "_id", label: "#", minWidth: 50, fontWeight: "bold" },
  { id: "question", label: "Question", minWidth: 170 },
  { id: "1", label: "Answer 1", minWidth: 100 },
  { id: "2", label: "Answer 2", minWidth: 100, align: "left" },
  { id: "3", label: "Answer 3", minWidth: 170, align: "left" },
  { id: "4", label: "Answer 4", minWidth: 170, align: "left" },
];

const QuestionList = ({ test }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);

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
                  style={{ minWidth: column.minWidth }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {test
              ?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, rowIndex) => (
                <TableRow hover role="checkbox" tabIndex={-1} key={rowIndex}>
                  {columns.map((column, colIndex) => {
                    let cellValue;
                    let cellKey = `${rowIndex}-${column.id}`;

                    if (column.id === "question") {
                      cellValue = row.question;
                    } else {
                      const optionIndex = parseInt(column.id) - 1;
                      const option = row.options[optionIndex]?.text || "";
                      cellValue = option;

                      if (option === row.correctAnswer) {
                        return (
                          <TableCell
                            key={cellKey}
                            align={column.align}
                            style={{ color: "green", fontWeight: "bold" }}
                          >
                            {option}
                          </TableCell>
                        );
                      }

                      if (column.id === "_id") {
                        return (
                          <TableCell key={column.id} align={column.align}>
                            {page * rowsPerPage + rowIndex + 1}
                          </TableCell>
                        );
                      }
                    }
                    return (
                      <TableCell key={cellKey} align={column.align}>
                        {cellValue}
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
        count={test?.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default QuestionList;
