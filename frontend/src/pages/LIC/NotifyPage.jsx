import React, { useState, useEffect, useMemo } from 'react';
import {
  Bell,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Send,
  User,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LICHeader from '../../components/LICHeader';

const NotifyPage = () => {
  const [events, setEvents] = useState([]);
  const [examiners, setExaminers] = useState([]);
  const [compatibleExaminers, setCompatibleExaminers] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [selectedExaminers, setSelectedExaminers] = useState([]);
  const [notificationSent, setNotificationSent] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Memoize examiners and events to prevent reference changes
  const memoizedExaminers = useMemo(() => examiners, [examiners]);
  const memoizedEvents = useMemo(() => events, [events]);

  useEffect(() => {
    fetchEvents();
    fetchExaminers();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/signin');
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
        navigate('/signin');
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
        navigate('/signin');
        throw new Error('Please login to continue.');
      }

      const response = await fetch('http://localhost:5000/api/get-examiners-availability', {
        headers: {
          'x-auth-token': token,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        navigate('/signin');
        throw new Error('Session expired. Please login again.');
      }

      if (!response.ok) throw new Error('Failed to fetch examiners');

      const data = await response.json();
      const formattedExaminers = data.map(examiner => ({
        id: examiner._id,
        name: examiner.name,
        email: examiner.email,
        availability: examiner.availability || [],
        status: 'pending',
        declineReason: null,
      }));
      setExaminers(formattedExaminers);
      setCompatibleExaminers(formattedExaminers);
    } catch (err) {
      setError(err.message);
    }
  };

  // Filter examiners based on selected event
  useEffect(() => {
    if (selectedEvent) {
      const event = memoizedEvents.find(e => e._id === selectedEvent);
      if (event) {
        const eventStart = new Date(event.startDate);
        const eventEnd = new Date(event.endDate);
        const filteredExaminers = memoizedExaminers.filter(ex =>
          ex.availability.some(slot =>
            new Date(slot.startTime) <= eventStart && new Date(slot.endTime) >= eventEnd
          )
        );
        setCompatibleExaminers(filteredExaminers);
        setSelectedExaminers(prev =>
          prev.filter(id => filteredExaminers.some(ex => ex.id === id))
        );
      }
    } else {
      setCompatibleExaminers(memoizedExaminers);
    }
  }, [selectedEvent, memoizedExaminers, memoizedEvents]);

  // Fetch notification statuses
  useEffect(() => {
    if (selectedEvent) {
      fetchNotificationStatuses(selectedEvent);
    } else {
      // Reset examiner statuses when no event is selected
      setExaminers(currentExaminers =>
        currentExaminers.map(ex => ({ ...ex, status: 'pending', declineReason: null }))
      );
    }
  }, [selectedEvent]);

  const fetchNotificationStatuses = async (eventId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/signin');
        throw new Error('Please login to continue.');
      }

      const response = await fetch(`http://localhost:5000/api/notify/status/${eventId}`, {
        headers: {
          'x-auth-token': token,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        navigate('/signin');
        throw new Error('Session expired. Please login again.');
      }

      if (!response.ok) throw new Error('Failed to fetch notification statuses');

      const statuses = await response.json();
      setExaminers(currentExaminers =>
        currentExaminers.map(ex => {
          const status = statuses.find(s => s.id === ex.id);
          return status
            ? { ...ex, status: status.status, declineReason: status.declineReason, updatedAt: status.updatedAt }
            : ex;
        })
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    setError(null);
    setNotificationSent(false);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/signin');
        throw new Error('Please login to continue.');
      }

      const response = await fetch('http://localhost:5000/api/notify/send', {
        method: 'POST',
        headers: {
          'x-auth-token': token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: selectedEvent,
          examinerIds: selectedExaminers,
          message: notificationMessage,
        }),
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        navigate('/signin');
        throw new Error('Session expired. Please login again.');
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send notification');
      }

      setNotificationSent(true);
      setTimeout(() => setNotificationSent(false), 3000);
      setNotificationMessage('');
      setSelectedExaminers([]);
      if (selectedEvent) {
        fetchNotificationStatuses(selectedEvent);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'declined':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const formatTimeSlot = (slot) => {
    const start = new Date(slot.startTime).toLocaleString('en-US', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
    const end = new Date(slot.endTime).toLocaleTimeString('en-US', { timeStyle: 'short' });
    return `${start} - ${end}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <LICHeader />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h1 className="text-2xl font-semibold text-gray-900">Notify Examiners</h1>
              <p className="mt-2 text-sm text-gray-700">
                Select an event and choose examiners whose availability matches the event time to send notifications.
              </p>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 rounded-md">
              <div className="flex">
                <XCircle className="h-5 w-5 text-red-400" />
                <p className="ml-3 text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          )}

          {loading && (
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
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
          )}

          {!loading && (
            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Notification Form */}
              <div className="bg-white shadow-lg rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Send Notification</h2>
                <form onSubmit={handleSendNotification} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Select Event</label>
                    <select
                      value={selectedEvent}
                      onChange={(e) => setSelectedEvent(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      required
                    >
                      <option value="">Choose an event...</option>
                      {events.map((event) => (
                        <option key={event._id} value={event._id}>
                          {event.name} - {new Date(event.startDate).toLocaleDateString()} ({event.module})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Select Examiners (Filtered by Availability)
                    </label>
                    <div className="mt-2 space-y-3 max-h-60 overflow-y-auto border border-gray-200 rounded-md p-4">
                      {compatibleExaminers.length === 0 ? (
                        <p className="text-sm text-gray-500">
                          {selectedEvent
                            ? 'No examiners available for this event’s time.'
                            : 'Select an event to filter examiners by availability.'}
                        </p>
                      ) : (
                        compatibleExaminers.map((examiner) => (
                          <div key={examiner.id} className="flex items-start space-x-3">
                            <label className="flex items-center space-x-3 flex-1">
                              <input
                                type="checkbox"
                                checked={selectedExaminers.includes(examiner.id)}
                                onChange={(e) => {
                                  const updatedSelection = e.target.checked
                                    ? [...selectedExaminers, examiner.id]
                                    : selectedExaminers.filter((id) => id !== examiner.id);
                                  setSelectedExaminers(updatedSelection);
                                }}
                                className="rounded text-indigo-600 focus:ring-indigo-500"
                              />
                              <div>
                                <span className="text-sm font-medium text-gray-900">{examiner.name}</span>
                                <span className="text-sm text-gray-500 block">{examiner.email}</span>
                                <span className="text-sm text-gray-600 block">
                                  <strong>Availability:</strong>{' '}
                                  {examiner.availability.length > 0
                                    ? examiner.availability.map(slot => formatTimeSlot(slot)).join(', ')
                                    : 'None provided'}
                                </span>
                              </div>
                            </label>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Notification Message</label>
                    <textarea
                      value={notificationMessage}
                      onChange={(e) => setNotificationMessage(e.target.value)}
                      rows={4}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="Enter your notification message (event details will be added automatically)..."
                      required
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={selectedExaminers.length === 0 || !selectedEvent}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send Notification
                    </button>
                  </div>
                </form>

                {notificationSent && (
                  <div className="mt-4 p-4 bg-green-50 rounded-md">
                    <div className="flex">
                      <CheckCircle2 className="h-5 w-5 text-green-400" />
                      <p className="ml-3 text-sm font-medium text-green-800">
                        Notifications sent successfully!
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Examiner Response Status */}
              <div className="bg-white shadow-lg rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Examiner Response Status</h2>
                {selectedEvent ? (
                  <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-300">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Examiner
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Last Updated
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Decline Reason
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {examiners
                          .filter(ex => ex.status !== 'pending' || selectedExaminers.includes(ex.id))
                          .map((examiner) => (
                            <tr key={examiner.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <User className="h-5 w-5 text-gray-400 mr-2" />
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {examiner.name}
                                    </div>
                                    <div className="text-sm text-gray-500">{examiner.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  {getStatusIcon(examiner.status)}
                                  <span
                                    className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(examiner.status)}`}
                                  >
                                    {examiner.status.charAt(0).toUpperCase() + examiner.status.slice(1)}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {examiner.updatedAt
                                  ? new Date(examiner.updatedAt).toLocaleDateString()
                                  : '-'}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">
                                {examiner.declineReason || '-'}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Select an event to view examiner responses.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotifyPage;