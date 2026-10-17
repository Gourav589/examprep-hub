import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ExamDetail from "./pages/ExamDetail";
import TestPage from "./pages/TestPage";
import Result from "./pages/Result";

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
      </Routes>
    </>
  );
}

export default App;