import React, { useState } from 'react';
import {
  Bell,
  Calendar,
  CheckCircle2,
  Clock,
  Mail,
  Send,
  User,
  XCircle,
  AlertCircle,
} from 'lucide-react';

const NotifyPage = () => {
  // Mock data for events and examiners
  const [events] = useState([
    {
      id: '1',
      name: 'Final Year Project Presentation',
      date: '2024-03-25T10:00',
      duration: 30,
      module: 'CS4001',
    },
    {
      id: '2',
      name: 'Master\'s Thesis Defense',
      date: '2024-03-26T14:00',
      duration: 45,
      module: 'CS5002',
    },
  ]);

  const [examiners] = useState([
    {
      id: '1',
      name: 'Dr. Smith',
      email: 'smith@university.edu',
      status: 'pending',
    },
    {
      id: '2',
      name: 'Dr. Johnson',
      email: 'johnson@university.edu',
      status: 'accepted',
    },
    {
      id: '3',
      name: 'Dr. Williams',
      email: 'williams@university.edu',
      status: 'declined',
    },
    {
      id: '4',
      name: 'Dr. Brown',
      email: 'brown@university.edu',
      status: 'pending',
    },
  ]);

  const [selectedEvent, setSelectedEvent] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [selectedExaminers, setSelectedExaminers] = useState([]);
  const [notificationSent, setNotificationSent] = useState(false);

  const handleSendNotification = (e) => {
    e.preventDefault();
    // Simulate sending notification
    setTimeout(() => {
      setNotificationSent(true);
      setTimeout(() => setNotificationSent(false), 3000);
    }, 500);
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

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 sm:px-0">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">Notify Examiners</h1>
            <p className="mt-2 text-sm text-gray-700">
              Send notifications to examiners about upcoming events and track their responses.
            </p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Notification Form */}
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Send Notification</h2>
            <form onSubmit={handleSendNotification} className="space-y-4">
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
                    <option key={event.id} value={event.id}>
                      {event.name} - {new Date(event.date).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Select Examiners</label>
                <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                  {examiners.map((examiner) => (
                    <label key={examiner.id} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedExaminers.includes(examiner.id)}
                        onChange={(e) => {
                          const updatedSelection = e.target.checked
                            ? [...selectedExaminers, examiner.id]
                            : selectedExaminers.filter(id => id !== examiner.id);
                          setSelectedExaminers(updatedSelection);
                        }}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-900">{examiner.name}</span>
                      <span className="text-sm text-gray-500">{examiner.email}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Message</label>
                <textarea
                  value={notificationMessage}
                  onChange={(e) => setNotificationMessage(e.target.value)}
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Enter your message here..."
                  required
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Notification
                </button>
              </div>
            </form>

            {notificationSent && (
              <div className="mt-4 p-4 bg-green-50 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-green-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">
                      Notification sent successfully!
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Examiner Status */}
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Examiner Status</h2>
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
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {examiners.map((examiner) => (
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
                          <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(examiner.status)}`}>
                            {examiner.status.charAt(0).toUpperCase() + examiner.status.slice(1)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date().toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotifyPage;