import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ReactDOM from 'react-dom/client';
import Home from './pages/Common/Home';
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
import ExaminerAvailability from './pages/Examiner/ExaminerAvailability';
import AssignEvents from './pages/Examiner/AssignEvents';
import StdEvalutation from './pages/Examiner/StdEvalutation';

const ProtectedRoute = ({ element, allowedRoles }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/sign-in" />;

  const decoded = JSON.parse(atob(token.split('.')[1])); // Decode JWT payload
  const userRole = decoded.role;

  return allowedRoles.includes(userRole) ? element : <Navigate to="/" />;
};


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sign-in" element={<Login />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route
          path="/student-dashboard"
          element={<ProtectedRoute element={<StudentDashboard />} allowedRoles={['Student']} />}
        />
        <Route
          path="/admin-dashboard"
          element={<ProtectedRoute element={<AdminDashboard />} allowedRoles={['Admin']} />}
        />
        <Route
          path="/examiner-dashboard"
          element={<ProtectedRoute element={<ExaminerDashboard />} allowedRoles={['Examiner']} />}
        />
        <Route
          path="/lic-dashboard"
          element={<ProtectedRoute element={<LICDashboard />} allowedRoles={['LIC']} />}
        />
        <Route
          path="/examiner-schedule"
          element={<ProtectedRoute element={<ExaminerSchedule />} allowedRoles={['Examiner']} />}
        />
        <Route
          path="/student-schedule"
          element={<ProtectedRoute element={<StudentSchedule />} allowedRoles={['Student']} />}
        />
        <Route
          path="/reschedule-requests"
          element={<ProtectedRoute element={<RescheduleRequests />} allowedRoles={['LIC']} />}
        />
        <Route
          path="/filter-availability"
          element={<ProtectedRoute element={<FilterAvailabilityPage />} allowedRoles={['LIC']} />}
        />
        <Route
          path="/notify-page" 
          element={<ProtectedRoute element={<NotifyPage />} allowedRoles={['LIC']} />} 
        />
        <Route
          path="/event-page"
          element={<ProtectedRoute element={<EventsPage />} allowedRoles={['LIC']} />}
        />
        <Route
          path="/examiner-availability"
          element={<ProtectedRoute element={<ExaminerAvailability />} allowedRoles={['Examiner']} />}
        />
        <Route
          path='/assign-events'
          element={<ProtectedRoute element={<AssignEvents />} allowedRoles={['Examiner']} />}
        />
        <Route
        path='/std-evalutation-marks'
        element={<ProtectedRoute element={<StdEvalutation />} allowedRoles={['Examiner']} />}
        />
      </Routes>
    </Router>
  );
}


export default App;