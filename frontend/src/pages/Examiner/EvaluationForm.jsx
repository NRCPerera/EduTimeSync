import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';

const EvaluationForm = ({ selectedSchedule, examinerId, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    grade: '',
    presentation: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchEvaluation = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:5000/api/evaluations/schedule?scheduleId=${selectedSchedule._id}&examinerId=${examinerId}`,
          {
            headers: {
              'x-auth-token': token,
            },
          }
        );

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch evaluation');
        }

        setFormData({
          grade: data.grade || '',
          presentation: data.presentation || '',
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvaluation();
  }, [selectedSchedule, examinerId, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.grade || formData.grade < 0 || formData.grade > 100) {
      setError('Please enter a valid grade between 0 and 100');
      return;
    }

    try {
      const evaluationData = {
        examinerId,
        evaluations: [{
          studentId: selectedSchedule.studentId._id,
          scheduleId: selectedSchedule._id,
          module: selectedSchedule.module,
          grade: Number(formData.grade),
          presentation: formData.presentation,
        }],
      };

      const response = await fetch('http://localhost:5000/api/evaluations/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify(evaluationData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit evaluation');
      }

      onSubmit();
      onClose();
      alert('Evaluation submitted successfully!');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Evaluate Student</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="text-center text-gray-600">Loading evaluation data...</div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Student: {selectedSchedule.studentId?.email}
              </label>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Module: {selectedSchedule.module}
              </label>
            </div>

            <div className="mb-4">
              <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-1">
                Grade (0-100)
              </label>
              <input
                type="number"
                id="grade"
                name="grade"
                value={formData.grade}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
                min="0"
                max="100"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="presentation" className="block text-sm font-medium text-gray-700 mb-1">
                Presentation Notes
              </label>
              <textarea
                id="presentation"
                name="presentation"
                value={formData.presentation}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows="4"
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
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Save Evaluation
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EvaluationForm;