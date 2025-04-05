import React, { useState } from 'react';
import { X } from 'lucide-react';

// Helper function to convert ISO time to 24-hour format (e.g., "2025-04-02T09:00:00.000Z" to "09:00")
const convertTo24Hour = (isoTime) => {
  if (!isoTime) return '';
  const date = new Date(isoTime);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
};

const RescheduleForm = ({ selectedExam, onClose, onSubmit }) => {

  const date = selectedExam?.startTime ? new Date(selectedExam.startTime).toISOString().split('T')[0] : '';
  const startTime = selectedExam?.startTime ? convertTo24Hour(selectedExam.startTime) : '';
  const endTime = selectedExam?.endTime ? convertTo24Hour(selectedExam.endTime) : '';

  const [formData, setFormData] = useState({
    examId: selectedExam?._id || '',
    newDate: date,
    newStartTime: startTime,
    newEndTime: endTime,
    reason: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!selectedExam || !selectedExam._id) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Reschedule Examination</h2>
            <button onClick={onClose} className="text-gray-600 hover:text-gray-900">
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="text-red-500">Invalid exam data. Please try again.</p>
        </div>
      </div>
    );
  }

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
              value={selectedExam.module || 'N/A'}
              disabled
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Current Date</label>
            <input
              type="text"
              value={date || 'N/A'}
              disabled
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Current Time</label>
            <input
              type="text"
              value={startTime && endTime ? `${startTime} - ${endTime}` : 'N/A'}
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