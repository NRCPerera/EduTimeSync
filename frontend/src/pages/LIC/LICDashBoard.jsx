import React from 'react'
import LICHeader from '../../components/LICHeader'

function CalendarDay({ date, events, isToday }) {
  return (
    <div className={`h-32 border p-2 ${isToday ? 'bg-blue-50' : ''}`}>
      <div className={`text-sm ${isToday ? 'font-bold text-blue-600' : 'text-gray-500'}`}>
        {format(date, 'd')}
      </div>
      <div className="space-y-1 mt-1">
        {events.map((event, index) => (
          <div
            key={index}
            className="text-xs p-1 rounded truncate"
            style={{ backgroundColor: event.color }}
          >
            {event.title}
          </div>
        ))}
      </div>
    </div>
  );
}

function EventForm({ isOpen, onClose }) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-xl p-6 w-full max-w-md">
          <Dialog.Title className="text-lg font-semibold mb-4">Create New Event</Dialog.Title>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Event Title</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                placeholder="Enter event title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Examiners Required</label>
              <input
                type="number"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                min="1"
              />
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Create Event
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}

// Examiner List Component
function ExaminerList({ examiners }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Available Examiners</h2>
      <div className="space-y-4">
        {examiners.map((examiner, index) => (
          <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                {examiner.name.charAt(0)}
              </div>
              <div>
                <p className="font-medium">{examiner.name}</p>
                <p className="text-sm text-gray-500">{examiner.expertise}</p>
              </div>
            </div>
            <button className="px-3 py-1 text-indigo-600 hover:bg-indigo-50 rounded">
              Assign
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function NotificationCenter({ notifications }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Notifications</h2>
      <div className="space-y-4">
        {notifications.map((notification, index) => (
          <div key={index} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${notification.iconBg}`}>
              {notification.icon}
            </div>
            <div>
              <p className="font-medium">{notification.title}</p>
              <p className="text-sm text-gray-500">{notification.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


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


const LICDashBoard = () => {
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);
  
  // Sample data
  const stats = [
    { title: "Upcoming Events", value: "12", icon: "📅", trend: 8 },
    { title: "Active Examiners", value: "24", icon: "👥", trend: 15 },
    { title: "Pending Reviews", value: "45", icon: "📝", trend: -3 },
    { title: "Success Rate", value: "96%", icon: "⭐", trend: 5 },
  ];

  const examiners = [
    { name: "Dr. Sarah Wilson", expertise: "Software Engineering" },
    { name: "Prof. James Chen", expertise: "Database Systems" },
    { name: "Dr. Emily Brown", expertise: "Web Technologies" },
  ];

  const notifications = [
    {
      icon: "✅",
      iconBg: "bg-green-100 text-green-600",
      title: "Dr. Wilson accepted the examination slot",
      time: "2 minutes ago"
    },
    {
      icon: "⏳",
      iconBg: "bg-yellow-100 text-yellow-600",
      title: "Pending response from 3 examiners",
      time: "1 hour ago"
    },
    {
      icon: "🔄",
      iconBg: "bg-blue-100 text-blue-600",
      title: "Schedule updated for CS301",
      time: "2 hours ago"
    },
  ];

  // Sample calendar events
  const events = [
    { title: "CS301 Final", color: "#E5F6FD" },
    { title: "DB202 Presentation", color: "#FDE7E8" },
  ];
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Welcome, Dr. Thompson</h1>
            <p className="text-gray-500">Lead Instructor Coordinator</p>
          </div>
          <div className="flex space-x-4">
            <button 
              onClick={() => setIsEventFormOpen(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              + Create New Event
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar Section */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Event Calendar</h2>
              <div className="flex space-x-2">
                <button className="p-2 hover:bg-gray-100 rounded">◀</button>
                <span className="p-2 font-medium">March 2025</span>
                <button className="p-2 hover:bg-gray-100 rounded">▶</button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
              {Array.from({ length: 35 }).map((_, index) => (
                <CalendarDay
                  key={index}
                  date={new Date(2025, 2, index + 1)}
                  events={events}
                  isToday={index === 14}
                />
              ))}
            </div>
          </div>

          {/* Sidebar Content */}
          <div className="space-y-8">
            <ExaminerList examiners={examiners} />
            <NotificationCenter notifications={notifications} />
          </div>
        </div>
      </div>

      <EventForm isOpen={isEventFormOpen} onClose={() => setIsEventFormOpen(false)} />
    </div>
  );
}

export default LICDashBoard