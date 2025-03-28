import React, { useState } from 'react';
import { X } from 'lucide-react';

// Helper function to convert 12-hour time (e.g., "11:00 AM") to 24-hour format (e.g., "11:00" or "23:00")
const convertTo24Hour = (time12h) => {
  const [time, period] = time12h.split(' ');
  let [hours, minutes] = time.split(':');
  hours = parseInt(hours, 10);
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  return `${hours.toString().padStart(2, '0')}:${minutes}`;
};

const RescheduleForm = ({ selectedExam, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    examId: selectedExam._id,
    newDate: selectedExam.scheduledTime.date,
    newStartTime: convertTo24Hour(selectedExam.scheduledTime.startTime),
    newEndTime: convertTo24Hour(selectedExam.scheduledTime.endTime),
    reason: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Reschedule Examination</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-900">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Module</label>
            <input
              type="text"
              value={selectedExam.module}
              disabled
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Current Date</label>
            <input
              type="text"
              value={selectedExam.scheduledTime.date}
              disabled
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Current Time</label>
            <input
              type="text"
              value={`${selectedExam.scheduledTime.startTime} - ${selectedExam.scheduledTime.endTime}`}
              disabled
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">New Date</label>
            <input
              type="date"
              name="newDate"
              value={formData.newDate}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">New Start Time (24-hour)</label>
              <input
                type="time"
                name="newStartTime"
                value={formData.newStartTime}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">New End Time (24-hour)</label>
              <input
                type="time"
                name="newEndTime"
                value={formData.newEndTime}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Reason for Rescheduling</label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              rows="3"
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RescheduleForm;