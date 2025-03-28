import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ExaminerHeader from '../../components/ExaminerHeader';

const ExaminerRescheduleRequests = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);

    if (!token) {
      setError('Please log in to view your reschedule requests');
      navigate('/sign-in');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/reschedule/examiner', {
        headers: {
          'x-auth-token': token,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      setRequests(data.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch reschedule requests');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ExaminerHeader />
      
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Reschedule Requests</h1>
            <p className="text-gray-600 mt-1">View your submitted reschedule requests</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              <span className="text-sm font-medium">
                {requests.filter(r => r.status === 'pending').length} Pending
              </span>
            </span>
          </div>
        </div>

        {loading ? (
          <div className="text-center text-gray-600">Loading requests...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : requests.length === 0 ? (
          <div className="text-center text-gray-600">No reschedule requests submitted</div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="divide-y divide-gray-200">
              {requests.map(request => (
                <div key={request._id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{request.scheduleId.module}</h3>
                      <p className="text-sm text-gray-600">Submitted on {new Date(request.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        request.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : request.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Current Schedule</h4>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center text-gray-600">
                            <CalendarIcon className="h-4 w-4 mr-1" />
                            <span className="text-sm">{new Date(request.scheduleId.scheduledTime.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Clock className="h-4 w-4 mr-1" />
                            <span className="text-sm">{request.scheduleId.scheduledTime.startTime} - {request.scheduleId.scheduledTime.endTime}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Requested Schedule</h4>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center text-gray-600">
                            <CalendarIcon className="h-4 w-4 mr-1" />
                            <span className="text-sm">{new Date(request.proposedTime.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Clock className="h-4 w-4 mr-1" />
                            <span className="text-sm">{request.proposedTime.startTime} - {request.proposedTime.endTime}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="text-sm">{request.scheduleId.googleMeetLink ? 'Virtual' : 'In-person'}</span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Reason for Rescheduling</h4>
                    <p className="text-sm text-gray-600">{request.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ExaminerRescheduleRequests;