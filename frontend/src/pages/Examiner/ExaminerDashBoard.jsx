import React, { useState, useEffect } from 'react';
import { Bell, Calendar, Users, BarChart3, MessageSquare, CalendarClock } from 'lucide-react';
import ExaminerHeader from '../../components/ExaminerComponents/ExaminerHeader';
import TodayAgenda from '../../components/ExaminerComponents/TodayAgenda';
import AvailabilityManager from '../../components/ExaminerComponents/AvailabilityManager';
import UpcomingEvents from '../../components/ExaminerComponents/UpcomingEvents';
import EvaluationZone from '../../components/ExaminerComponents/EvaluationZone';
import NotificationCenter from '../../components/ExaminerComponents/NotificationCenter';
import SmartInsights from '../../components/ExaminerComponents/SmartInsights';

function ExaminerDashBoard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showNotifications, setShowNotifications] = useState(false);
  const [examinerName, setExaminerName] = useState('Examiner');
  const [loading, setLoading] = useState(true);

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  // Debug activeTab changes
  const handleSetActiveTab = (tabId) => {
    console.log('Setting activeTab to:', tabId);
    setActiveTab(tabId);
  };

  // Fetch examiner name from backend
  useEffect(() => {
    const fetchExaminerName = async () => {
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
    <div className="flex h-screen bg-white">
      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <ExaminerHeader activeTab={activeTab} setActiveTab={handleSetActiveTab} />

        {/* Notification Dropdown */}
        {showNotifications && (
          <div className="absolute right-4 top-16 mt-2 w-80 bg-white rounded-lg shadow-xl py-2 z-50 ring-1 ring-black ring-opacity-5 max-h-96 overflow-y-auto">
            <NotificationCenter />
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Examiner Dashboard</h1>
                {activeTab === 'dashboard' && (
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
                )}
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
              {activeTab === 'insights' && (
                <div className="bg-white rounded-lg shadow-md p-4">
                  <div className="flex items-center mb-2">
                    <BarChart3 className="h-5 w-5 mr-2 text-indigo-500" />
                    <h2 className="text-lg font-semibold text-gray-800">Smart Insights</h2>
                  </div>
                  <SmartInsights />
                </div>
              )}
              {activeTab === 'settings' && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-lg font-semibold text-gray-800">Settings</h2>
                  <p className="mt-2 text-gray-600">Settings page is under development.</p>
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