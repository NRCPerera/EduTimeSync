import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LICHeader from '../../components/LICHeader';
import EventForm from '../../components/LicComponents/EventForm';
import EventList from '../../components/LicComponents/EventList';
import Notification from '../../components/LicComponents/Notification';
import LICNavbar from '../../components/LicComponents/LicNavbar';

const ScheduleEvent = () => {
  const [events, setEvents] = useState([]);
  const [examiners, setExaminers] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
    fetchExaminers();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/sign-in');
        throw new Error('Please login to continue.');
      }

      const response = await fetch('http://localhost:5000/api/event/get-events', {
        headers: {
          'x-auth-token': token,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        navigate('/sign-in');
        throw new Error('Session expired. Please login again.');
      }

      if (!response.ok) throw new Error('Failed to fetch events');

      const data = await response.json();
      setEvents(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchExaminers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/sign-in');
        throw new Error('Please login to continue.');
      }

      const response = await fetch('http://localhost:5000/api/event/get-examiners', {
        headers: {
          'x-auth-token': token,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        navigate('/sign-in');
        throw new Error('Session expired. Please login again.');
      }

      if (!response.ok) throw new Error('Failed to fetch examiners');

      const data = await response.json();
      setExaminers(data);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <LICNavbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8 mt-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-indigo-800 mb-2">Event Scheduler</h1>
            <p className="text-gray-600">Create and schedule your events efficiently</p>
          </div>

          <Notification error={error} success={success} />

          <div className="mb-8 text-center">
            <button
              onClick={() => setShowForm(!showForm)}
              className="py-3 px-8 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg flex items-center mx-auto"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {showForm ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                )}
              </svg>
              {showForm ? 'Cancel' : 'Create New Event'}
            </button>
          </div>

          {showForm && (
            <EventForm
              examiners={examiners}
              setSuccess={setSuccess}
              setError={setError}
              setLoading={setLoading}
              setShowForm={setShowForm}
              fetchEvents={fetchEvents}
              navigate={navigate}
            />
          )}

          <EventList
            events={events}
            loading={loading}
            setSuccess={setSuccess}
            setError={setError}
            setLoading={setLoading}
            fetchEvents={fetchEvents}
            navigate={navigate}
          />
        </div>
      </div>
    </div>
  );
};

export default ScheduleEvent;