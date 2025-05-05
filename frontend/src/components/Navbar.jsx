import React, { useState, useEffect } from 'react';
import { GraduationCap as Graduation, Moon, Sun, Menu, X } from 'lucide-react';
import { useStudent } from '../context/StudentContext';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { studentData } = useStudent();

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    // In a real implementation, you would apply dark mode classes to the document
  };

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      scrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'
    }`}>
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center">
          <Graduation className="text-indigo-600 mr-2" size={24} />
          <span className="text-lg font-semibold">EduDashboard</span>
        </div>
        
        <div className="hidden md:flex items-center space-x-6">
          <button className="text-gray-600 hover:text-indigo-600 transition">Dashboard</button>
          <button className="text-gray-600 hover:text-indigo-600 transition">Schedule</button>
          <button className="text-gray-600 hover:text-indigo-600 transition">Courses</button>
          <button onClick={toggleDarkMode} className="text-gray-600 hover:text-indigo-600 transition">
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <div className="flex items-center">
            <img 
              src={studentData.student.profileImage} 
              alt="Profile" 
              className="w-8 h-8 rounded-full object-cover"
            />
          </div>
        </div>
        
        {/* Mobile menu button */}
        <button 
          className="md:hidden text-gray-600"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      
      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white shadow-lg mt-2 py-4 px-4 absolute w-full">
          <div className="flex flex-col space-y-4">
            <button className="text-gray-600 hover:text-indigo-600 transition py-2">Dashboard</button>
            <button className="text-gray-600 hover:text-indigo-600 transition py-2">Schedule</button>
            <button className="text-gray-600 hover:text-indigo-600 transition py-2">Courses</button>
            <button 
              onClick={toggleDarkMode} 
              className="text-gray-600 hover:text-indigo-600 transition py-2 flex items-center"
            >
              {darkMode ? <Sun size={20} className="mr-2" /> : <Moon size={20} className="mr-2" />}
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;