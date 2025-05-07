import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, Users, Video, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ExaminerHeader from '../../components/ExaminerHeader';

const ExaminerRescheduleRequests = () => {
  const navigate = useNavigate();
  const [rescheduleRequests, setRescheduleRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchRescheduleRequests();
  }, []);

  const fetchRescheduleRequests = async () => {
    setLoading(true);
    setError(null);

    if (!token) {
      setError('Please log in to view your reschedule requests');
      setLoading(false);
      navigate('/sign-in');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/rescheduleRequest/examiner', {
        headers: {
          'x-auth-token': token,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      setRescheduleRequests(data.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch reschedule requests');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (requestId) => {
    if (!window.confirm('Are you sure you want to delete this reschedule request?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/rescheduleRequest/${requestId}`, {
        method: 'DELETE',
        headers: {
          'x-auth-token': token,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete reschedule request');
      }

      fetchRescheduleRequests();
    } catch (err) {
      setError(err.message);
      console.error('Delete error:', err);
    }
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ExaminerHeader />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Reschedule Requests</h2>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Reschedule Requests</h3>
          </div>
          {loading ? (
            <div className="p-6 text-center text-gray-600">Loading reschedule requests...</div>
          ) : error ? (
            <div className="p-6 text-center text-red-500">{error}</div>
          ) : rescheduleRequests.length === 0 ? (
            <div className="p-6 text-center text-gray-600">No reschedule requests found</div>
          ) : (
            <div className="divide-y divide-gray-200">
              {rescheduleRequests.map((request) => (
                <div key={request._id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{request.scheduleId?.module || 'N/A'}</h4>
                      <span className="text-sm text-gray-500">Reschedule Request</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-sm capitalize ${getStatusStyles(request.status)}`}>
                        {request.status || 'Pending'}
                      </span>
                      <button
                        onClick={() => handleDelete(request._id)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg shaded='true'-red-100 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex items-center text-gray-600">
                      <CalendarIcon className="h-5 w-5 mr-2" />
                      <span>Proposed: {request.proposedTime?.date ? new Date(request.proposedTime.date).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="h-5 w-5 mr-2" />
                      <span>
                        {request.proposedTime?.startTime && request.proposedTime?.endTime
                          ? `${request.proposedTime.startTime} - ${request.proposedTime.endTime}`
                          : 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-5 w-5 mr-2" />
                      <span>{request.scheduleId?.googleMeetLink ? 'Virtual' : 'In-person'}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Users className="h-5 w-5 mr-2" />
                      <span>Student: {request.studentId?.email || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center text-gray-600 col-span-full">
                      <span className="font-medium mr-2">Reason:</span>
                      <span>{request.reason || 'No reason provided'}</span>
                    </div>
                    {request.scheduleId?.googleMeetLink && (
                      <div className="flex items-center text-gray-600 col-span-full">
                        <Video className="h-5 w-5 mr-2" />
                        <a
                          href={request.scheduleId.googleMeetLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:underline"
                        >
                          Google Meet Link
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ExaminerRescheduleRequests;