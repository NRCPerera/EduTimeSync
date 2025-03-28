import React, { useState } from 'react'
import AdminHeader from '../../components/AdminHeader'

function StatCard({ title, value, icon, trend }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <div className="flex justify-between items-start mb-4">
        <div className="text-2xl text-gray-400">{icon}</div>
        {trend && (
          <span className={`px-2 py-1 rounded text-sm ${
            trend > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
          }`}>
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
          <div key={index} className="flex items-start space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
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
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          Add Module
        </button>
      </div>
      <div className="space-y-4">
        {modules.map((module, index) => (
          <div key={index} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors">
            <div>
              <h3 className="font-medium text-gray-800">{module.name}</h3>
              <p className="text-gray-500 text-sm">{module.students} students • {module.examiners} examiners</p>
            </div>
            <button className="text-indigo-600 hover:text-indigo-800">
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

  // Sample data
  const stats = [
    { title: "Total Users", value: "2,451", icon: "👥", trend: 12 },
    { title: "Active Events", value: "85", icon: "📅", trend: -5 },
    { title: "Pending Requests", value: "12", icon: "⏳", trend: 8 },
    { title: "System Uptime", value: "99.9%", icon: "⚡", trend: 2 },
  ];

  const activities = [
    {
      icon: "👤",
      iconBg: "bg-blue-100 text-blue-600",
      title: "New examiner registered",
      time: "2 minutes ago"
    },
    {
      icon: "📚",
      iconBg: "bg-green-100 text-green-600",
      title: "Module CS301 schedule updated",
      time: "1 hour ago"
    },
    {
      icon: "🔔",
      iconBg: "bg-yellow-100 text-yellow-600",
      title: "Rescheduling request received",
      time: "3 hours ago"
    },
  ];

  const modules = [
    {
      name: "Advanced Software Engineering",
      students: 45,
      examiners: 3
    },
    {
      name: "Database Systems",
      students: 60,
      examiners: 4
    },
    {
      name: "Web Technologies",
      students: 55,
      examiners: 3
    },
  ];

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
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
              + New Module
            </button>
          </div>
        </div>

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
      </div>
    </div>
  );
}

export default AdminDashBoard
