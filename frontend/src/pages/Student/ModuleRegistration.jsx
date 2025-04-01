import { useState } from 'react';
import { Navigate } from 'react-router-dom';

const ModuleRegistration = () => {
  const [formData, setFormData] = useState({
    moduleCode: '',
    password: '',
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.moduleCode || !formData.password) {
      setError('Please fill out all fields');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setError('You must be logged in to register for a module');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/modules/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      setSuccess(`Successfully registered for ${data.data.moduleName} (${data.data.moduleCode})!`);
      console.log('Registration response:', data);
      setFormData({
        moduleCode: '',
        password: '',
      });
    } catch (err) {
      setError(err.message);
      console.error('Registration error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-8">
            <h1 className="text-3xl font-extrabold text-white text-center">
              Module Registration
            </h1>
            <p className="mt-2 text-indigo-100 text-center">
              Register for a module with your code and password
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>}
            {success && <div className="p-3 bg-green-100 text-green-700 rounded-lg">{success}</div>}

            <div className="space-y-4">
              <div>
                <label htmlFor="moduleCode" className="block text-sm font-semibold text-gray-700">
                  Module Code
                </label>
                <input
                  type="text"
                  id="moduleCode"
                  name="moduleCode"
                  required
                  value={formData.moduleCode}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border transition duration-150 ease-in-out"
                  placeholder="e.g., CS101"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                  Module Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border transition duration-150 ease-in-out"
                  placeholder="Enter module password"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-150 ease-in-out transform hover:scale-[1.02]"
            >
              Register for Module
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ModuleRegistration;