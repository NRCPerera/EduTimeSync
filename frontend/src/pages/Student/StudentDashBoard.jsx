/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Award, User, ChevronLeft, ChevronRight, Moon, Sun, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function StudentDashboard() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [timeLeft, setTimeLeft] = useState({});
  const [darkMode, setDarkMode] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [studentData, setStudentData] = useState({});
  const [presentations, setPresentations] = useState([]);
  const [evaluationResults, setEvaluationResults] = useState([]);
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [schedules, setSchedules] = useState([]);
  
  // Fetch student data
  const fetchStudentData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
  
      const response = await fetch('http://localhost:5000/api/users/me', {
        credentials: 'include',
        headers: {
          'x-auth-token': token
        }
      });
      
      const data = await response.json();
      console.log("API Response:", data); // Debug log
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch student data');
      }
  
      if (data.user) {
        setStudentData({
          _id: data.user.id, 
          name: data.user.name,
          nic: data.user.nic,
          email: data.user.email,
          address: data.user.address,
          phoneNumber: data.user.phoneNumber,
          role: data.user.role,
          profilePic: data.user.profilePic || null,
        });
      }
  
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPresentations = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(
        `http://localhost:5000/api/schedule/student?month=${currentMonth.getMonth() + 1}&year=${currentMonth.getFullYear()}`,
        {
          headers: {
            'x-auth-token': token,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSchedules(data.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch your schedules');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvaluations = async (studentId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !studentId) return;

      const response = await fetch(`http://localhost:5000/api/evaluations/studentgrades/${studentId}`, {
        credentials: 'include',
        headers: {
          'x-auth-token': token
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch evaluations');
      setEvaluationResults(data);
    } catch (err) {
      console.error('Evaluation fetch error:', err);
    }
  };

  // Initial data loading
  useEffect(() => {
    const loadData = async () => {
      const student = await fetchStudentData();
      await fetchPresentations();
      if (student?._id) {
        fetchEvaluations(student._id);
      }
    };
    loadData();
  }, []);

  // Calculate time remaining for next presentation
  useEffect(() => {
    if (!schedules || schedules.length === 0) {
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      return;
    }
  
    // Find the next upcoming presentation
    const now = new Date();
    const upcomingPresentations = schedules
      .filter(schedule => schedule.startTime && new Date(schedule.startTime) > now)
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
  
    // If no upcoming presentations, set timer to 0
    if (upcomingPresentations.length === 0) {
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      return;
    }
  
    // Use the closest upcoming presentation
    const nextPresentation = new Date(upcomingPresentations[0].startTime);
    
    // Initial calculation
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = nextPresentation - now;
      
      if (difference > 0) {
        // Calculate time units precisely
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        
        return { days, hours, minutes, seconds };
      } else {
        // Time has passed
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }
    };
  
    // Set initial time left
    setTimeLeft(calculateTimeLeft());
    
    // Update timer every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
      
      // Check if countdown has reached zero or passed
      const difference = nextPresentation - new Date();
      if (difference <= 0) {
        clearInterval(timer);
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [schedules]);
  
  // Track scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = (scrollTop / scrollHeight) * 100;
      setScrollProgress(progress);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Handle slide navigation
  const goToSlide = (index) => {
    setCurrentSlide(index);
  };
  
  const nextSlide = () => {
    if (schedules.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % schedules.length);
  };
  
  const prevSlide = () => {
    if (schedules.length === 0) return;
    setCurrentSlide((prev) => (prev - 1 + schedules.length) % schedules.length);
  };
  
  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleViewSchedule = () => {
    navigate('/student-schedule');
  };

 if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Error:</strong> {error}
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'} transition-colors duration-300`}>
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 h-1 bg-blue-500 z-50" style={{ width: `${scrollProgress}%` }}></div>
      
      {/* Navbar */}
      <nav className={`sticky top-0 z-40 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md px-4 py-3 flex justify-between items-center transition-colors duration-300`}>
        <div className="flex items-center">
          <BookOpen className="h-8 w-8" />
          <div className="ml-2">
            <div className="text-xl font-bold">EduTimeSync</div>
            <div className="text-xs text-emerald-200">Smarter Scheduling, Seamless Learning</div>
          </div>
        </div>
        
        <div className="flex space-x-4 items-center">
          {/* Mini Countdown when scrolled */}
          {schedules.length > 0 && (
            <div className={`hidden md:flex items-center space-x-2 ${scrollProgress > 20 ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}>
              <span className="text-sm font-medium">Next: </span>
              <span className="text-sm font-semibold text-blue-600">
                {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
              </span>
            </div>
          )}
          
          <button 
            onClick={toggleDarkMode}
            className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 text-yellow-400' : 'bg-gray-100 text-gray-700'}`}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          <button className={`px-4 py-2 rounded-md ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white transition-colors duration-300`}>
            Join Meeting
          </button>
        </div>
      </nav>
      
      {/* Hero Section with Countdown */}
      <section className={`min-h-screen flex items-center justify-center relative overflow-hidden ${darkMode ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900' : 'bg-gradient-to-br from-blue-50 via-blue-100 to-white'}`}>
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className={`absolute ${darkMode ? 'opacity-10' : 'opacity-5'} blur-3xl transform -translate-x-1/2 -translate-y-1/2`} style={{ top: '40%', left: '60%' }}>
            <div className="aspect-square w-96 bg-blue-500 rounded-full"></div>
          </div>
          <div className={`absolute ${darkMode ? 'opacity-10' : 'opacity-5'} blur-3xl transform -translate-x-1/2 -translate-y-1/2`} style={{ top: '60%', left: '30%' }}>
            <div className="aspect-square w-96 bg-purple-500 rounded-full"></div>
          </div>
        </div>
        
        <div className="text-center px-4 relative z-10">
          <h1 className={`text-4xl md:text-5xl font-bold mb-6 animate-fade-in ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Welcome, {studentData?.name || 'Student'}!
          </h1>
          
          {schedules.length > 0 ? (
            <div className="mb-8">
              <h2 className="text-xl mb-4 text-gray-500">Next Presentation Starts In:</h2>
              <div className="flex justify-center gap-4">
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg w-16 md:w-24`}>
                  <div className="text-2xl md:text-4xl font-bold text-blue-600">{timeLeft.days}</div>
                  <div className="text-xs uppercase text-gray-500">Days</div>
                </div>
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg w-16 md:w-24`}>
                  <div className="text-2xl md:text-4xl font-bold text-blue-600">{timeLeft.hours}</div>
                  <div className="text-xs uppercase text-gray-500">Hours</div>
                </div>
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg w-16 md:w-24`}>
                  <div className="text-2xl md:text-4xl font-bold text-blue-600">{timeLeft.minutes}</div>
                  <div className="text-xs uppercase text-gray-500">Minutes</div>
                </div>
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg w-16 md:w-24`}>
                  <div className="text-2xl md:text-4xl font-bold text-blue-600">{timeLeft.seconds}</div>
                  <div className="text-xs uppercase text-gray-500">Seconds</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-8">
              <h2 className="text-xl mb-4 text-gray-500">No upcoming presentations scheduled</h2>
            </div>
          )}
          
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-300 flex items-center gap-2">
              <Calendar size={20} /> Join Meeting
            </button>
            <button onClick={handleViewSchedule} className={`px-6 py-3 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-100'} rounded-lg transition-colors duration-300 flex items-center gap-2`}>
              <Clock size={20} /> View My Schedule
            </button>
          </div>
        </div>
      </section>
      
      {/* Upcoming Presentations (Slideshow) */}
      {schedules.length > 0 && (
        <section className={`py-16 px-4 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center flex items-center justify-center gap-3">
              <Calendar className="text-blue-500" size={28} />
              Upcoming Presentations
            </h2>
            
            <div className="relative overflow-hidden rounded-xl shadow-lg">
              {/* Slide Controls */}
              <button 
                onClick={prevSlide}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-30 hover:bg-opacity-50 text-white p-2 rounded-r-md"
              >
                <ChevronLeft size={24} />
              </button>
              
              <button 
                onClick={nextSlide}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-30 hover:bg-opacity-50 text-white p-2 rounded-l-md"
              >
                <ChevronRight size={24} />
              </button>
              
              {/* Slides */}
              <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                {schedules.map((presentation, index) => (
                  <div key={presentation._id} className="w-full flex-shrink-0 p-6 md:p-10">
                    <div className={`h-full ${darkMode ? 'bg-gray-700' : 'bg-blue-50'} rounded-xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 transition-all duration-300`}>
                      <div className="flex-shrink-0 w-16 h-16 md:w-24 md:h-24 flex items-center justify-center rounded-full bg-blue-100">
                        <Calendar className="text-blue-600" size={32} />
                      </div>
                      
                      <div className="flex-grow text-center md:text-left">
                        <h3 className="text-2xl font-bold mb-2">{presentation.module || 'Presentation'}</h3>
                        <p className="text-gray-500 mb-2">
                          <span className="font-medium">Date & Time:</span> {new Date(presentation.startTime).toLocaleString()}
                        </p>
                        <p className="text-gray-500 mb-4">
                          <span className="font-medium">Examiner:</span> {presentation.examinerId?.email || 'Not assigned'}
                        </p>
                        
                        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-300">
                          Join Meeting
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Slide Indicators */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {schedules.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-3 h-3 rounded-full transition-colors duration-300 ${currentSlide === index ? 'bg-blue-600' : 'bg-gray-300'}`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
      
      {/* Evaluation Results */}
      {evaluationResults.length > 0 && (
        <section className={`py-16 px-4 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center flex items-center justify-center gap-3">
              <Award className="text-blue-500" size={28} />
              My Evaluation Results
            </h2>
            
            {evaluationResults.every(result => result.grade.startsWith('A') || result.grade.startsWith('B+')) && (
              <div className={`mb-6 p-4 bg-green-100 border-l-4 border-green-500 text-green-700 rounded text-center`}>
                <span className="font-bold">Congratulations!</span> You've passed all your evaluations with excellent grades.
              </div>
            )}
            
            <div className="space-y-4">
              {evaluationResults.map((result, index) => (
                <div 
                  key={index}
                  className={`rounded-lg shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'} overflow-hidden transition-all duration-300 transform hover:translate-y-px hover:shadow-lg`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-semibold">{result.module?.name || 'Evaluation'}</h3>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        result.grade.startsWith('A') ? 'bg-green-100 text-green-800' :
                        result.grade.startsWith('B') ? 'bg-blue-100 text-blue-800' :
                        result.grade.startsWith('C') ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {result.grade}
                      </div>
                    </div>
                    
                    <div className="mt-4 flex items-center">
                      <div className="text-gray-500">Marks:</div>
                      <div className="ml-2 font-medium">{result.score}/100</div>
                      
                      <div className="ml-auto w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${result.score}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <p className={`mt-3 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      <span className="font-medium">Feedback:</span> {result.feedback || 'No feedback provided'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
      
      {/* Profile Section */}
      {studentData && (
        <section className={`py-16 px-4 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center flex items-center justify-center gap-3">
              <User className="text-blue-500" size={28} />
              My Profile
            </h2>
            
            <div className={`rounded-xl shadow-lg overflow-hidden ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
              <div className="p-8 flex flex-col md:flex-row items-center gap-8">
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md bg-gray-200 flex items-center justify-center">
                    {studentData.profilePic ? (
                      <img src={studentData.profilePic} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User size={48} className="text-gray-500" />
                    )}
                  </div>
                </div>
                
                <div className="flex-grow text-center md:text-left">
                  <h3 className="text-2xl font-bold mb-2">{studentData.name}</h3>
                  
                  <div className="space-y-2">
                    <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <span className="font-medium">Student Name:</span> {studentData.name}
                    </p>
                    <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <span className="font-medium">NIC No:</span> {studentData.nic}
                    </p>
                    <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <span className="font-medium">Email:</span> {studentData.email}
                    </p>
                    <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <span className="font-medium">Address:</span> {studentData.address}
                    </p>
                  </div>
                  
                  <button className={`mt-4 px-4 py-2 rounded-lg border ${darkMode ? 'border-gray-600 hover:bg-gray-600' : 'border-gray-300 hover:bg-gray-100'} transition-colors duration-300 flex items-center gap-2 mx-auto md:mx-0`}>
                    <User size={16} /> Edit Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
      
      {/* Footer */}
      <footer className={`py-8 ${darkMode ? 'bg-gray-900 text-gray-400' : 'bg-gray-100 text-gray-600'} text-center text-sm`}>
        <div className="max-w-6xl mx-auto px-4">
          <p>© 2025 EduTimeSync. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}