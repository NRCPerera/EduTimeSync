import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, Users, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LICHeader from '../../components/LICHeader';

const RescheduleRequests = () => {
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
      setError('Please log in to view reschedule requests');
      navigate('/sign-in');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/reschedule/all', {
        headers: {
          'x-auth-token': token,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      console.log('Fetched reschedule requests:', data.data);
      setRequests(data.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch reschedule requests');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/reschedule/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({ status: 'approved' }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to approve request');
      }

      setRequests(requests.map(request =>
        request._id === requestId ? { ...request, status: 'approved' } : request
      ));
    } catch (err) {
      setError(err.message);
      console.error('Approve error:', err);
    }
  };

  const handleReject = async (requestId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/reschedule/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({ status: 'rejected' }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to reject request');
      }

      setRequests(requests.map(request =>
        request._id === requestId ? { ...request, status: 'rejected' } : request
      ));
    } catch (err) {
      setError(err.message);
      console.error('Reject error:', err);
    }
  };

  // Helper function to safely extract date
  const getDateString = (schedule) => {
    if (!schedule) return 'N/A';
    if (schedule.scheduledTime?.date) {
      return new Date(schedule.scheduledTime.date).toLocaleDateString();
    } else if (schedule.startTime) {
      return new Date(schedule.startTime).toLocaleDateString();
    }
    return 'N/A';
  };

  // Helper function to safely extract time range
  const getTimeString = (schedule) => {
    if (!schedule) return 'N/A';
    if (schedule.scheduledTime?.startTime && schedule.scheduledTime?.endTime) {
      return `${schedule.scheduledTime.startTime} - ${schedule.scheduledTime.endTime}`;
    } else if (schedule.startTime && schedule.endTime) {
      const start = new Date(schedule.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const end = new Date(schedule.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return `${start} - ${end}`;
    }
    return 'N/A';
  };

  // Helper function for proposed time
  const getProposedTimeString = (proposedTime) => {
    if (!proposedTime) return 'N/A';
    if (proposedTime.startTime && proposedTime.endTime) {
      return `${proposedTime.startTime} - ${proposedTime.endTime}`;
    }
    return 'N/A';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <LICHeader />
      
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reschedule Requests</h1>
            <p className="text-gray-600 mt-1">Review and manage examination reschedule requests</p>
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
          <div className="text-center text-gray-600">No reschedule requests found</div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="divide-y divide-gray-200">
              {requests.map(request => {
                console.log('Rendering request.scheduleId:', request.scheduleId); // Log each scheduleId
                return (
                  <div key={request._id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{request.scheduleId?.module || 'Unknown Module'}</h3>
                        <p className="text-sm text-gray-600">
                          Requested by {request.examinerId?.name || 'Unknown'} • {request.examinerId?.email || 'N/A'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {request.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => handleApprove(request._id)}
                              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 rounded-md hover:bg-green-100 transition-colors"
                            >
                              <CheckCircle className="h-4 w-4" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(request._id)}
                              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
                            >
                              <XCircle className="h-4 w-4" />
                              Reject
                            </button>
                          </>
                        ) : (
                          <span className={`px-3 py-1 rounded-full text-sm ${
                            request.status === 'approved' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Current Schedule</h4>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center text-gray-600">
                              <CalendarIcon className="h-4 w-4 mr-1" />
                              <span className="text-sm">{getDateString(request.scheduleId)}</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                              <Clock className="h-4 w-4 mr-1" />
                              <span className="text-sm">{getTimeString(request.scheduleId)}</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Requested Schedule</h4>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center text-gray-600">
                              <CalendarIcon className="h-4 w-4 mr-1" />
                              <span className="text-sm">{request.proposedTime?.date ? new Date(request.proposedTime.date).toLocaleDateString() : 'N/A'}</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                              <Clock className="h-4 w-4 mr-1" />
                              <span className="text-sm">{getProposedTimeString(request.proposedTime)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span className="text-sm">{request.scheduleId?.googleMeetLink ? 'Virtual' : 'In-person'}</span>
                      </div>
                      <div className="text-gray-600 text-sm">
                        Submitted {new Date(request.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Reason for Rescheduling</h4>
                      <p className="text-sm text-gray-600">{request.reason || 'No reason provided'}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default RescheduleRequests;