import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentHeader from '../../components/StudentHeader';

const DashBoard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchUserDetails = async () => {
      setLoading(true);
      setError(null);

      if (!token) {
        setError('Please log in to view your dashboard');
        setLoading(false);
        navigate('/login');
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/api/users/me', {
          headers: {
            'x-auth-token': token,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch user details');
        }

        const data = await response.json();
        setUser(data.user);
      } catch (err) {
        setError(err.message);
        if (err.message.includes('Token')) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [navigate, token]);

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentHeader />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>

        {loading ? (
          <p className="text-center text-gray-600">Loading your details...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : user ? (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Welcome, {user.name}!</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">
                  <span className="font-medium">Email:</span> {user.email}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Role:</span> {user.role}
                </p>
              </div>
              <div>
                <p className="text-gray-600">
                  <span className="font-medium">NIC:</span> {user.nic}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Phone Number:</span> {user.phoneNumber}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Address:</span> {user.address}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-600">No user data available</p>
        )}
      </main>
    </div>
  );
};


export default DashBoard