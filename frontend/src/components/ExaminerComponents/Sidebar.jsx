import React from 'react';
import { Home, Calendar, Users, BarChart3, Settings, LogOut } from 'lucide-react';

function Sidebar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'dashboard', name: 'Dashboard', icon: Home },
    { id: 'availability', name: 'Availability', icon: Calendar },
    { id: 'evaluation', name: 'Evaluation', icon: Users },
    { id: 'insights', name: 'Insights', icon: BarChart3 },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center h-16 flex-shrink-0 px-4 bg-indigo-800">
        <h1 className="text-xl font-bold text-white">EduTimeSync</h1>
      </div>
      <div className="h-0 flex-1 flex flex-col overflow-y-auto">
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navItems.map((item) => (
            <a
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`${
                activeTab === item.id
                  ? 'bg-indigo-800 text-white'
                  : 'text-indigo-100 hover:bg-indigo-600'
              } group flex items-center px-2 py-2 text-base font-medium rounded-md cursor-pointer transition-colors duration-150`}
            >
              <item.icon
                className={`${
                  activeTab === item.id ? 'text-white' : 'text-indigo-300 group-hover:text-white'
                } mr-3 flex-shrink-0 h-6 w-6`}
              />
              {item.name}
            </a>
          ))}
        </nav>
      </div>
      <div className="flex-shrink-0 flex border-t border-indigo-800 p-4">
        <a
          href="#"
          className="flex-shrink-0 w-full group block text-indigo-100 hover:bg-indigo-600 px-2 py-2 rounded-md"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <LogOut className="h-6 w-6 text-indigo-300 group-hover:text-white" />
            </div>
            <div className="ml-3">
              <p className="text-base font-medium">Sign Out</p>
            </div>
          </div>
        </a>
      </div>
    </div>
  );
}

export default Sidebar;