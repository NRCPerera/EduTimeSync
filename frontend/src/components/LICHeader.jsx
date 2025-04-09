import React, { useState } from 'react';
import { Menu, Bell, User, LogOut, Settings, ChevronDown, BookOpen, Calendar, Home, LayoutDashboard, UserPlus } from 'lucide-react';

export default function LICHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <header className="bg-[#2C3E50] text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo & Brand */}
          <div className="flex items-center">
            <BookOpen className="h-8 w-8" />
            <div className="ml-2">
              <div className="text-xl font-bold">EduTimeSync</div>
              <div className="text-xs text-emerald-200">Smarter Scheduling, Seamless Learning</div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <a href="/lic-dashboard" className="hover:text-emerald-200 flex items-center gap-1">
              <Home className="h-4 w-4" />
              Home
            </a>
            <a href="/lic-dashboard" className="hover:text-emerald-200 flex items-center gap-1">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </a>
            <a href="/schedule-event" className="hover:text-emerald-200 flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Create Events
            </a>
            <a href="/filter-availability" className="hover:text-emerald-200 flex items-center gap-1">
              <UserPlus className="h-4 w-4" />
              Assign Examiners
            </a>
            <a href="/reschedule-requests" className="hover:text-emerald-200 flex items-center gap-1">
              <UserPlus className="h-4 w-4" />
              Reschedule Requests
            </a>
            <a href="/notify-page" className="hover:text-emerald-200 flex items-center gap-1">
              <UserPlus className="h-4 w-4" />
              Notify Examiners
            </a>
          </nav>

          {/* User Menu & Notifications */}
          <div className="flex items-center space-x-4">
            <button className="hover:text-emerald-200">
              <Bell className="h-6 w-6" />
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 hover:text-emerald-200"
              >
                <User className="h-6 w-6" />
                <ChevronDown className="h-4 w-4" />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 text-gray-700">
                  <a href="#" className="block px-4 py-2 hover:bg-emerald-50 flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Settings
                  </a>
                  <a href="#" className="block px-4 py-2 hover:bg-emerald-50 flex items-center gap-2">
                    <LogOut className="h-4 w-4" />
                    Logout
                  </a>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4">
            <a href="/lic-dashboard" className="block py-2 hover:text-emerald-200">Home</a>
            <a href="/lic-dashboard" className="block py-2 hover:text-emerald-200">Dashboard</a>
            <a href="/events-page" className="block py-2 hover:text-emerald-200">Create Events</a>
            <a href="/filter-availability" className="block py-2 hover:text-emerald-200">Assign Examiners</a>
          </div>
        )}
      </div>
    </header>
  );
}