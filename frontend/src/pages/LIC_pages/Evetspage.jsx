import React, { useState } from 'react';
import { Calendar, Clock, Users, Plus, Edit, Trash2, Check, X, AlertCircle } from 'lucide-react';
import LICHeader from '../../components/LICHeader';

const EventsPage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [events, setEvents] = useState([
    {
      id: '1',
      name: 'Final Year Project Presentation',
      date: '2024-03-25T10:00',
      duration: 30,
      examiners: ['Dr. Smith', 'Dr. Johnson'],
      module: 'CS4001',
      status: 'upcoming',
    },
    {
      id: '2',
      name: 'Master\'s Thesis Defense',
      date: '2024-03-26T14:00',
      duration: 45,
      examiners: ['Dr. Williams', 'Dr. Brown'],
      module: 'CS5002',
      status: 'pending',
    },
  ]);

  // Mock examiner data
  const examiners = [
    { id: '1', name: 'Dr. Smith', available: true, expertise: 'AI & Machine Learning' },
    { id: '2', name: 'Dr. Johnson', available: true, expertise: 'Software Engineering' },
    { id: '3', name: 'Dr. Williams', available: false, expertise: 'Database Systems' },
    { id: '4', name: 'Dr. Brown', available: true, expertise: 'Computer Networks' },
  ];

  const [newEvent, setNewEvent] = useState({
    name: '',
    date: '',
    duration: 30,
    examiners: [],
    module: '',
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      // Handle examiner checkboxes
      const examinerName = value;
      setNewEvent(prev => {
        if (checked) {
          return { ...prev, examiners: [...prev.examiners, examinerName] };
        } else {
          return { ...prev, examiners: prev.examiners.filter(name => name !== examinerName) };
        }
      });
    } else {
      // Handle other inputs
      setNewEvent(prev => ({
        ...prev,
        [name]: type === 'number' ? parseInt(value) : value
      }));
    }
  };

  const handleCreateEvent = (e) => {
    e.preventDefault();
    const event = {
      id: Math.random().toString(36).substr(2, 9),
      ...newEvent,
      status: 'pending',
    };
    setEvents([...events, event]);
    setNewEvent({ name: '', date: '', duration: 30, examiners: [], module: '' });
    setIsCreateModalOpen(false);
    showSuccessMessage(selectedEvent ? 'Event updated successfully!' : 'Event created successfully!');
  };

  const handleDeleteEvent = (id) => {
    setEvents(events.filter(event => event.id !== id));
    setDeleteConfirm(null);
    showSuccessMessage('Event deleted successfully!');
  };

  const handleEditEvent = (event) => {
    setSelectedEvent(event);
    setNewEvent({
      name: event.name,
      date: event.date,
      duration: event.duration,
      examiners: [...event.examiners], // Create a new array to avoid mutation
      module: event.module || '',
    });
    setIsCreateModalOpen(true);
  };

  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const Modal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl transform transition-all">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {selectedEvent ? 'Edit Event' : 'Create New Event'}
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <form onSubmit={handleCreateEvent} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Event Name</label>
              <input
                type="text"
                name="name"
                value={newEvent.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                required
                placeholder="Enter event name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
                <input
                  type="datetime-local"
                  name="date"
                  value={newEvent.date}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
                <input
                  type="number"
                  name="duration"
                  value={newEvent.duration}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  min="15"
                  step="15"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Module Code</label>
              <input
                type="text"
                name="module"
                value={newEvent.module}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="e.g., CS4001"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Assign Examiners</label>
              <div className="space-y-2 max-h-48 overflow-y-auto rounded-lg border border-gray-200 p-3">
                {examiners.map((examiner) => (
                  <label
                    key={examiner.id}
                    className={`flex items-center p-3 rounded-lg transition-all ${
                      examiner.available 
                        ? 'bg-green-50 hover:bg-green-100' 
                        : 'bg-red-50 opacity-75'
                    }`}
                  >
                    <input
                      type="checkbox"
                      name="examiners"
                      value={examiner.name}
                      checked={newEvent.examiners.includes(examiner.name)}
                      onChange={handleInputChange}
                      disabled={!examiner.available}
                      className="rounded-md text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                    />
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-900">{examiner.name}</p>
                      <p className="text-xs text-gray-500">{examiner.expertise}</p>
                    </div>
                    {examiner.available ? (
                      <span className="text-green-600 text-xs font-medium">Available</span>
                    ) : (
                      <span className="text-red-600 text-xs font-medium">Unavailable</span>
                    )}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center"
              >
                <Check className="h-4 w-4 mr-2" />
                {selectedEvent ? 'Save Changes' : 'Create Event'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const DeleteConfirmModal = ({ event, onConfirm, onCancel }) => {
    if (!event) return null;

    return (
      <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl">
          <div className="flex items-center mb-4">
            <AlertCircle className="h-6 w-6 text-red-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Delete Event</h3>
          </div>
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete "{event.name}"? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(event.id)}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <LICHeader />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center">
              <Check className="h-5 w-5 text-green-500 mr-2" />
              <p className="text-green-700">{successMessage}</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Events Management</h1>
              <p className="mt-2 text-sm text-gray-600">
                Create and manage examination events, assign examiners, and track schedules.
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedEvent(null);
                setNewEvent({ name: '', date: '', duration: 30, examiners: [], module: '' });
                setIsCreateModalOpen(true);
              }}
              className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </button>
          </div>

          <div className="mt-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Schedule
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Examiners
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="relative py-4 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {events.map((event) => (
                    <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{event.name}</div>
                        <div className="text-sm text-gray-500">Module: {event.module}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          {new Date(event.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <Clock className="h-4 w-4 text-gray-400 mr-2" />
                          {event.duration} minutes
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-500">{event.examiners.join(', ')}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(event.status)}`}>
                          {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <div className="flex justify-end space-x-3">
                          <button
                            onClick={() => handleEditEvent(event)}
                            className="text-indigo-600 hover:text-indigo-900 transition-colors"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(event)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
        <DeleteConfirmModal
          event={deleteConfirm}
          onConfirm={handleDeleteEvent}
          onCancel={() => setDeleteConfirm(null)}
        />
      </div>
    </div>
  );
};

export default EventsPage;