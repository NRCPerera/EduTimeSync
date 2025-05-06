import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, X, AlertCircle } from 'lucide-react';

const RescheduleForm = ({ selectedExam, onClose, onSubmit, error }) => {
  const examStartTime = selectedExam.startTime ? new Date(selectedExam.startTime) : new Date();
  const examEndTime = selectedExam.endTime ? new Date(selectedExam.endTime) : new Date();
  
  const defaultDate = examStartTime.toISOString().split('T')[0];
  const defaultStartTime = examStartTime.toTimeString().slice(0, 5);
  const defaultEndTime = examEndTime.toTimeString().slice(0, 5);

  const [formData, setFormData] = useState({
    examId: selectedExam._id,
    newDate: defaultDate,
    newStartTime: defaultStartTime,
    newEndTime: defaultEndTime,
    reason: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Basic validation
    if (!formData.newDate || !formData.newStartTime || !formData.newEndTime || !formData.reason) {
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Reschedule Examination</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="m-4 p-3 rounded-md bg-red-50 text-red-500 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Current Details</h4>
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="flex items-center gap-3 mb-2">
                <CalendarIcon className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {examStartTime.toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {examStartTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                  {examEndTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="newDate" className="block text-sm font-medium text-gray-700 mb-1">
                New Date
              </label>
              <input
                type="date"
                id="newDate"
                name="newDate"
                value={formData.newDate}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="newStartTime" className="block text-sm font-medium text-gray-700 mb-1">
                  New Start Time
                </label>
                <input
                  type="time"
                  id="newStartTime"
                  name="newStartTime"
                  value={formData.newStartTime}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="newEndTime" className="block text-sm font-medium text-gray-700 mb-1">
                  New End Time
                </label>
                <input
                  type="time"
                  id="newEndTime"
                  name="newEndTime"
                  value={formData.newEndTime}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Rescheduling
              </label>
              <textarea
                id="reason"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                rows={3}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Please explain why you need to reschedule this examination..."
                required
              />
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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