import React, { useState, useEffect } from 'react';
import { Menu, Bell, User, LogOut, Settings, ChevronDown, BookOpen, Calendar, Home, LayoutDashboard, Video, Moon, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AppHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

  // Apply dark mode class to root element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/sign-in');
  };

  return (
    <header className="bg-blue-600 dark:bg-gray-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo & Brand */}
          <div className="flex items-center">
            <BookOpen className="h-8 w-8" />
            <div className="ml-2">
              <div className="text-xl font-bold">EduTimeSync</div>
              <div className="text-xs text-blue-200 dark:text-blue-300">Smarter Scheduling, Seamless Learning</div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <button onClick={() => navigate('/')} className="hover:text-blue-200 dark:hover:text-blue-300 flex items-center gap-1">
              <Home className="h-4 w-4" />
              Home
            </button>
            <button onClick={() => navigate('/student-dashboard')} className="hover:text-blue-200 dark:hover:text-blue-300 flex items-center gap-1">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </button>
            <button onClick={() => navigate('/student-schedule')} className="hover:text-blue-200 dark:hover:text-blue-300 flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Schedule
            </button>
            <button className="hover:text-blue-200 dark:hover:text-blue-300 flex items-center gap-1">
              <Video className="h-4 w-4" />
              Meetings
            </button>
          </nav>

          {/* User Menu & Notifications */}
          <div className="flex items-center space-x-4">
            <button 
              onClick={toggleDarkMode}
              className="hover:text-blue-200 dark:hover:text-blue-300 p-1 rounded-full"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            
            <button className="hover:text-blue-200 dark:hover:text-blue-300 relative">
              <Bell className="h-6 w-6" />
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 hover:text-blue-200 dark:hover:text-blue-300"
              >
                <div className="h-8 w-8 rounded-full bg-blue-500 dark:bg-blue-600 flex items-center justify-center">
                  <User className="h-5 w-5" />
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg py-1 text-gray-700 dark:text-gray-200 z-50">
                  <button className="w-full text-left px-4 py-2 hover:bg-blue-50 dark:hover:bg-gray-600 flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Settings
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 hover:bg-blue-50 dark:hover:bg-gray-600 flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden hover:text-blue-200 dark:hover:text-blue-300"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-2">
            <button 
              onClick={() => {
                navigate('/');
                setIsMenuOpen(false);
              }}
              className="block w-full text-left py-2 hover:text-blue-200 dark:hover:text-blue-300"
            >
              Home
            </button>
            <button 
              onClick={() => {
                navigate('/student-dashboard');
                setIsMenuOpen(false);
              }}
              className="block w-full text-left py-2 hover:text-blue-200 dark:hover:text-blue-300"
            >
              Dashboard
            </button>
            <button 
              onClick={() => {
                navigate('/student-schedule');
                setIsMenuOpen(false);
              }}
              className="block w-full text-left py-2 hover:text-blue-200 dark:hover:text-blue-300"
            >
              Schedule
            </button>
            <button 
              className="block w-full text-left py-2 hover:text-blue-200 dark:hover:text-blue-300"
            >
              Meetings
            </button>
          </div>
        )}
      </div>
    </header>
  );
}