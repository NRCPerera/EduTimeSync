import React, { useState, useEffect } from 'react';
import { GraduationCap, Bell, UserCircle, Home, Calendar, Users, BarChart3, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function ExaminerHeader({ activeTab, setActiveTab }) {
  const navigate = useNavigate();
  const [examinerName, setExaminerName] = useState('Examiner');
  const [email, setEmail] = useState('N/A');
  const [loading, setLoading] = useState(true);

  // Fetch examiner profile from backend
  useEffect(() => {
    const fetchExaminerProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }
        const response = await fetch('http://localhost:5000/api/users/me', {
          headers: {
            'x-auth-token': token,
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch examiner profile');
        }
        const data = await response.json();
        console.log('Fetched user data:', data); // Debug log
        setExaminerName(data.user?.name || 'Examiner');
        setEmail(data.user?.email || 'N/A');
      } catch (error) {
        console.error('Error fetching examiner profile:', error);
        setExaminerName('Examiner');
        setEmail('N/A');
      } finally {
        setLoading(false);
      }
    };
    fetchExaminerProfile();
  }, []);

  const navItems = [
    { id: 'dashboard', name: 'Dashboard' },
    { id: 'availability', name: 'Availability' },
    { id: 'evaluation', name: 'Evaluation'},
    { id: 'insights', name: 'Insights' },
    { id: 'settings', name: 'Settings' },
  ];

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <span className="font-bold text-xl ml-15">EduTimeSync</span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center transition-colors ${
                  activeTab === item.id
                    ? 'text-blue-600 font-bold'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                <span className="font-medium">{item.name}</span>
              </button>
            ))}
            <button
              onClick={() => navigate('/sign-in')}
              className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
            >
              
              <span className="font-medium">Sign Out</span>
            </button>
          </nav>

          {/* Right Section (Notifications & User Profile) */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Bell className="h-5 w-5 text-gray-600 hover:text-blue-600 cursor-pointer" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                3
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <UserCircle className="h-8 w-8 text-gray-600" />
              <div className="hidden md:block">
                <p className="text-sm font-medium">{loading ? 'Loading...' : examinerName}</p>
                <p className="text-xs text-gray-500">{loading ? 'N/A' : email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default ExaminerHeader;