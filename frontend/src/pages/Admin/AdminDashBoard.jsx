/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminHeader from '../../components/AdminHeader';
import { Users, Calendar, Clock, Zap } from 'lucide-react';

function StatCard({ title, value, icon, trend }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <div className="flex justify-between items-start mb-4">
        <div className="text-2xl text-gray-400">{icon}</div>
        {trend !== null && (
          <span
            className={`px-2 py-1 rounded text-sm ${
              trend > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
            }`}
          >
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <h3 className="text-gray-500 text-sm">{title}</h3>
      <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
    </div>
  );
}

function ActivityLog({ activities }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Recent Activities</h2>
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div
            key={index}
            className="flex items-start space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activity.iconBg}`}>
              {activity.icon}
            </div>
            <div>
              <p className="text-gray-800 font-medium">{activity.title}</p>
              <p className="text-gray-500 text-sm">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ModuleList({ modules }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Active Modules</h2>
        <button
          onClick={() => window.location.href = '/create-module'}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Add Module
        </button>
      </div>
      <div className="space-y-4">
        {modules.map((module) => (
          <div
            key={module._id}
            className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div>
              <h3 className="font-medium text-gray-800">{module.code} - {module.name}</h3>
              <p className="text-gray-500 text-sm">{module.studentCount || 0} students • {module.examinerCount || 0} examiners</p>
            </div>
            <button
              onClick={() => window.location.href = `/edit-module/${module._id}`}
              className="text-indigo-600 hover:text-indigo-800"
            >
              Manage →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

const AdminDashBoard = () => {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [stats, setStats] = useState([]);
  const [modules, setModules] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      if (!token) {
        setError('Please log in as an admin');
        navigate('/sign-in');
        return;
      }

      try {
        // Fetch Users
        const usersResponse = await fetch('http://localhost:5000/api/users/lics-examiners', {
          headers: {
            'x-auth-token': token,
          },
        });
        if (!usersResponse.ok) {
          throw new Error('Failed to fetch users');
        }
        const usersData = await usersResponse.json();
        const users = usersData.data || [];

        // Fetch Modules
        const modulesResponse = await fetch('http://localhost:5000/api/module/all', {
          headers: {
            'x-auth-token': token,
          },
        });
        if (!modulesResponse.ok) {
          throw new Error('Failed to fetch modules');
        }
        const modulesData = await modulesResponse.json();
        let modules = modulesData.data || [];

        // Fetch Module Registrations to count students per module
        const registrationsResponse = await fetch('http://localhost:5000/api/users/student-registrations', {
          headers: {
            'x-auth-token': token,
          },
        });
        if (!registrationsResponse.ok) {
          throw new Error('Failed to fetch registrations');
        }
        const registrationsData = await registrationsResponse.json();
        const registrations = registrationsData.data || [];

        // Count students per module
        modules = modules.map((module) => {
          const studentCount = registrations.filter((reg) => reg.moduleCode === module.code).length;
          return { ...module, studentCount, examinerCount: 0 }; // Assuming examinerCount needs backend support
        });

        // Generate Activities (simulated from module creations)
        const simulatedActivities = modules
          .map((module) => ({
            icon: '📚',
            iconBg: 'bg-green-100 text-green-600',
            title: `Module ${module.code} created`,
            time: new Date(module.createdAt).toLocaleString(),
          }))
          .sort((a, b) => new Date(b.time) - new Date(a.time))
          .slice(0, 5);

        // Update Stats
        const newStats = [
          { title: 'Total Users', value: users.length.toString(), icon: <Users />, trend: 12 },
          { title: 'Active Modules', value: modules.length.toString(), icon: <Calendar />, trend: -5 },
          { title: 'Pending Requests', value: '0', icon: <Clock />, trend: 8 }, // Placeholder
          { title: 'System Uptime', value: '99.9%', icon: <Zap />, trend: 2 },
        ];

        setStats(newStats);
        setModules(modules);
        setActivities(simulatedActivities);
      } catch (err) {
        setError(err.message);
        if (err.message.includes('denied')) {
          navigate('/sign-in');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, token]);

  return (
    <div>
      <AdminHeader />
      <div className="ml-15 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Welcome, Admin</h1>
            <p className="text-gray-500">Here's what's happening in your system</p>
          </div>
          <div className="flex space-x-4">
            <button className="px-4 py-2 bg-white text-gray-600 rounded-lg border hover:bg-gray-50 transition-colors">
              Generate Report
            </button>
            <button
              onClick={() => navigate('/create-module')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              + New Module
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-center text-gray-600">Loading dashboard...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => (
                <StatCard key={index} {...stat} />
              ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <ModuleList modules={modules} />
              <ActivityLog activities={activities} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashBoard;