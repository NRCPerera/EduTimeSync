import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Common/Home';
import Eventspage from './pages/LIC/Evetspage';
import NotifyPage from './pages/LIC/NotifyPage';
import Login from './pages/Common/SignIn';
import SignUp from './pages/Common/SignUp';
import StudentDashboard from './pages/Student/StudentDashBoard';
import AdminDashboard from './pages/Admin/AdminDashBoard';
import ExaminerDashboard from './pages/Examiner/ExaminerDashBoard';
import LICDashboard from './pages/LIC/LICDashBoard';
import ExaminerSchedule from './pages/Examiner/ExaminerSchedule';
import StudentSchedule from './pages/Student/StudentSchedule';
import RescheduleRequests from './pages/LIC/RescheduleRequests';
import FilterAvailabilityPage from './pages/LIC/FilterAvailabilityPage';
import EventsPage from './pages/LIC/Evetspage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path="/sign-in" element={<Login />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path='/event-page'element={<Eventspage/>} />
        <Route path='/notify-page'element={<NotifyPage/>} />
        <Route path='/student-dashboard' element={<StudentDashboard />} />
        <Route path='/admin-dashboard' element={<AdminDashboard />} />
        <Route path='/examiner-dashboard' element={<ExaminerDashboard />} />
        <Route path='/lic-dashboard' element={<LICDashboard />} />
        <Route path='/examiner-schedule' element={<ExaminerSchedule />} />
        <Route path='/student-schedule' element={<StudentSchedule />} />
        <Route path='/reschedule-requests' element={<RescheduleRequests />} />
        <Route path='/filter-availability' element={<FilterAvailabilityPage />} />
        <Route path='/events-page' element={<EventsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
