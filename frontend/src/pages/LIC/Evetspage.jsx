import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Plus, Edit, Trash2, Check, X, AlertCircle } from 'lucide-react';
import LICHeader from '../../components/LICHeader';

const EventsPage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [events, setEvents] = useState([]);
  const [examiners, setExaminers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [newEvent, setNewEvent] = useState({
    name: '',
    date: '',
    duration: 30,
    examiners: [],
    module: '',
  });

  useEffect(() => {
    const fetchData = async () => {
        try {
            console.log('Fetching events from: http://localhost:5000/api/get-events');
            
            const [eventsResponse, examinersResponse] = await Promise.all([
                fetch('http://localhost:5000/api/get-events'),
                fetch('http://localhost:5000/api/get-examiners'),
            ]);

            if (!eventsResponse.ok || !examinersResponse.ok) {
                throw new Error(`HTTP error! Events: ${eventsResponse.status}, Examiners: ${examinersResponse.status}`);
            }

            const [eventsData, examinersData] = await Promise.all([
                eventsResponse.json(),
                examinersResponse.json(),
            ]);

            console.log('Events response:', eventsData);
            console.log('Examiners response:', examinersData);

            setEvents(eventsData.map(event => ({ ...event, id: event._id })));
            setExaminers(examinersData.map(name => ({ name, available: true })));
            setLoading(false);
        } catch (err) {
            console.error('Fetch error:', err.message);
            setError(`Failed to load data: ${err.message}`);
            setLoading(false);
        }
    };
    fetchData();
}, []);


  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewEvent(prev => {
      if (type === 'checkbox') {
        return {
          ...prev,
          examiners: checked
            ? [...prev.examiners, value]
            : prev.examiners.filter(examiner => examiner !== value),
        };
      }
      if (type === 'number') {
        return { ...prev, [name]: Number(value) };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      const method = selectedEvent ? 'PUT' : 'POST';
      const url = selectedEvent 
        ? `http://localhost:5000/api/update-events/${selectedEvent.id}`
        : 'http://localhost:5000/api/set-events';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvent),
      });

      if (!response.ok) {
        throw new Error(`Failed to save event: ${response.statusText}`);
      }

      const data = await response.json();

      if (selectedEvent) {
        setEvents(events.map(event => (event.id === selectedEvent.id ? { ...data, id: data._id } : event)));
        showSuccessMessage('Event updated successfully!');
      } else {
        setEvents([...events, { ...data, id: data._id }]);
        showSuccessMessage('Event created successfully!');
      }
      
      setNewEvent({ name: '', date: '', duration: 30, examiners: [], module: '' });
      setIsCreateModalOpen(false);
      setSelectedEvent(null);
    } catch (error) {
      setError('Failed to save event: ' + error.message);
    }
  };

  const handleDeleteEvent = async (id) => {
    try {
        const response = await fetch(`http://localhost:5000/api/delete-events/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) throw new Error('Failed to delete event');

        setEvents(events.filter(event => event.id !== id));
        setDeleteConfirm(null);
        showSuccessMessage('Event deleted successfully!');
    } catch (error) {
        setError('Failed to delete event: ' + error.message);
    }
};

  const handleEditEvent = (event) => {
    setSelectedEvent(event);
    setNewEvent({
      name: event.name,
      date: new Date(event.date).toISOString().slice(0, 16),
      duration: event.duration,
      examiners: [...event.examiners],
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
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const Modal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {selectedEvent ? 'Edit Event' : 'Create New Event'}
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <form onSubmit={handleCreateEvent} className="space-y-6">
            <div>
              <label htmlFor="event-name" className="block text-sm font-medium text-gray-700 mb-1">
                Event Name
              </label>
              <input
                id="event-name"
                type="text"
                name="name"
                value={newEvent.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500"
                required
                placeholder="Enter event name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="event-date" className="block text-sm font-medium text-gray-700 mb-1">
                  Date & Time
                </label>
                <input
                  id="event-date"
                  type="datetime-local"
                  name="date"
                  value={newEvent.date}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="event-duration" className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (min)
                </label>
                <input
                  id="event-duration"
                  type="number"
                  name="duration"
                  value={newEvent.duration}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500"
                  min="15"
                  step="15"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="event-module" className="block text-sm font-medium text-gray-700 mb-1">
                Module Code
              </label>
              <input
                id="event-module"
                type="text"
                name="module"
                value={newEvent.module}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., CS4001"
                required
              />
            </div>

            <div>
              <fieldset>
                <legend className="block text-sm font-medium text-gray-700 mb-2">Assign Examiners</legend>
                <div className="space-y-2 max-h-48 overflow-y-auto rounded-lg border border-gray-200 p-3">
                  {examiners.map((examiner) => (
                    <label
                      key={examiner.name}
                      htmlFor={`examiner-${examiner.name}`}
                      className={`flex items-center p-3 rounded-lg ${
                        examiner.available ? 'bg-green-50 hover:bg-green-100' : 'bg-red-50 opacity-75'
                      }`}
                    >
                      <input
                        id={`examiner-${examiner.name}`}
                        type="checkbox"
                        name="examiners"
                        value={examiner.name}
                        checked={newEvent.examiners.includes(examiner.name)}
                        onChange={handleInputChange}
                        disabled={!examiner.available}
                        className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                      />
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-gray-900">{examiner.name}</p>
                      </div>
                      {examiner.available ? (
                        <span className="text-green-600 text-xs font-medium">Available</span>
                      ) : (
                        <span className="text-red-600 text-xs font-medium">Unavailable</span>
                      )}
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center"
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
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(event.id)}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

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
              className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event Details
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Schedule
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Examiners
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="relative py-4 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {events.map((event) => (
                    <tr key={event.id} className="hover:bg-gray-50">
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
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(event)}
                            className="text-red-600 hover:text-red-900"
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