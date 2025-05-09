/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, isSameDay } from 'date-fns';
import LICNavbar from '../../components/LicComponents/LicNavbar';
import FullCalendar from '../../components/LicComponents/FullCalendar';
import dayGridPlugin from '@fullcalendar/daygrid';

// Examiner List Component
const ExaminerList = ({ examiners, onAssign }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Available Examiners</h2>
      <div className="space-y-3 max-h-[300px] overflow-y-auto">
        {examiners.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No examiners available</p>
        ) : (
          examiners.map((examiner, index) => (
            <div key={index} className="flex justifyshe justify-between items-center p-3 hover:bg-gray-100 rounded-lg">
              <div>
                <p className="font-medium">{examiner.name}</p>
                <p className="text-sm text-gray-800">{examiner.email}</p>
              </div>
              <button
                onClick={() => onAssign(examiner._id)}
                className="px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200"
              >
                Assign
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Notification Center Component
const NotificationCenter = ({ notifications }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Recent Notifications</h2>
      <div className="space-y-3 max-h-[300px] overflow-y-auto">
        {notifications.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No new notifications</p>
        ) : (
          notifications.map((notification, index) => (
            <div key={index} className="p-3 hover:bg-gray-50 rounded-lg border-l-4 border-blue-500">
              <p className="font-medium">{notification.title}</p>
              <p className="text-sm text-gray-500">{notification.time}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Enhanced Stat Card Component with better visual indicators
const StatCard = ({ title, value, icon, trend }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className="text-2xl bg-gray-100 h-10 w-10 rounded-full flex items-center justify-center">
          {icon}
        </div>
      </div>
      <div className={`mt-4 text-sm flex items-center ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
        <span className="mr-1">{trend >= 0 ? '↑' : '↓'}</span>
        <span className="font-medium">{Math.abs(trend)}%</span>
        <span className="ml-1 text-gray-500">from last month</span>
      </div>
    </div>
  );
};

const LICDashBoard = () => {
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [examiners, setExaminers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState([]);
  const [modules, setModules] = useState([]);
  const [error, setError] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  // Fetch user data
  const fetchUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please sign in.');
      }

      const response = await fetch('http://localhost:5000/api/users/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Authentication failed (Status: ${response.status})`);
      }

      if (data.user?.role !== 'LIC') {
        throw new Error(`Access restricted: Role is ${data.user?.role || 'unknown'}, expected LIC`);
      }

      setUser(data.user);
      setAuthError('');
    } catch (err) {
      console.error('Fetch user error:', err.message);
      setAuthError(err.message);

      if (err.message.includes('not valid') || err.message.includes('expired')) {
        localStorage.removeItem('token');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch events and format for FullCalendar
  const fetchEvents = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token for events fetch');

      const response = await fetch('http://localhost:5000/api/event/get-events', {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to fetch events (Status: ${response.status})`);
      }

      const data = await response.json();
      const currentDate = new Date();

      // Filter events relevant to the current user
      const userEvents = data.filter(event =>
        event.createdBy === user?._id || (event.examinerIds && event.examinerIds.some(examiner => examiner._id === user?._id))
      );

      // Format events for FullCalendar
      const formattedEvents = userEvents.map(event => ({
        title: event.title,
        start: event.startDate,
        end: event.endDate,
        backgroundColor: event.status === 'pending' ? '#FEF9C3' : new Date(event.startDate) >= currentDate ? '#E5F6FD' : '#FFFFFF',
        extendedProps: {
          status: event.status,
          module: event.module,
        },
      }));

      setEvents(formattedEvents);
    } catch (err) {
      setError(`Events error: ${err.message}`);
    }
  }, [user]);

  // Fetch examiners
  const fetchExaminers = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token for examiners fetch');

      const response = await fetch('http://localhost:5000/api/event/get-examiners', {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to fetch examiners (Status: ${response.status})`);
      }

      const data = await response.json();
      setExaminers(data || []);
    } catch (err) {
      setError(`Examiners error: ${err.message}`);
    }
  }, []);

  // Fetch reschedule requests (notifications)
  const fetchNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token for notifications fetch');

      const response = await fetch(`http://localhost:5000/api/rescheduleRequest/all`, {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to fetch notifications (Status: ${response.status})`);
      }

      const data = await response.json();

      setNotifications(
        data.data
          ? data.data.map(req => ({
              title: `Reschedule request for ${req.scheduleId?.module || 'exam'} by ${req.examinerId?.name || 'Examiner'}`,
              time: req.createdAt ? format(new Date(req.createdAt), 'PPP p') : 'Unknown time',
              id: req._id,
            }))
          : []
      );
    } catch (err) {
      setError(`Notifications error: ${err.message}`);
    }
  }, []);

  // Fetch modules
  const fetchModules = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token for modules fetch');

      const response = await fetch(`http://localhost:5000/api/module/all`, {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to fetch modules (Status: ${response.status})`);
      }

      const data = await response.json();
      setModules(data.data || []);
    } catch (err) {
      setError(`Modules error: ${err.message}`);
    }
  }, []);

  // Initial authentication with retry
  useEffect(() => {
    let mounted = true;
    let retryCount = 0;
    const maxRetries = 3;

    const init = async () => {
      if (!user && mounted) {
        while (mounted && retryCount < maxRetries) {
          try {
            await fetchUser();
            if (user) break;

            retryCount++;
            console.log(`Retry ${retryCount}/${maxRetries} for authentication`);
            await new Promise(resolve => setTimeout(resolve, 1000));
          } catch (err) {
            console.error('Retry error:', err.message);
            if (retryCount >= maxRetries - 1) {
              setAuthError('Failed to authenticate after multiple attempts. Please sign in again.');
              break;
            }
          }
        }
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, [fetchUser, authError, user]);

  // Fetch data after user is authenticated
  useEffect(() => {
    if (user) {
      Promise.all([fetchEvents(), fetchExaminers(), fetchNotifications(), fetchModules()]).catch(err => {
        console.error('Error fetching dashboard data:', err);
      });
    }
  }, [user, fetchEvents, fetchExaminers, fetchNotifications, fetchModules]);

  // Update statistics based on fetched data
  useEffect(() => {
    const currentDate = new Date();
    const lastMonthDate = new Date();
    lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);

    const upcomingEventsCount = events.filter(event => new Date(event.start) >= currentDate).length;
    const activeExaminers = examiners.length;
    const pendingReviews = notifications.length;
    const completedEvents = events.filter(event => event.extendedProps.status === 'completed').length;
    const successRate = events.length ? Math.round((completedEvents / events.length) * 100) : 0;

    setStats([
      { title: 'Upcoming Events', value: upcomingEventsCount, icon: '📅', trend: 5 },
      { title: 'Active Examiners', value: activeExaminers, icon: '👥', trend: 10 },
      { title: 'Pending Reviews', value: pendingReviews, icon: '📝', trend: pendingReviews > 3 ? -5 : 0 },
      { title: 'Success Rate', value: `${successRate}%`, icon: '⭐', trend: 2 },
    ]);
  }, [events, examiners, notifications]);

  // Handle examiner assignment
  const handleAssignExaminer = async (examinerId) => {
    setError('Please select an event before assigning an examiner.');
  };


  // Handle authentication failure
  if (!loading && authError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center space-y-4 p-8 bg-white rounded-xl shadow-lg">
          <h2 className="text-xl font-bold text-red-600">Authentication Error</h2>
          <p className="text-gray-800">{authError}</p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => {
                setLoading(true);
                setAuthError('');
                fetchUser();
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Retry
            </button>
            <a
              href="/sign-in"
              onClick={() => localStorage.removeItem('token')}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Sign In Again
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
<div className="bg-gray-100 min-h-screen">
      <LICNavbar />
      <div className="p-8">
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-8 mt-20">
              <div>
                <h1 className="text-2xl font-bold  text-gray-800">Welcome, {user?.name || 'LIC'}</h1>
                <p className="text-gray-500">Lead Instructor Coordinator</p>
              </div>
              <div className="flex space-x-4">
              </div>
            </div>

            {error && (
              <div className="mb-8 p-4 bg-red-100 text-red-700 rounded-lg flex justify-between items-center">
                {error}
                <button onClick={() => setError('')} className="text-sm underline">
                  Dismiss
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => (
                <StatCard key={index} {...stat} />
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Event Calendar</h2>
                <FullCalendar
                  plugins={[dayGridPlugin]}
                  initialView="dayGridMonth"
                  events={events}
                  height="auto"
                />
              </div>

              <div className="space-y-8">
                <ExaminerList examiners={examiners} onAssign={handleAssignExaminer} />
                <NotificationCenter notifications={notifications} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LICDashBoard;