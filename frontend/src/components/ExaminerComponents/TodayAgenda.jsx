import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { format, isToday, parseISO } from 'date-fns';

function TodayAgenda() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found. Please sign in.');
        }

        const response = await fetch('http://localhost:5000/api/event/get-events', {
          headers: {
            'x-auth-token': token,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }

        const data = await response.json();

        // Filter events for today and transform to match frontend structure
        const todayMeetings = data
          .filter(event => event.startDate && isToday(parseISO(event.startDate)))
          .map(event => ({
            id: event._id,
            studentName: event.studentId?.name || event.studentId?.email || 'Unknown',
            topic: event.title || event.module || 'Untitled',
            time: `${format(parseISO(event.startDate), 'hh:mm a')} - ${format(parseISO(event.endDate), 'hh:mm a')}`,
            meetingLink: event.googleMeetLink || null,
            status: event.status || 'upcoming',
            timestamp: parseISO(event.startDate),
          }));

        setMeetings(todayMeetings);
      } catch (err) {
        console.error('Error fetching meetings:', err);
        setError(err.message || 'Failed to load meetings');
      } finally {
        setLoading(false);
      }
    };

    fetchMeetings();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'ongoing':
        return <Clock className="h-5 w-5 text-amber-500 animate-pulse" />;
      case 'missed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'upcoming':
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
      default:
        return null;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'ongoing':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'missed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTimeRemaining = (timestamp) => {
    const now = new Date();
    const diff = timestamp - now;

    if (diff < 0) return 'Started';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-4 py-5 sm:px-6 bg-indigo-600">
        <h3 className="text-lg leading-6 font-medium text-white flex items-center">
          <Clock className="mr-2 h-5 w-5" />
          Today's Agenda
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-indigo-100">
          Your scheduled meetings for today
        </p>
      </div>

      <div className="border-t border-gray-200 overflow-x-auto">
        <div className="min-w-full">
          <div className="flex justify-between bg-gray-50 px-6 py-3">
            <div className="w-1/2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Student & Topic
            </div>
            <div className="w-1/4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Time
            </div>
            <div className="w-1/4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </div>
          </div>

          <div className="bg-white divide-y divide-gray-200">
            {loading ? (
              <div className="px-6 py-4 text-center text-gray-500">Loading meetings...</div>
            ) : error ? (
              <div className="px-6 py-4 text-center text-red-500">{error}</div>
            ) : meetings.length > 0 ? (
              meetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className="px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors duration-150"
                >
                  <div className="w-1/2">
                    <div className="text-sm font-medium text-gray-900">{meeting.studentName}</div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">{meeting.topic}</div>
                  </div>
                  <div className="w-1/4">
                    <div className="text-sm text-gray-900">{meeting.time}</div>
                    {meeting.status !== 'completed' && meeting.status !== 'missed' && (
                      <div className="text-xs text-gray-500">
                        {meeting.status === 'ongoing' ? 'In progress' : `In ${formatTimeRemaining(meeting.timestamp)}`}
                      </div>
                    )}
                  </div>
                  <div className="w-1/4">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(
                        meeting.status
                      )}`}
                    >
                      <span className="flex items-center">
                        {getStatusIcon(meeting.status)}
                        <span className="ml-1 capitalize">{meeting.status}</span>
                      </span>
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-4 text-center text-gray-500">
                No meetings scheduled for today
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TodayAgenda;