import React, { useState } from 'react';
import { Calendar, Clock, Users, Plus, Edit, Trash2, Check, X } from 'lucide-react';

const EventsPage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [events, setEvents] = useState([
    {
      id: '1',
      name: 'Final Year Project Presentation',
      date: '2024-03-25T10:00',
      duration: 30,
      examiners: ['Dr. Smith', 'Dr. Johnson'],
    },
  ]);

  // Mock examiner data
  const examiners = [
    { id: '1', name: 'Dr. Smith', available: true },
    { id: '2', name: 'Dr. Johnson', available: true },
    { id: '3', name: 'Dr. Williams', available: false },
    { id: '4', name: 'Dr. Brown', available: true },
  ];

  const [newEvent, setNewEvent] = useState({
    name: '',
    date: '',
    duration: 30,
    examiners: [],
  });

  const handleCreateEvent = (e) => {
    e.preventDefault();
    const event = {
      id: Math.random().toString(36).substr(2, 9),
      ...newEvent,
    };
    setEvents([...events, event]);
    setNewEvent({ name: '', date: '', duration: 30, examiners: [] });
    setIsCreateModalOpen(false);
  };

  const handleDeleteEvent = (id) => {
    setEvents(events.filter(event => event.id !== id));
  };

  const handleEditEvent = (event) => {
    setSelectedEvent(event);
    setNewEvent({
      name: event.name,
      date: event.date,
      duration: event.duration,
      examiners: event.examiners,
    });
    setIsCreateModalOpen(true);
  };

  const Modal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md border-1 border-gray-500">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {selectedEvent ? 'Edit Event' : 'Create New Event'}
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-5 w-5" />
            </button>
          </div>
          <form onSubmit={handleCreateEvent} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Event Name</label>
              <input
                type="text"
                value={newEvent.name}
                onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Date & Time</label>
              <input
                type="datetime-local"
                value={newEvent.date}
                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
              <input
                type="number"
                value={newEvent.duration}
                onChange={(e) => setNewEvent({ ...newEvent, duration: parseInt(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                min="15"
                step="15"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Assign Examiners</label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {examiners.map((examiner) => (
                  <label
                    key={examiner.id}
                    className={`flex items-center p-2 rounded ${
                      examiner.available ? 'bg-green-50' : 'bg-red-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={newEvent.examiners.includes(examiner.name)}
                      onChange={(e) => {
                        const updatedExaminers = e.target.checked
                          ? [...newEvent.examiners, examiner.name]
                          : newEvent.examiners.filter((name) => name !== examiner.name);
                        setNewEvent({ ...newEvent, examiners: updatedExaminers });
                      }}
                      disabled={!examiner.available}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm">{examiner.name}</span>
                    {examiner.available ? (
                      <span className="ml-auto text-green-600 text-xs">Available</span>
                    ) : (
                      <span className="ml-auto text-red-600 text-xs">Unavailable</span>
                    )}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
              >
                {selectedEvent ? 'Save Changes' : 'Create Event'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 sm:px-0">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">Events Management</h1>
            <p className="mt-2 text-sm text-gray-700">
              Create and manage examination events, assign examiners, and track schedules.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <button
              onClick={() => {
                setSelectedEvent(null);
                setNewEvent({ name: '', date: '', duration: 30, examiners: [] });
                setIsCreateModalOpen(true);
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </button>
          </div>
        </div>

        <div className="mt-8 flex flex-col">
          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Event Name
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Date & Time
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Duration
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Examiners
                      </th>
                      <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {events.map((event) => (
                      <tr key={event.id}>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                          {event.name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {new Date(event.date).toLocaleString()}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {event.duration} minutes
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span>{event.examiners.join(', ')}</span>
                          </div>
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleEditEvent(event)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteEvent(event.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4" />
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
        </div>
      </div>

      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
    </div>
  );
};

export default EventsPage;