import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignIn from './pages/Common/SignIn';
import SignUp from './pages/Common/SignUp';
import Home from './pages/Common/Home';

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
      </Routes>
    </Router>
  );
}

export default App;
