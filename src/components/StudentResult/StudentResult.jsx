import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import API from "../../utils/config";
import {
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Divider,
} from "@mui/material";
import { BiCheckCircle } from "react-icons/bi";

const GradeInput = React.memo(({ answerId, grade, onChange }) => {
  return (
    <TextField
      size="small"
      type="number"
      inputProps={{ min: 0, max: 100 }}
      value={grade || ""}
      onChange={(e) => onChange(answerId, e.target.value)}
    />
  );
});

const ResponseRow = React.memo(
  ({ index, question, response, grade, onChange }) => (
    <TableRow key={response?.questionId}>
      <TableCell>{index + 1}</TableCell>
      <TableCell>{question?.question}</TableCell>
      <TableCell>{response?.option}</TableCell>
      <TableCell>
        <GradeInput answerId={response?.id} grade={grade} onChange={onChange} />
      </TableCell>
    </TableRow>
  )
);

const StudentResult = () => {
  const { responseId } = useParams();
  const [responses, setResponses] = useState({});
  const [questions, setQuestions] = useState({});
  const [grades, setGrades] = useState({});
  const token = useMemo(() => localStorage.getItem("token"), []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await API.get(`/exams/response-result/${responseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        let responseExam = JSON.parse(res.data.result.exam_response);
        setResponses(responseExam);
        if (res.data.result.status === "graded") {
          setGrades(responseExam);
        } else {
          let result = Object.keys(responseExam)?.reduce(
            (accumulator, currentValue) => {
              // currentValue - bu joriy element
              accumulator[currentValue] = {
                grade: 0,
                question: questions[currentValue]?.question,
                answer: responseExam[currentValue].option,
              }; // currentValue ning id si obyektning kaliti bo'ladi
              return accumulator; // natijaviy obyektni qaytarish
            },
            {}
          );
          setGrades(result);
        }
        setQuestions(res.data.examQuestions);
      } catch (err) {
        console.error("Xatolik yuz berdi:", err);
      }
    };

    fetchData();
  }, [responseId, token]);

  const handleGradeChange = useCallback((answerId, value, question) => {
    setGrades((prevGrades) => ({
      ...prevGrades,
      [answerId]: {
        ...prevGrades[answerId],
        grade: value,
      },
    }));
  }, []);
  const totalGrade = useMemo(() =>
    Object.keys(grades).reduce(
      (total, value) => (total += +grades[value].grade),
      0
    )
  );
  const submitGrades = useCallback(() => {
    const exam_response = grades;
    const status = "graded";
    const grade = { total: 100, grade: totalGrade };
    API.post(
      `/exams/checked-practise/${responseId}`,
      { exam_response, status, grade },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
      .then(() => alert("Baholar muvaffaqiyatli saqlandi!"))
      .catch((err) => {
        console.error("Baholashda xatolik:", err);
        alert("Xatolik yuz berdi!");
      });
  }, [grades, responses, token]);

  const responseKeys = useMemo(() => Object.keys(responses), [responses]);

  return (
    <Paper sx={{ padding: 3 }} className="overflow-y-auto max-h-screen ">
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        O'quvchi javoblari va baholash
      </Typography>
      <div className="flex flex-wrap flex-col">
        {responseKeys.map((answerId, index) => {
          const question = questions[answerId];
          const response = responses[answerId];
          return (
            <Card
              key={answerId}
              variant="outlined"
              sx={{ mb: 2, boxShadow: 1 }}
            >
              <CardContent>
                <Typography variant="subtitle1" color="text.secondary">
                  {index + 1}-savol
                </Typography>

                <Typography variant="body1" fontWeight="medium" gutterBottom>
                  {question?.question}
                </Typography>

                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mt={2}
                  flexWrap="wrap"
                  gap={2}
                >
                  <Box className="w-full flex flex-col gap-3">
                    <Typography variant="title" color="text.secondary">
                      O'quvchi javobi:
                    </Typography>
                    <div
                      className="w-full"
                      style={{
                        padding: "16px",
                        borderRadius: "8px",
                        backgroundColor: "#2d2d2d",
                        color: "#f5f5f5",
                        fontFamily: '"Courier New", monospace',
                        fontSize: "14px",
                        lineHeight: "1.6",
                        border: "1px solid #444",
                        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
                        overflowX: "auto",
                        maxWidth: "100%",
                        wordWrap: "break-word",
                      }}
                    >
                      <Typography
                        variant="body2"
                        style={{ fontWeight: "normal" }}
                      >
                        {response?.option || response?.answer || ""}
                      </Typography>
                    </div>
                  </Box>

                  <TextField
                    label="Baho"
                    size="small"
                    type="number"
                    inputProps={{ min: 0, max: 100 }}
                    value={grades[answerId]?.grade || response?.grade || ""}
                    onChange={(e) =>
                      handleGradeChange(answerId, e.target.value, question)
                    }
                    sx={{ maxWidth: 120 }}
                  />
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-end">
        <Button
          variant="contained"
          color="primary"
          sx={{ marginTop: 3 }}
          onClick={submitGrades}
          className="self-end z-10 relative"
        >
          Baholarni Saqlash
        </Button>
      </div>
      <Box
        display="flex"
        alignItems="center"
        gap={1}
        mt={2}
        className="sticky bottom-12 z-12"
      >
        <Typography
          variant="h6"
          color=""
          className="text-white"
          fontWeight="bold"
          sx={{
            backgroundColor: "primary.light",
            px: 2,
            py: 1,
            borderRadius: 2,
            boxShadow: 2,
          }}
        >
          Umumiy ball: {totalGrade}
        </Typography>
      </Box>
    </Paper>
  );
};

export default StudentResult;
