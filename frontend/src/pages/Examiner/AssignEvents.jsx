import { useState, useEffect } from 'react';

const AssignEvents = () => {
  const [assignedEvents, setAssignedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/assigned/events');
        if (!response.ok) {
          throw new Error('Failed to fetch assigned events');
        }
        const { data } = await response.json();
        setAssignedEvents(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const getStatusColor = (status) => {
    return status === 'upcoming'
      ? 'bg-green-100 text-green-800'
      : 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <p className="text-gray-600">Loading events...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8">
            <h1 className="text-3xl font-extrabold text-white text-center">
              Assigned Events
            </h1>
            <p className="mt-2 text-blue-100 text-center">
              Your upcoming and past examination sessions
            </p>
          </div>

          <div className="p-6">
            <div className="space-y-6">
              {assignedEvents.length === 0 ? (
                <p className="text-gray-600 text-center">No events assigned yet.</p>
              ) : (
                assignedEvents.map((event) => (
                  <div
                    key={event._id} // Use _id from MongoDB
                    className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-900">
                          {event.module}
                        </h2>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                            event.status
                          )}`}
                        >
                          {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Student Name</p>
                          <p className="mt-1 text-gray-900">{event.studentName}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Student ID</p>
                          <p className="mt-1 text-gray-900">{event.studentId}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Date</p>
                          <p className="mt-1 text-gray-900">{formatDate(event.date)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Time</p>
                          <p className="mt-1 text-gray-900">{event.time}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignEvents;