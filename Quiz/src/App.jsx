import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ExamDetail from "./pages/ExamDetail";
import TestPage from "./pages/TestPage";
import Result from "./pages/Result";
import AdminRoute from "./components/AdminRoute";
import AdminDashboard from "./pages/AdminDashboard";
import AdminExams from "./pages/AdminExams";
import AdminQuestions from "./pages/AdminQuestions";
import AdminStudents from "./pages/AdminStudents";
import JobAlerts from "./pages/JobAlerts";
import AdminJobs from "./pages/AdminJobs";
import Exams from "./pages/Exams";
import MyResults from "./pages/MyResults";
function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/exams/:id" element={<ExamDetail />} />
        <Route path="/exams/:id/test" element={<TestPage />} />
        <Route path="/exams/:id/result" element={<Result />} />
        <Route path="/admin"element={ <AdminRoute> <AdminDashboard /> </AdminRoute>}/>
     <Route path="/admin/exams"element={<AdminRoute> <AdminExams /></AdminRoute> }/>
      <Route path="/admin/questions"element={<AdminRoute> <AdminQuestions /></AdminRoute> }/>
     <Route path="/admin/students"element={<AdminRoute> <AdminStudents /></AdminRoute>}/>
     <Route path="/jobs" element={<JobAlerts />} />
     <Route path="/admin/jobs"element={<AdminRoute> <AdminJobs /> </AdminRoute> }/>
     <Route path="/" element={<Home />} />
     <Route path="/exams" element={<Exams />} />
     <Route path="/my-results" element={<MyResults />} />
      </Routes>
    </>
  );
}

export default App;