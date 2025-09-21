import React, { useEffect, useState } from "react";
import { Link, useLoaderData, useParams } from "react-router-dom";
import API from "../../utils/config";
import Navbar from "../Navbar/Navbar";
import QuestionList from "../QuestionList/QuestionList";
import { Button } from "@mui/material";

const TestDetail = () => {
    const { testId } = useParams()
    const [test, setTest] = useState(null)
    const [testName, setTestName] = useState("")


    const getTestDetail = async (id) => {
        const res = await API.get(`/test/${id}`)
        const data = await res.data
        setTestName(data?.title)

        setTest(Object.values(data.test))
    }
    useEffect(() => {
        getTestDetail(testId)
    }, [testId])



    return <div className="p-8">
        <Navbar title={"Questions"} name={testName} />

        {
            test?.length &&
            <QuestionList test={test} />
        }

        <div style={{
            display: "flex",
            justifyContent: "flex-end",
            paddingTop: "10px"
        }}>
            <Button
                variant="contained"
                color="primary"
                component={Link}
                to={`/teacher/tests/${testId}/start`} // Tugma bosilganda o'tadigan manzil
                sx={{
                    textTransform: "none", // Matnni kichik harflarda saqlash
                    fontWeight: "bold",
                    padding: "10px 20px",

                }}
            >
                Start Exam
            </Button>
        </div>

    </div>;
};

export default TestDetail;
