import { useEffect, useRef, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Radio,
  FormControlLabel,
  CircularProgress,
  LinearProgress,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
} from "@mui/material";
import API from "../../../utils/config"; // Axios API config import
import { Link, useParams } from "react-router-dom";
import { Editor } from "@monaco-editor/react"; // Editorni qayta qo'shdim
import {
  IoMdArrowDropleftCircle,
  IoMdArrowDroprightCircle,
} from "react-icons/io";

const ExamPage = () => {
  const [proLanguga, setProLanguage] = useState("javascript");
  const handleChange = (event) => {
    setProLanguage(event.target.value);
  };

  const [output, setOutput] = useState({});
  const [codeOutput, setCodeOutput] = useState({});
  const alreadySubmittedRef = useRef(false);
  const { examId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [type, setType] = useState("");

  // Fetch exam questions and shuffle options
  const fetchExamQuestions = async () => {
    try {
      const res = await API.get(`/exams/${examId}`);
      if (!res.data.status) {
        setError("Test ishlangan yoki mavjud emas.");
        return;
      }
      let questions = res?.data?.questions;
      const questionsValues = Object.keys(questions).map((key) => {
        const question = questions[key]; // Savolni olish
        question.id = key; // ID qo'shish
        question.options = shuffleArray(question.options); // Variantlarni aralashtirish
        return question;
      });
      setType(res.data.type);
      setQuestions(shuffleArray(questionsValues));
    } catch (err) {
      setError("Savollarni olishda xatolik yuz berdi.");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };
  // Shuffle array helper
  const shuffleArray = (array) => {
    return array.sort(() => Math.random() - 0.5);
  };

  // Handle option change (for practice and test types)
  const handleOptionChange = (questionId, selectedOption) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: selectedOption,
    }));
  };

  // Submit answers to API
  const submitAnswers = async () => {
    if (alreadySubmittedRef.current) return;
    alreadySubmittedRef.current = true;
    let response_result;
    if (type == "test") {
      console.log(answers);
      response_result = questions.reduce((total, question) => {
        total[question.id] = {
          id: question.id,
          question: question.question,
          option: answers[question.id].text || "",
        };
        return total;
      }, {});
    } else if (type === "practise") {
      response_result = questions.map((question) => ({
        id: question.id,
        question: question.question,
        option: output[question.id] || "",
      }));
      console.log(response_result);
    }
    console.log(response_result);
    try {
      const res = await API.post(`/exams/check/${examId}`, {
        response_result: response_result || questions,
        type,
      });
      setResult(res.data);
    } catch (err) {
      console.log(err);
      setError("Javoblarni yuborishda xatolik yuz berdi.");
    }
  };

  // Handle question navigation
  const handleQuestionNavigation = (index) => {
    setCurrentQuestion(index);
  };

  // Handle JavaScript code execution for each question
  const runCode = (questionId) => {
    try {
      const func = new Function("console", output[questionId]); // Use console to log output
      const logOutput = (message) => {
        setCodeOutput((prev) => ({
          ...prev,
          [questionId]: message, // Update the state with the console output for specific question
        }));
      };

      const customConsole = {
        log: logOutput, // Replace console.log with our custom function
      };

      func(customConsole); // Run code with our custom console
    } catch (err) {
      setCodeOutput((prev) => ({
        ...prev,
        [questionId]: err.toString(),
      }));
    }
  };
  const enterFullScreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) {
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    }
  };

  function handleVisibilityChange() {
    if (document.visibilityState === "visible") {
      console.log("Tab aktiv holatda");
      // Bu yerga tab aktiv bo‘lganda bajariladigan kodni yozing
    } else {
      submitAnswers();
      // Bu yerga tab noaktiv bo‘lganda bajariladigan kodni yozing
    }
  }
  const handleBeforeUnload = (event) => {
    event.preventDefault();
    submitAnswers();
    event.returnValue = ""; // Bu kerak, aks holda ayrim brauzerlar e'tibor bermaydi
  };
  // Keyboard and event listeners setup
  useEffect(() => {
    if (examId !== "create") {
      fetchExamQuestions();
    }

    const handlePopState = (event) => {
      event.preventDefault();
      window.history.pushState(null, null, window.location.href);
    };

    const handleKeyDown = (event) => {
      if (
        (event.altKey && event.key === "ArrowLeft") ||
        event.key === "Backspace"
      ) {
        event.preventDefault();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    enterFullScreen();
    window.addEventListener("beforeunload", handleBeforeUnload);

    document.addEventListener("fullscreenchange", preventExitFullScreen);

    const disableSwipeBack = (event) => event.preventDefault();

    window.history.pushState(null, null, window.location.href);
    window.addEventListener("popstate", handlePopState);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("touchstart", disableSwipeBack, { passive: false });

    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("beforeunload", handleBeforeUnload);

      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("touchstart", disableSwipeBack);
    };
  }, [examId]);

  const preventExitFullScreen = () => {
    if (!document.fullscreenElement) {
      document.exitFullscreen();
      submitAnswers();
    }
  };
  console.log();
  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Savollar yuklanmoqda...
        </Typography>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center">
        <Typography variant="h6" color="error" style={{ textAlign: "center" }}>
          {error}
        </Typography>
        <Link to={"/student/exams"}>Ortga qaytish</Link>
      </div>
    );
  }

  if (result) {
    return (
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <Typography variant="h4">Natijalar</Typography>
        <Typography variant="h6">
          Tez orada e'lon qilinadi
          {/* To'g'ri javoblar: {result?.result?.grade?.grade}/ */}
          {/* {result?.result?.grade?.total} */}
        </Typography>
        <Link to={"/student/exams"}>Ortga qaytish</Link>
      </div>
    );
  }

  const totalQuestions = questions.length;
  const answeredQuestions = Object.keys(answers).length;

  return (
    <div className="p-4">
      <Typography variant="h4" gutterBottom>
        Imtihon Savollari
      </Typography>
      <Box sx={{ mt: 2, mb: 2 }}>
        <Typography variant="subtitle1">
          {answeredQuestions}/{totalQuestions} savolga javob berildi
        </Typography>
        <LinearProgress
          variant="determinate"
          value={(answeredQuestions / totalQuestions) * 100}
        />
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          mb: 3,
          flexWrap: "wrap",
        }}
      >
        {questions.map((question, index) => (
          <Button
            key={index}
            variant={
              output[question.id] || index === currentQuestion
                ? "contained"
                : "outlined"
            }
            color={output[question.id] ? "success" : "primary"}
            onClick={() => handleQuestionNavigation(index)}
            sx={{
              mx: 1,
              my: 1,
            }}
          >
            {index + 1}
          </Button>
        ))}
      </Box>

      {questions.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <div className="grid grid-cols-[1fr_200px]">
              <Typography variant="h5">
                Savol {currentQuestion + 1}:{" "}
                {questions[currentQuestion]?.question}
              </Typography>
              {type === "coding" ||
                (type === "practise" && (
                  <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
                    <InputLabel id="demo-select-small-label">
                      Language
                    </InputLabel>
                    <Select
                      labelId="demo-select-small-label"
                      id="demo-select-small"
                      defaultValue={proLanguga}
                      value={proLanguga}
                      label="Language"
                      onChange={handleChange}
                    >
                      <MenuItem value={"javascript"}>Javascript</MenuItem>
                      <MenuItem value={"text"}>Text</MenuItem>
                    </Select>
                  </FormControl>
                ))}
            </div>
            <Box sx={{ mt: 2 }} className="flex flex-col">
              {questions[currentQuestion]?.options?.map((option, idx) => (
                <FormControlLabel
                  key={idx}
                  control={
                    <Radio
                      checked={
                        answers[questions[currentQuestion]?.id] === option
                      }
                      onChange={() =>
                        handleOptionChange(
                          questions[currentQuestion].id,
                          option
                        )
                      }
                    />
                  }
                  label={option?.text}
                />
              ))}
            </Box>
            {/* Editorni qayta qo'shdim */}
            {type === "coding" ||
              (type === "practise" && (
                <Editor
                  height="300px"
                  className="border p-6 bg-black rounded-3xl"
                  language={proLanguga}
                  theme="vs-dark"
                  value={output[questions[currentQuestion].id] || ""}
                  onChange={(value) => {
                    setOutput((prev) => ({
                      ...prev,
                      [questions[currentQuestion].id]: value,
                    }));
                  }}
                />
              ))}
            {type === "practise" && (
              <Button
                variant="contained"
                color="primary"
                onClick={() => runCode(questions[currentQuestion].id)}
                sx={{ mt: 2, mb: 2 }}
              >
                Kodni ishga tushurish
              </Button>
            )}
            <div className="flex justify-start w-full">
              <Box className="w-full self-start !m-0">
                {codeOutput[questions[currentQuestion].id] && (
                  <Paper
                    sx={{
                      padding: 1.5,
                      backgroundColor: "#212121", // Dark background for paper
                      color: "#e0e0e0", // Light text
                      borderRadius: 2,
                      boxShadow: 3,
                    }}
                  >
                    <Typography
                      variant="body1"
                      sx={{ color: "#81c784", marginBottom: 1 }}
                    >
                      Code Output:
                    </Typography>
                    <Box
                      sx={{
                        padding: 1.5,
                        backgroundColor: "#121212", // Darker background for code
                        color: "#f5f5f5", // Light text for code
                        borderRadius: 1,
                        minHeight: 100, // Smaller height for code block
                        fontFamily: "monospace", // Monospace font for code
                        whiteSpace: "pre-wrap", // Preserve white spaces
                        wordBreak: "break-word", // Handle long words
                        overflowY: "auto", // Allow scrolling if the text overflows
                        fontSize: "0.875rem", // Smaller font size
                      }}
                    >
                      {codeOutput[questions[currentQuestion].id]}
                    </Box>
                  </Paper>
                )}
              </Box>
            </div>
          </CardContent>
        </Card>
      )}

      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
        <Button
          variant="contained"
          color="primary"
          disabled={currentQuestion === 0}
          onClick={() => handleQuestionNavigation(currentQuestion - 1)}
          startIcon={<IoMdArrowDropleftCircle />}
        >
          Oldingi savol
        </Button>
        <Button
          variant="contained"
          color="primary"
          disabled={currentQuestion === totalQuestions - 1}
          onClick={() => handleQuestionNavigation(currentQuestion + 1)}
          endIcon={<IoMdArrowDroprightCircle />}
        >
          Keyingi savol
        </Button>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <Button
          variant="contained"
          color="success"
          onClick={submitAnswers}
          disabled={
            questions.length !==
            (Object.keys(output).filter((value) => output[value]).length ||
              Object.keys(answers).length)
          }
        >
          Imtihonni topshirish
        </Button>
      </Box>
    </div>
  );
};

export default ExamPage;
