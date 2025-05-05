import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Add for redirection

const ScheduleEvent = () => {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    duration: '',
    module: '',
    examinerIds: [],
  });
  const [examiners, setExaminers] = useState([]);
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

  const handleSchedule = async (eventId) => {
    setError(null);
    setSuccess(null);
    setLoading(true);
  
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/sign-in');
        throw new Error('Please login to continue.');
      }
  
      // Add error handling for response
      const response = await fetch(`http://localhost:5000/api/schedule/add/${eventId}`, {
        method: 'POST',
        headers: {
          'x-auth-token': token,
          'Content-Type': 'application/json',
        },
      });
  
      console.log('Response status:', response.status);
  
      if (response.status === 401) {
        localStorage.removeItem('token');
        navigate('/sign-in');
        throw new Error('Session expired. Please login again.');
      }
  
      // Parse JSON response regardless of status code
      const responseData = await response.json();
      
      if (!response.ok) {
        // Use the error message from the server if available
        const errorMessage = responseData.message || 'Failed to schedule event';
        throw new Error(errorMessage);
      }
  
      // Success case
      setSuccess(`Event scheduled successfully with ${responseData.schedules?.length || 0} schedules!`);
      fetchEvents(); clear 
    } catch (err) {
      console.error('Schedule error:', err);
      setError(err.message || 'An unexpected error occurred while scheduling');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleExaminerChange = (e) => {
    const selectedIds = Array.from(e.target.selectedOptions, option => option.value);
    setFormData({ ...formData, examinerIds: selectedIds });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/sign-in');
        throw new Error('Please login to continue.');
      }

      const response = await fetch('http://localhost:5000/api/event/set-events', {
        method: 'POST',
        headers: {
          'x-auth-token': token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          startDate: new Date(formData.startDate).toISOString(),
          endDate: new Date(formData.endDate).toISOString(),
          duration: parseInt(formData.duration, 10),
        }),
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        navigate('/sign-in');
        throw new Error('Session expired. Please login again.');
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create event');
      }

      setSuccess('Event created successfully!');
      setFormData({ name: '', startDate: '', endDate: '', duration: '', module: '', examinerIds: [] });
      setShowForm(false);
      fetchEvents();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-indigo-800 mb-2">Event Scheduler</h1>
          <p className="text-gray-600">Create and schedule your events efficiently</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-md flex items-center">
            <div className=" text-red-500 mr-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-md flex items-center">
            <div className="text-green-500 mr-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-green-700">{success}</p>
          </div>
        )}

        {/* Add New Event Button */}
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

        {/* Event Creation Form */}
        {showForm && (
          <div className="bg-white p-8 rounded-xl shadow-lg mb-8 border border-indigo-100">
            <h2 className="text-2xl font-semibold mb-6 text-indigo-800">
              Create New Event
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Event Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition-all"
                    required
                    placeholder="Enter event name"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Module
                  </label>
                  <input
                    type="text"
                    name="module"
                    value={formData.module}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition-all"
                    required
                    placeholder="Enter module name"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Start Date
                  </label>
                  <input
                    type="datetime-local"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    End Date
                  </label>
                  <input
                    type="datetime-local"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition-all"
                    min="1"
                    required
                    placeholder="Enter duration in minutes"
                  />
                </div>
                {/* <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Examiners
                  </label>
                  <select
                    multiple
                    name="examinerIds"
                    value={formData.examinerIds}
                    onChange={handleExaminerChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition-all"
                    required
                    size="4"
                  >
                    {examiners.map((examiner) => (
                      <option key={examiner._id} value={examiner._id}>
                        {examiner.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-gray-500 text-sm mt-1">
                    Hold Ctrl (or Cmd) to select multiple examiners
                  </p>
                </div> */}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center mt-8"
              >
                {loading ? (
                  <svg
                    className="animate-spin h-5 w-5 mr-2"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                )}
                {loading ? 'Creating...' : 'Create Event'}
              </button>
            </form>
          </div>
        )}

        {/* Event List */}
        {loading && !showForm ? (
          <div className="flex justify-center my-12">
            <svg
              className="animate-spin h-10 w-10 text-indigo-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.length === 0 ? (
              <div className="col-span-2 bg-white p-8 rounded-xl shadow-md text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 mx-auto text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <h3 className="text-xl font-medium mt-4 text-gray-600">
                  No events available
                </h3>
                <p className="text-gray-500 mt-2">
                  Create your first event to get started
                </p>
              </div>
            ) : (
              events.map((event) => (
                <div
                  key={event._id}
                  className="bg-white overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-all border border-indigo-50"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h2 className="text-xl font-semibold text-indigo-800">
                        {event.name}
                      </h2>
                      <span
                        className={`text-xs font-medium py-1 px-3 rounded-full ${
                          event.scheduleIds.length > 0
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {event.scheduleIds.length > 0 ? 'Scheduled' : 'Pending'}
                      </span>
                    </div>

                    <div className="space-y-2 mb-6">
                      <div className="flex items-center text-gray-600">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                          />
                        </svg>
                        <span>Module: {event.module}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span>Duration: {event.duration} minutes</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span>Start: {formatDate(event.startDate)}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span>End: {formatDate(event.endDate)}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                          />
                        </svg>
                        <span>Schedules: {event.scheduleIds.length}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleSchedule(event._id)}
                      disabled={event.scheduleIds.length > 0 || loading}
                      className={`w-full py-2 px-4 rounded-lg text-white font-medium flex items-center justify-center transition-all ${
                        event.scheduleIds.length > 0
                          ? 'bg-gray-300 cursor-not-allowed'
                          : loading
                          ? 'bg-indigo-400 cursor-wait'
                          : 'bg-indigo-600 hover:bg-indigo-700'
                      }`}
                    >
                      {loading ? (
                        <>
                          <svg
                            className="animate-spin h-5 w-5 mr-2"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Processing...
                        </>
                      ) : event.scheduleIds.length > 0 ? (
                        <>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          Scheduled
                        </>
                      ) : (
                        <>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Schedule Now
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleEvent;