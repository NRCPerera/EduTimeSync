import React, { useState, useEffect } from 'react';
import { Menu, Bell, Calendar, Users, BarChart3, MessageSquare, LogOut, X, CalendarClock } from 'lucide-react';
import Sidebar from '../../components/ExaminerComponents/Sidebar';
import TodayAgenda from '../../components/ExaminerComponents/TodayAgenda';
import AvailabilityManager from '../../components/ExaminerComponents/AvailabilityManager';
import UpcomingEvents from '../../components/ExaminerComponents/UpcomingEvents';
import EvaluationZone from '../../components/ExaminerComponents/EvaluationZone';
import NotificationCenter from '../../components/ExaminerComponents/NotificationCenter';
import SmartInsights from '../../components/ExaminerComponents/SmartInsights';

function ExaminerDashBoard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showNotifications, setShowNotifications] = useState(false);
  const [examinerName, setExaminerName] = useState('Examiner');
  const [loading, setLoading] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  // Fetch examiner name from backend
  useEffect(() => {
    const fetchExaminerName = async () => {
      try {
        const token = localStorage.getItem('authToken');
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
        setExaminerName(data.name || 'Examiner');
      } catch (error) {
        console.error('Error fetching examiner name:', error);
        setExaminerName('Examiner');
      } finally {
        setLoading(false);
      }
    };
    fetchExaminerName();
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 flex flex-col flex-shrink-0 w-64 bg-indigo-800 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-200 ease-in-out z-40`}>
        <div className="absolute top-0 right-0 -mr-12 pt-2 lg:hidden">
          <button onClick={toggleSidebar}>
            <X className="h-6 w-6 text-white" />
          </button>
        </div>
        <div className="flex-1 flex flex-col overflow-y-auto">
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 z-30 lg:hidden" onClick={toggleSidebar}></div>
      )}

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-gradient-to-r from-indigo-600 to-indigo-800 text-white shadow-lg">
          <button
            className="px-4 border-r border-indigo-300 text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-400"
            onClick={toggleSidebar}
          >
            <span className="sr-only">{sidebarOpen ? 'Close sidebar' : 'Open sidebar'}</span>
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex">
              <h1 className="text-xl font-bold self-center">EduTimeSync</h1>
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              <div className="relative">
                <button
                  className="p-1 rounded-full text-white hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  onClick={toggleNotifications}
                >
                  <span className="sr-only">View notifications</span>
                  <Bell className="h-6 w-6" />
                </button>
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl py-2 z-50 ring-1 ring-black ring-opacity-5 max-h-96 overflow-y-auto">
                    <NotificationCenter />
                  </div>
                )}
              </div>
              <div className="ml-3 relative">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-indigo-400 flex items-center justify-center text-white font-medium">
                    {loading ? 'E' : examinerName.split(" ").map(name => name[0]).join("")}
                  </div>
                  <span className="ml-2 text-sm font-medium text-white hidden md:block">
                    {loading ? 'Loading...' : examinerName}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <main className={`flex-1 relative overflow-y-auto focus:outline-none ${sidebarOpen ? 'lg:ml-64' : ''}`}>
          <div className="py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Examiner Dashboard</h1>
                <div className="flex flex-col space-y-4">
                  <div className="w-full">
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <div className="flex items-center mb-4">
                        <Calendar className="h-5 w-5 mr-2 text-indigo-500" />
                        <h2 className="text-lg font-semibold text-gray-800">Today's Agenda</h2>
                      </div>
                      <TodayAgenda />
                    </div>
                  </div>
                  <div className="w-full">
                    <div className="bg-white rounded-lg shadow-md p-4">
                      <div className="flex items-center mb-2">
                        <BarChart3 className="h-5 w-5 mr-2 text-indigo-500" />
                        <h2 className="text-lg font-semibold text-gray-800">Smart Insights</h2>
                      </div>
                      <SmartInsights />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {activeTab === 'dashboard' && (
                <div className="grid grid-cols-1 gap-6">
                  <div className="col-span-full">
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <div className="flex items-center mb-4">
                        <CalendarClock className="h-5 w-5 mr-2 text-indigo-500" />
                        <h2 className="text-lg font-semibold text-gray-800">Upcoming Events</h2>
                      </div>
                      <UpcomingEvents />
                    </div>
                  </div>
                </div>
              )}
              {activeTab === 'availability' && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <AvailabilityManager />
                </div>
              )}
              {activeTab === 'evaluation' && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <EvaluationZone />
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default ExaminerDashBoard;