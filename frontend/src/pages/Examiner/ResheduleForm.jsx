import React from "react";
import { X } from "lucide-react";

const RescheduleForm = ({ selectedExam, rescheduleForm, setRescheduleForm, handleCloseModal, handleSubmitReschedule }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Reschedule Exam</h3>
          <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-500 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmitReschedule} className="p-6">
          <div className="space-y-6">
            {/* Current Exam Details */}
            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="font-medium text-gray-900 mb-2">Current Schedule</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Subject:</span>
                  <p className="font-medium">{selectedExam.subject}</p>
                </div>
                <div>
                  <span className="text-gray-500">Type:</span>
                  <p className="font-medium">{selectedExam.type}</p>
                </div>
                <div>
                  <span className="text-gray-500">Current Date:</span>
                  <p className="font-medium">{selectedExam.date}</p>
                </div>
                <div>
                  <span className="text-gray-500">Current Time:</span>
                  <p className="font-medium">{selectedExam.time}</p>
                </div>
              </div>
            </div>

            {/* New Schedule */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New Date</label>
              <input
                type="date"
                value={rescheduleForm.newDate}
                onChange={(e) => setRescheduleForm({ ...rescheduleForm, newDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New Time</label>
              <input
                type="time"
                value={rescheduleForm.newTime}
                onChange={(e) => setRescheduleForm({ ...rescheduleForm, newTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Rescheduling</label>
              <textarea
                value={rescheduleForm.reason}
                onChange={(e) => setRescheduleForm({ ...rescheduleForm, reason: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Please provide a reason for rescheduling..."
                required
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Confirm Reschedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RescheduleForm;
