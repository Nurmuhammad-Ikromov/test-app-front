import { createBrowserRouter, Navigate } from "react-router-dom";
import LoginPage from "./pages/Login/Login";
import StudentHome from "./pages/Student/StudentHome/StudentHome";
import TeacherHome from "./pages/Teacher/TeacherHome/TeacherHome";
import StudentExams from "./pages/Student/StudentExams/StudentExams";
import TestListPage from "./pages/Teacher/TestLIstPage/TestListPage";
import TestList from "./components/TestList/TestList";
import TestDetail from "./components/TestDetail/TestDetail";
import CreateExam from "./pages/Teacher/CreateExam/CreateExam";
import AttemptPage from "./pages/Teacher/AttemptPage/AttemptPage";
import AttemptList from "./components/AttempsList/AttemptList";
import AttemptDetail from "./components/AttepmtDetail/AttemptDetail";
import Settings from "./pages/Teacher/Settings/Settings";
import CreateTest from "./pages/Teacher/CreateTest/CreateTest";
import ExamPage from "./pages/Student/ExamPage/ExamPage";
import Profile from "./pages/Profile/Profile";
import ProfileData from "./components/ProfileData/ProfileData";
import History from "./components/History/History";
import AddStudent from "./pages/Teacher/AddStudent/CreateExam";
import StudentList from "./pages/Teacher/Students/StudentList";
import StudentListPage from "./pages/Teacher/StudentList/StudentListPage";
import StudentResult from "./components/StudentResult/StudentResult";
import Classes from "./pages/Teacher/Classes/Classes";
import Grades from "./pages/Student/Grades/Grades";
import DirectorHome from "./pages/Director/DirectorHome/DirectorHome";
import Teachers from "./pages/Director/Teachers/Teachers";
import SingleTeacher from "./pages/Director/SingleTeacher/SingleTeacher";
import AllClasses from "./pages/Director/Classes/Classes";
import AssignTeacher from "./pages/Director/AssignTeacher/AssignTeacher";
import Subjects from "./pages/Director/Subjects/Subjects";
import SingleClass from "./pages/SingleClass/SingleClass";

function ProtectedRoute({ children, role }) {
  const storedRole = localStorage.getItem("role");

  // Agar role mavjud bo‘lmasa — foydalanuvchi login qilmagan
  if (!storedRole) {
    return <Navigate to="/login" replace />;
  }

  // Agar role parametri massiv bo‘lsa, uni tekshiramiz
  const allowedRoles = Array.isArray(role) ? role : [role];

  if (!allowedRoles.includes(storedRole)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />, // Agar foydalanuvchi kirish sahifasiga yo'naltirilsa
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/student",
    element: (
      <ProtectedRoute role="student">
        <StudentHome />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "grades",
        element: <Grades />,
      },
      {
        path: "exams",
        element: <StudentExams />,
      },

      {
        path: "profile",
        element: <Profile />,
        children: [
          {
            path: "",
            element: <Navigate to={"info"} replace />,
          },
          {
            path: "info",
            element: <ProfileData />,
          },
          {
            path: "history",
            element: <History />,
          },
        ],
      },
    ],
  },
  {
    path: "/exams/:examId",
    element: <ExamPage />,
  },
  {
    path: "/teacher",
    element: (
      <ProtectedRoute role={["teacher", "director"]}>
        <TeacherHome />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "tests",
        element: <TestListPage />,
        children: [
          {
            path: "",
            element: <TestList />,
          },
        ],
      },
      {
        path: "student-rating",
        children: [
          {
            path: ":responseId",
            element: <StudentResult />,
          },
        ],
      },
      {
        path: "profile",
        element: <Profile />,
        children: [
          {
            path: "",
            element: <Navigate to={"info"} replace />,
          },
          {
            path: "info",
            element: <ProfileData />,
          },
          // {
          //   path: "history",
          //   element: <History />,
          // },
        ],
      },
      {
        path: "students",
        element: <StudentListPage />,
        children: [
          {
            path: "",
            element: <StudentList />,
          },
        ],
      },
      {
        path: "tests/:testId",
        element: <TestDetail />,
      },
      {
        path: "tests/:testId/start",
        element: <CreateExam />,
      },
      {
        path: "exams",
        element: <AttemptPage />,
        children: [
          {
            path: "",
            element: <AttemptList />,
          },
        ],
      },
      {
        path: "exams/:attemptId",
        element: <AttemptDetail />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
      {
        path: "tests/create",
        element: <CreateTest />,
      },
      {
        path: "exams/create",
        element: <CreateExam />,
      },
      {
        path: "add-student",
        element: <AddStudent />,
      },
      {
        path: "classes",
        element: <Classes />,
      },
    ],
  },

  {
    path: "/director",
    element: (
      <ProtectedRoute role={"director"}>
        <DirectorHome />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "teachers",
        element: <Teachers />,
      },
      {
        path: "teachers/:teacherId",
        element: <SingleTeacher />,
      },
      {
        path: "classes",
        element: <AllClasses />,
      },
      {
        path: "classes/:classId",
        element: <SingleClass />,
      },
      {
        path: "assign-teacher",
        element: <AssignTeacher />,
      },
      {
        path: "subjects",
        element: <Subjects />,
      },
    ],
  },
]);

export default router;
