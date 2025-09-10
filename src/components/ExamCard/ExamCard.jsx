import React from "react";
import {
  Card,
  CardContent,
  Typography,
  CardActions,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import moment from "moment";

const ExamCard = ({
  _id,
  title,
  questionsCount,
  startTime,
  endTime,
  questions,
  type,
}) => {
  console.log(_id);
  const navigate = useNavigate();

  // startTime va endTime formatini moment.js yordamida o'zgartirish
  const formattedStartTime = moment(startTime).format("MMMM Do YYYY, h:mm A");
  const formattedEndTime = moment(endTime).format("MMMM Do YYYY, h:mm A");

  const handleStartExam = () => {
    // console.log(`/student/exams/${_id}`, { state: { title, questions } })
    // Test sahifasiga o'tish va savollarni yuborish
    navigate(`/exams/${_id}`, { state: { title, questions } });
  };

  return (
    <Card sx={{ maxWidth: 400, margin: "auto", padding: 2 }}>
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {title}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          <strong>Questions:</strong> {questionsCount}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          <strong>Start Time:</strong> {formattedStartTime}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          <strong>End Time:</strong> {formattedEndTime}
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small" color="primary" onClick={handleStartExam}>
          Start Exam
        </Button>
      </CardActions>
    </Card>
  );
};

export default ExamCard;
