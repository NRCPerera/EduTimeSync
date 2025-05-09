import React, { useState, useEffect } from 'react';
import { Book, Lock, Save } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminHeader from '../../components/AdminHeader';

const EditModule = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchModule();
  }, []);

  const fetchModule = async () => {
    setLoading(true);
    setError(null);

    if (!token) {
      setError('Please log in to edit a module');
      navigate('/sign-in');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/module/all`, {
        headers: {
          'x-auth-token': token,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch module');
      }

      const module = data.data.find((mod) => mod._id === id);
      if (!module) {
        throw new Error('Module not found');
      }

      setFormData({
        code: module.code,
        name: module.name,
        password: module.password,
      });
    } catch (err) {
      setError(err.message);
      console.error('Fetch module error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!token) {
      setError('Please log in to update a module');
      setLoading(false);
      navigate('/sign-in');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/module/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update module');
      }

      setSuccess(`Module ${data.data.code} - ${data.data.name} updated successfully`);
      setTimeout(() => navigate('/module-list'), 2000);
    } catch (err) {
      setError(err.message);
      console.error('Update module error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Edit Module</h1>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden max-w-md mx-auto p-6">
          {loading && !formData.code ? (
            <div className="text-center text-gray-600">Loading module...</div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                  <Book className="h-4 w-4" />
                  Module Code
                </label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                  placeholder="e.g., CS101"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                  <Book className="h-4 w-4" />
                  Module Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                  placeholder="e.g., Introduction to Programming"
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
                  placeholder="Set a password for registration"
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
                  onClick={() => navigate('/module-list')}
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
                  {loading ? 'Updating...' : 'Update Module'}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
};

export default EditModule;