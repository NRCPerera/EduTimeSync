import { useState } from 'react';

const ExaminerAvailability = () => {
  const [formData, setFormData] = useState({
    module: '', // Removed 'name' as backend doesn't use it
    date: '',
    availableSlots: [],
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const timeSlots = [
    '9:00 AM - 10:00 AM',
    '10:00 AM - 11:00 AM',
    '11:00 AM - 12:00 PM',
    '1:00 PM - 2:00 PM',
    '2:00 PM - 3:00 PM',
    '3:00 PM - 4:00 PM',
    '4:00 PM - 5:00 PM',
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTimeSlotToggle = (slot) => {
    setFormData(prev => {
      const slots = prev.availableSlots.includes(slot)
        ? prev.availableSlots.filter(s => s !== slot)
        : [...prev.availableSlots, slot];
      return { ...prev, availableSlots: slots };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.module || !formData.date || formData.availableSlots.length === 0) {
      setError('Please fill out all fields and select at least one time slot');
      return;
    }

    try {
      const token = localStorage.getItem('token'); // Retrieve token
      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }

      const response = await fetch('http://localhost:5000/api/examiner/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token, // Add token to headers
        },
        body: JSON.stringify({
          module: formData.module,
          date: formData.date,
          availableSlots: formData.availableSlots,
        }), // Send only fields expected by backend
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      const data = await response.json();
      setSuccess('Availability submitted successfully!');
      console.log('Submitted availability:', data);
      setFormData({
        module: '',
        date: '',
        availableSlots: [],
      });
    } catch (err) {
      setError(err.message);
      console.error('Submission error:', err);
    }
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-8">
            <h1 className="text-3xl font-extrabold text-white text-center">
              Examiner Availability
            </h1>
            <p className="mt-2 text-indigo-100 text-center">
              Schedule your available time slots
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>}
            {success && <div className="p-3 bg-green-100 text-green-700 rounded-lg">{success}</div>}

            <div className="space-y-4">
              <div>
                <label htmlFor="module" className="block text-sm font-semibold text-gray-700">
                  Module
                </label>
                <input
                  type="text"
                  id="module"
                  name="module"
                  required
                  value={formData.module}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border transition duration-150 ease-in-out"
                  placeholder="Enter module name"
                />
              </div>

              <div>
                <label htmlFor="date" className="block text-sm font-semibold text-gray-700">
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  required
                  min={minDate}
                  value={formData.date}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border transition duration-150 ease-in-out"
                />
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Available Time Slots
              </label>
              <div className="grid grid-cols-1 gap-3">
                {timeSlots.map((slot) => (
                  <div
                    key={slot}
                    className={`flex items-center p-3 rounded-lg border transition-all duration-200 ease-in-out cursor-pointer ${
                      formData.availableSlots.includes(slot)
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                    }`}
                    onClick={() => handleTimeSlotToggle(slot)}
                  >
                    <input
                      type="checkbox"
                      id={slot}
                      checked={formData.availableSlots.includes(slot)}
                      onChange={() => {}}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor={slot}
                      className="ml-3 block text-sm text-gray-700 cursor-pointer select-none"
                    >
                      {slot}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-150 ease-in-out transform hover:scale-[1.02]"
            >
              Submit Availability
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ExaminerAvailability;