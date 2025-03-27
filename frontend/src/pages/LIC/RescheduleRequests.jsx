import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, Users, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import ExaminerHeader from '../../components/LICHeader';

const RescheduleRequests = () => {
  // Mock data for reschedule requests
  const [requests, setRequests] = useState([
    {
      id: 1,
      examiner: {
        name: "Dr. Smith",
        department: "Computer Science"
      },
      exam: {
        subject: "Advanced Mathematics",
        type: "Final Exam",
        currentDate: "2024-03-20",
        currentTime: "10:00 AM",
        newDate: "2024-03-25",
        newTime: "2:00 PM",
        location: "Room 301",
        participants: 30
      },
      reason: "Schedule conflict with department meeting",
      status: "pending",
      submittedAt: "2024-03-18T09:00:00Z"
    },
    {
      id: 2,
      examiner: {
        name: "Prof. Johnson",
        department: "Physics"
      },
      exam: {
        subject: "Quantum Mechanics",
        type: "Midterm",
        currentDate: "2024-03-21",
        currentTime: "11:00 AM",
        newDate: "2024-03-23",
        newTime: "11:00 AM",
        location: "Lab 205",
        participants: 25
      },
      reason: "Equipment maintenance scheduled for original date",
      status: "pending",
      submittedAt: "2024-03-17T14:30:00Z"
    }
  ]);

  const handleApprove = (requestId) => {
    setRequests(requests.map(request => 
      request.id === requestId 
        ? { ...request, status: 'approved' } 
        : request
    ));
    // Here you would typically make an API call to update the status
  };

  const handleReject = (requestId) => {
    setRequests(requests.map(request => 
      request.id === requestId 
        ? { ...request, status: 'rejected' } 
        : request
    ));
    // Here you would typically make an API call to update the status
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ExaminerHeader />
      
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reschedule Requests</h1>
            <p className="text-gray-600 mt-1">Review and manage examination reschedule requests</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              <span className="text-sm font-medium">{requests.filter(r => r.status === 'pending').length} Pending</span>
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="divide-y divide-gray-200">
            {requests.map(request => (
              <div key={request.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{request.exam.subject}</h3>
                    <p className="text-sm text-gray-600">
                      Requested by {request.examiner.name} • {request.examiner.department}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {request.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => handleApprove(request.id)}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 rounded-md hover:bg-green-100 transition-colors"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(request.id)}
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
                          <span className="text-sm">{new Date(request.exam.currentDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Clock className="h-4 w-4 mr-1" />
                          <span className="text-sm">{request.exam.currentTime}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Requested Schedule</h4>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center text-gray-600">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          <span className="text-sm">{new Date(request.exam.newDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Clock className="h-4 w-4 mr-1" />
                          <span className="text-sm">{request.exam.newTime}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span className="text-sm">{request.exam.location}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    <span className="text-sm">{request.exam.participants} students</span>
                  </div>
                  <div className="text-gray-600 text-sm">
                    Submitted {new Date(request.submittedAt).toLocaleDateString()}
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
      </main>
    </div>
  );
};

export default RescheduleRequests;