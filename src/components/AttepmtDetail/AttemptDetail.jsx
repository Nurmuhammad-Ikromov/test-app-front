import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import QuestionList from "../QuestionList/QuestionList";
import StudentResults from "../StudentsResults/StudentsResults";
import API from "../../utils/config";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";

const AttemptDetail = () => {
  const { attemptId } = useParams();
  const [alignment, setAlignment] = useState("results");
  const handleAlignment = (event, newAlignment) => {
    setAlignment(newAlignment);
  };
  const [questions, setQuestions] = useState(null);
  const [examName, setExamName] = useState("");
  const [results, setResults] = useState([]);

  useEffect(() => {
    API.get(`/exams/${attemptId}`)
      .then((res) => {
        setExamName(res.data?.title);
        setQuestions(Object.values(res.data.questions));
      })
      .catch((err) => console.log(err));
  }, [attemptId]);

  return (
    <div className="p-8">
      <Navbar title={"Exam Questions"} name={examName} />
      <ToggleButtonGroup
        color="warning"
        value={alignment}
        exclusive
        onChange={handleAlignment}
        className="mb-3"
        aria-label="text alignment"
      >
        <ToggleButton value="results" aria-label="centered">
          Natijalari
        </ToggleButton>
        <ToggleButton value="questions" aria-label="left aligned">
          Savollar
        </ToggleButton>
      </ToggleButtonGroup>
      {questions?.length && alignment === "questions" && (
        <QuestionList test={questions} />
      )}
      {questions?.length && alignment === "results" && (
        <StudentResults id={attemptId} />
      )}
    </div>
  );
};

export default AttemptDetail;
