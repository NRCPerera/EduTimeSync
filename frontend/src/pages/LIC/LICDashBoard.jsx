import React, { useState, useEffect, useCallback } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths } from 'date-fns';
import LICHeader from '../../components/LICHeader';
import EventForm from '../../pages/LIC/ScheduleEvent'; 

const API_URL = 'http://localhost:5000/api';

// Calendar Day Component
const CalendarDay = ({ date, events, isToday }) => {
  const dayEvents = events.filter(event => {
    try {
      const eventDate = new Date(event.startDate);
      return format(eventDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
    } catch {
      return false;
    }
  });

  return (
    <div 
      className={`min-h-[80px] p-2 border border-gray-200 ${
        isToday ? 'bg-blue-50 border-blue-300' : 'bg-white'
      }`}
    >
      <div className="font-medium text-sm text-right mb-1">
        {format(date, 'd')}
      </div>
      <div className="space-y-1">
        {dayEvents.map((event, i) => (
          <div 
            key={i}
            style={{ backgroundColor: event.color }}
            className="text-xs p-1 rounded truncate cursor-pointer hover:opacity-80"
            title={`${event.title} - ${event.module || 'No module'}`}
          >
            {event.title}
          </div>
        ))}
      </div>
    </div>
  );
};

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
            <div key={index} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">{examiner.name}</p>
                <p className="text-sm text-gray-500">{examiner.email}</p>
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
      
      const headers = {
        'Content-Type': 'application/json',
        'x-auth-token': token
      };
      
      const response = await fetch(`${API_URL}/users/me`, {
        method: 'GET',
        headers,
        credentials: 'include'
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

  // Fetch events
  const fetchEvents = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token for events fetch');
      
      const response = await fetch(`${API_URL}/event/get-events`, {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to fetch events (Status: ${response.status})`);
      }
      
      const data = await response.json();
      setEvents(data.map(event => ({
        ...event,
        color: event.status === 'pending' ? '#FDE7E8' : 
               event.status === 'confirmed' ? '#E5F6FD' : 
               event.status === 'completed' ? '#E3F7E8' : '#F9F0FF'
      })));
    } catch (err) {
      setError(`Events error: ${err.message}`);
    }
  }, []);

  // Fetch examiners
  const fetchExaminers = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token for examiners fetch');
      
      const response = await fetch(`${API_URL}/event/get-examiners`, {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        }
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
      
      const response = await fetch(`${API_URL}/rescheduleRequest/all`, {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to fetch notifications (Status: ${response.status})`);
      }
      
      const data = await response.json();
      
      // Transform the reschedule requests into notification format
      setNotifications(data.data ? data.data.map(req => ({
        title: `Reschedule request for ${req.scheduleId?.module || 'exam'} by ${req.examinerId?.name || 'Examiner'}`,
        time: req.createdAt ? format(new Date(req.createdAt), 'PPP p') : 'Unknown time',
        id: req._id
      })) : []);
    } catch (err) {
      setError(`Notifications error: ${err.message}`);
    }
  }, []);

  // Fetch modules
  const fetchModules = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token for modules fetch');
      
      const response = await fetch(`${API_URL}/module/all`, {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        }
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
      // Fetch all data in parallel to improve loading time
      Promise.all([
        fetchEvents(),
        fetchExaminers(),
        fetchNotifications(),
        fetchModules()
      ]).catch(err => {
        console.error('Error fetching dashboard data:', err);
      });
    }
  }, [user, fetchEvents, fetchExaminers, fetchNotifications, fetchModules]);

  // Update statistics based on fetched data
  useEffect(() => {
    const currentDate = new Date();
    const lastMonthDate = new Date();
    lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
    
    // Calculate upcoming events (events in the future)
    const upcomingEvents = events.filter(event => {
      try {
        return new Date(event.startDate) >= currentDate;
      } catch {
        return false;
      }
    }).length;
    
    // Count active examiners
    const activeExaminers = examiners.length;
    
    // Count pending reviews (notifications/reschedule requests)
    const pendingReviews = notifications.length;
    
    // Calculate success rate (completed events / total events)
    const completedEvents = events.filter(e => e.status === 'completed').length;
    const successRate = events.length ? Math.round((completedEvents / events.length) * 100) : 0;
    
    // For trends, we would ideally calculate the difference from the previous month
    // But since we don't have historical data, we'll use placeholder values
    // In a real application, you would fetch historical data or calculate trends properly
    
    setStats([
      { title: 'Upcoming Events', value: upcomingEvents, icon: '📅', trend: 5 },
      { title: 'Active Examiners', value: activeExaminers, icon: '👥', trend: 10 },
      { title: 'Pending Reviews', value: pendingReviews, icon: '📝', trend: pendingReviews > 3 ? -5 : 0 },
      { title: 'Success Rate', value: `${successRate}%`, icon: '⭐', trend: 2 },
    ]);
  }, [events, examiners, notifications]);

  // Handle examiner assignment
  const handleAssignExaminer = async (examinerId) => {
    // This would typically involve selecting an event and then assigning the examiner
    // Since the UI doesn't currently support selecting an event, we'll show an error message
    setError('Please select an event before assigning an examiner.');
  };

  // Month navigation for calendar
  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  // Generate calendar days for current month
  const start = startOfMonth(currentMonth);
  const end = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start, end });

  // Handle event creation success
  const handleEventCreated = () => {
    fetchEvents();
    setIsEventFormOpen(false);
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
      <LICHeader />
      <div className="p-8">
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Welcome, {user?.name || 'LIC'}</h1>
                <p className="text-gray-500">Lead Instructor Coordinator</p>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={() => setIsEventFormOpen(true)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  + Create New Event
                </button>
                <button
                  onClick={() => {
                    localStorage.removeItem('token');
                    window.location.href = '/sign-in';
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-8 p-4 bg-red-100 text-red-700 rounded-lg flex justify-between items-center">
                {error}
                <button
                  onClick={() => setError('')}
                  className="text-sm underline"
                >
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
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Event Calendar</h2>
                  <div className="flex space-x-2">
                    <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 rounded">◀</button>
                    <span className="p-2 font-medium">{format(currentMonth, 'MMMM yyyy')}</span>
                    <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 rounded">▶</button>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                      {day}
                    </div>
                  ))}
                  {days.map((day, index) => (
                    <CalendarDay
                      key={index}
                      date={day}
                      events={events}
                      isToday={format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-8">
                <ExaminerList examiners={examiners} onAssign={handleAssignExaminer} />
                <NotificationCenter notifications={notifications} />
              </div>
            </div>
          </>
        )}
      </div>

      <EventForm
        isOpen={isEventFormOpen}
        onClose={() => setIsEventFormOpen(false)}
        onEventCreated={handleEventCreated}
        modules={modules}
        examiners={examiners}
      />
    </div>
  );
};

export default LICDashBoard;