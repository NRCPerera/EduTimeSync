import React, { useState, useEffect } from 'react';
import { Book, Calendar } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">All Modules</h1>
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