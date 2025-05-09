import { useState } from 'react';
import PropTypes from 'prop-types';

const EventCard = ({ event, setSuccess, setError, fetchEvents, navigate, handleGenerateEventReport }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const safeDate = (dateString) => {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 16);
  };
  const [formData, setFormData] = useState({
    name: event.name,
    startDate: safeDate(event.startDate),
    endDate: safeDate(event.endDate),
    duration: event.duration,
    module: event.module,
    examinerIds: event.examinerIds.map(e => e._id),
  });

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

      const examinerIdsArray = event.examinerIds.map(examiner => {
        if (typeof examiner === 'object' && examiner !== null) {
          return examiner._id || examiner.id || String(examiner);
        }
        return String(examiner);
      });

      const response = await fetch(`http://localhost:5000/api/schedule/add/${eventId}`, {
        method: 'POST',
        headers: {
          'x-auth-token': token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate: event.startDate,
          endDate: event.endDate,
          duration: event.duration,
          module: event.module,
          examinerIds: examinerIdsArray,
          eventId: eventId,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to schedule event');
      }

      setSuccess(`Event scheduled successfully with ${responseData.schedules.length} schedules!`);
      fetchEvents();
    } catch (err) {
      console.error('Schedule error:', err);
      setError(err.message || 'An unexpected error occurred while scheduling');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (eventId) => {
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/sign-in');
        throw new Error('Please login to continue.');
      }

      const response = await fetch(`http://localhost:5000/api/event/delete/${eventId}`, {
        method: 'DELETE',
        headers: {
          'x-auth-token': token,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to delete event');

      setSuccess('Event deleted successfully!');
      fetchEvents();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (eventId) => {
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/sign-in');
        throw new Error('Please login to continue.');
      }

      const response = await fetch(`http://localhost:5000/api/event/update-events/${eventId}`, {
        method: 'PUT',
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

      if (!response.ok) throw new Error('Failed to update event');

      setSuccess('Event updated successfully!');
      setIsEditing(false);
      fetchEvents();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div className="bg-white overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-all border border-indigo-50">
      <div className="p-6">
        {isEditing ? (
          <div className="space-y-4">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-lg"
              placeholder="Event Name"
            />
            <input
              type="text"
              name="module"
              value={formData.module}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-lg"
              placeholder="Module"
            />
            <input
              type="datetime-local"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
            <input
              type="datetime-local"
              name="endDate"
              value={formData.endDate}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-lg"
              placeholder="Duration (minutes)"
            />
            <div className="flex space-x-2">
              <button
                onClick={() => handleUpdate(event._id)}
                className="flex-1 py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                disabled={loading}
              >
                Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 py-2 px-4 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold text-indigo-800">{event.name}</h2>
              <div className="flex items-center space-x-2">
                <span
                  className={`text-xs font-medium py-1 px-3 rounded-full ${
                    event.scheduleIds.length > 0
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {event.scheduleIds.length > 0 ? 'Scheduled' : 'Pending'}
                </span>
                <button
                  onClick={() => handleGenerateEventReport(event._id)}
                  className={`py-1 px-3 rounded-lg text-white text-sm font-medium transition-all ${
                    loading ? 'bg-indigo-400 cursor-wait' : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                  disabled={loading}
                >
                  Generate Report
                </button>
              </div>
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
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span>Examiners: {event.examinerIds.map(e => e.name).join(', ')}</span>
              </div>
            </div>

            <div className="space-y-2">
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
              <div className="flex space-x-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className={`flex-1 py-2 px-4 rounded-lg text-white font-medium transition-all ${
                    event.scheduleIds.length > 0 || loading
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                  disabled={event.scheduleIds.length > 0 || loading}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(event._id)}
                  className={`flex-1 py-2 px-4 rounded-lg text-white font-medium transition-all ${
                    event.scheduleIds.length > 0 || loading
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                  disabled={event.scheduleIds.length > 0 || loading}
                >
                  Delete
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

EventCard.propTypes = {
  event: PropTypes.object.isRequired,
  setSuccess: PropTypes.func.isRequired,
  setError: PropTypes.func.isRequired,
  fetchEvents: PropTypes.func.isRequired,
  navigate: PropTypes.func.isRequired,
  handleGenerateEventReport: PropTypes.func.isRequired,
};

export default EventCard;