import React, { useState } from 'react';
import { Lock, Book, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StudentHeader from '../../components/StudentHeader';

const StudentModuleRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    moduleCode: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const token = localStorage.getItem('token');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!token) {
      setError('Please log in to register for a module');
      setLoading(false);
      navigate('/sign-in');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/modules/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({
          moduleCode: formData.moduleCode,
          password: formData.password,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to register for module');
      }

      setSuccess(`Successfully registered for ${data.data.moduleName} (${data.data.moduleCode})`);
      setFormData({ moduleCode: '', password: '' });
    } catch (err) {
      setError(err.message);
      console.error('Register module error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentHeader />
      
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Register for a Module</h1>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden max-w-md mx-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                <Book className="h-4 w-4" />
                Module Code
              </label>
              <input
                type="text"
                name="moduleCode"
                value={formData.moduleCode}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                placeholder="e.g., CS101"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                <Lock className="h-4 w-4" />
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                placeholder="Enter module password"
                required
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}
            {success && (
              <div className="text-green-500 text-sm text-center">{success}</div>
            )}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => navigate('/student-dashboard')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
                disabled={loading}
              >
                {loading ? 'Registering...' : 'Register'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default StudentModuleRegister;