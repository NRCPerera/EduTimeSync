import { useState, useEffect } from 'react';

const ScheduleEvent = () => {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showForm, setShowForm] = useState(false); // Toggle form visibility
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    duration: '',
    module: '',
    examinerIds: [],
  });
  const [examiners, setExaminers] = useState([]); // Fetch available examiners

  useEffect(() => {
    fetchEvents();
    fetchExaminers(); // Fetch examiners on mount
  }, []);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/get-events', {
        headers: { 'x-auth-token': token },
      });
      if (!response.ok) throw new Error('Failed to fetch events');
      const data = await response.json();
      setEvents(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchExaminers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/get-examiners', {
        headers: { 'x-auth-token': token },
      });
      if (!response.ok) throw new Error('Failed to fetch examiners');
      const data = await response.json();
      setExaminers(data); // Expecting array of { _id, name }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSchedule = async (eventId) => {
    setError(null);
    setSuccess(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/schedule/add/${eventId}`, {
        method: 'POST',
        headers: { 'x-auth-token': token },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to schedule event');
      }
      const data = await response.json();
      setSuccess(`Event scheduled successfully with ${data.schedules.length} schedules!`);
      fetchEvents(); // Refresh events
    } catch (err) {
      setError(err.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleExaminerChange = (e) => {
    const selectedIds = Array.from(e.target.selectedOptions, option => option.value);
    setFormData({ ...formData, examinerIds: selectedIds });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/set-events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({
          ...formData,
          startDate: new Date(formData.startDate).toISOString(),
          endDate: new Date(formData.endDate).toISOString(),
          duration: parseInt(formData.duration, 10),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create event');
      }

      setSuccess('Event created successfully!');
      setFormData({ name: '', startDate: '', endDate: '', duration: '', module: '', examinerIds: [] }); // Reset form
      setShowForm(false); // Hide form
      fetchEvents(); // Refresh event list
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 text-center mb-8">Schedule Events</h1>
        {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg mb-4">{error}</div>}
        {success && <div className="p-3 bg-green-100 text-green-700 rounded-lg mb-4">{success}</div>}

        {/* Add New Event Button */}
        <div className="mb-6 text-center">
          <button
            onClick={() => setShowForm(!showForm)}
            className="py-2 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
          >
            {showForm ? 'Cancel' : 'Add New Event'}
          </button>
        </div>

        {/* Event Creation Form */}
        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-4">Create New Event</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700">Event Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700">Start Date</label>
                <input
                  type="datetime-local"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700">End Date</label>
                <input
                  type="datetime-local"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700">Duration (minutes)</label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-lg"
                  min="1"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700">Module</label>
                <input
                  type="text"
                  name="module"
                  value={formData.module}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700">Examiners</label>
                <select
                  multiple
                  name="examinerIds"
                  value={formData.examinerIds}
                  onChange={handleExaminerChange}
                  className="w-full p-2 border rounded-lg"
                  required
                >
                  {examiners.map(examiner => (
                    <option key={examiner._id} value={examiner._id}>
                      {examiner.name}
                    </option>
                  ))}
                </select>
                <p className="text-gray-500 text-sm">Hold Ctrl (or Cmd) to select multiple examiners</p>
              </div>
              <button
                type="submit"
                className="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
              >
                Create Event
              </button>
            </form>
          </div>
        )}

        {/* Event List */}
        <div className="space-y-4">
          {events.map(event => (
            <div key={event._id} className="bg-white p-6 rounded-lg shadow-md flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">{event.name}</h2>
                <p className="text-gray-600">Module: {event.module}</p>
                <p className="text-gray-600">Duration: {event.duration} minutes</p>
                <p className="text-gray-600">Start: {new Date(event.startDate).toLocaleString()}</p>
                <p className="text-gray-600">End: {new Date(event.endDate).toLocaleString()}</p>
                <p className="text-gray-600">Schedules: {event.scheduleIds.length}</p>
              </div>
              <button
                onClick={() => handleSchedule(event._id)}
                disabled={event.scheduleIds.length > 0}
                className={`py-2 px-4 rounded-lg text-white ${event.scheduleIds.length > 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'} transition-all`}
              >
                {event.scheduleIds.length > 0 ? 'Scheduled' : 'Schedule Now'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScheduleEvent;