import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignIn from './pages/Common/SignIn';
import SignUp from './pages/Common/SignUp';
import Home from './pages/Common/Home';
import StudentDashboard from './pages/Student/StudentDashBoard';
import AdminDashboard from './pages/Admin/AdminDashBoard';
import ExaminerDashboard from './pages/Examiner/ExaminerDashBoard';
import LICDashboard from './pages/LIC/LICDashBoard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path='/student-dashboard' element={<StudentDashboard />} />
        <Route path='/admin-dashboard' element={<AdminDashboard />} />
        <Route path='/examiner-dashboard' element={<ExaminerDashboard />} />
        <Route path='/lic-dashboard' element={<LICDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
