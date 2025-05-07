import React, { useState, useEffect } from 'react';
import { Book, Calendar, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminHeader from '../../components/AdminHeader'; // Adjust to your LIC header component

const ModuleList = () => {
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    setLoading(true);
    setError(null);

    if (!token) {
      setError('Please log in to view modules');
      navigate('/sign-in');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/module/all', {
        headers: {
          'x-auth-token': token,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch modules');
      }

      setModules(data.data || []);
    } catch (err) {
      setError(err.message);
      console.error('Fetch modules error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (moduleId) => {
    if (!window.confirm('Are you sure you want to delete this module?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/module/${moduleId}`, {
        method: 'DELETE',
        headers: {
          'x-auth-token': token,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete module');
      }

      // Refresh module list after deletion
      setModules(modules.filter((module) => module._id !== moduleId));
    } catch (err) {
      setError(err.message);
      console.error('Delete module error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">All Modules</h1>
          <button
            onClick={() => navigate('/create-module')}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
          >
            Create Module
          </button>
        </div>

        {loading ? (
          <div className="text-center text-gray-600">Loading modules...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : modules.length === 0 ? (
          <div className="text-center text-gray-600">No modules found</div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="divide-y divide-gray-200">
              {modules.map((module) => (
                <div key={module._id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{module.code} - {module.name}</h3>
                      <p className="text-sm text-gray-600">Password: {module.password}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/edit-module/${module._id}`)}
                        className="p-2 text-gray-600 hover:text-indigo-600"
                        title="Edit Module"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(module._id)}
                        className="p-2 text-gray-600 hover:text-red-600"
                        title="Delete Module"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span className="text-sm">
                      Created on {new Date(module.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ModuleList;