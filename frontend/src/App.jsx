import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignIn from './pages/Common/SignIn';
import SignUp from './pages/Common/SignUp';
import Home from './pages/Common/Home';
import Eventspage from './pages/LIC_pages/Evetspage';
import NotifyPage from './pages/LIC_pages/NotifyPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path='/Event-page'element={<Eventspage/>} />
        <Route path='/notify-page'element={<NotifyPage/>} />
      </Routes>
    </Router>
  );
}

export default App;
