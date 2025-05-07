import React, { useState, useEffect } from 'react';
import { Bell, AlertCircle, Calendar, Clock, CheckCircle, X } from 'lucide-react';

function NotificationCenter() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'urgent',
      title: 'Meeting Rescheduled',
      message: 'James Wilson requested to reschedule his meeting from 11:30 AM to 2:00 PM tomorrow.',
      time: '10 minutes ago',
      read: false,
      action: 'respond'
    },
    {
      id: 2,
      type: 'reminder',
      title: 'Upcoming Meeting',
      message: 'Your meeting with Maria Garcia is starting in 15 minutes.',
      time: '15 minutes ago',
      read: false,
      action: 'join'
    },
    {
      id: 3,
      type: 'system',
      title: 'New Event Assigned',
      message: 'You have been assigned to "Database Systems Project Evaluation" by the administrator.',
      time: '2 hours ago',
      read: true,
      action: 'view'
    },
    {
      id: 4,
      type: 'reminder',
      title: 'Evaluation Deadline',
      message: 'Final Year Project evaluations are due in 2 days.',
      time: '5 hours ago',
      read: true,
      action: 'complete'
    },
    {
      id: 5,
      type: 'system',
      title: 'System Maintenance',
      message: 'The system will be unavailable on Sunday, May 18 from 2 AM to 4 AM for scheduled maintenance.',
      time: '1 day ago',
      read: true,
      action: null
    }
  ]);

  const markAsRead = (id) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? {...notification, read: true} : notification
    ));
  };

  const dismissNotification = (id) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'urgent':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'reminder':
        return <Clock className="h-5 w-5 text-amber-500" />;
      case 'system':
        return <Bell className="h-5 w-5 text-blue-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getActionButton = (action, notificationId) => {
    switch(action) {
      case 'respond':
        return (
          <button 
            className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150"
            onClick={() => markAsRead(notificationId)}
          >
            Respond
          </button>
        );
      case 'join':
        return (
          <button 
            className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors duration-150"
            onClick={() => markAsRead(notificationId)}
          >
            Join Now
          </button>
        );
      case 'view':
        return (
          <button 
            className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150"
            onClick={() => markAsRead(notificationId)}
          >
            View
          </button>
        );
      case 'complete':
        return (
          <button 
            className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
            onClick={() => markAsRead(notificationId)}
          >
            Complete
          </button>
        );
      default:
        return null;
    }
  };

  const getNotificationClass = (type, read) => {
    let baseClass = "px-4 py-3 border-l-4 flex items-start justify-between";
    if (read) {
      baseClass += " bg-white";
    } else {
      baseClass += " bg-indigo-50";
    }
    
    switch(type) {
      case 'urgent':
        return `${baseClass} border-red-500`;
      case 'reminder':
        return `${baseClass} border-amber-500`;
      case 'system':
        return `${baseClass} border-blue-500`;
      default:
        return `${baseClass} border-gray-300`;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden h-full">
      <div className="px-4 py-5 bg-indigo-600 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-white flex items-center">
            <Bell className="mr-2 h-5 w-5" />
            Notifications
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-indigo-100">
            Stay updated with alerts and reminders
          </p>
        </div>
        <div className="relative">
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-xs text-white justify-center items-center">
              {notifications.filter(n => !n.read).length}
            </span>
          </span>
        </div>
      </div>
      
      <div className="max-h-[400px] overflow-y-auto">
        {notifications.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {notifications.map((notification) => (
              <div key={notification.id} className={getNotificationClass(notification.type, notification.read)}>
                <div className="flex-1 flex">
                  <div className="flex-shrink-0 mt-0.5 mr-3">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between">
                      <h4 className="text-sm font-medium text-gray-900">
                        {notification.title}
                      </h4>
                      <p className="text-xs text-gray-500">{notification.time}</p>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {notification.message}
                    </p>
                    
                    {notification.action && (
                      <div className="mt-2">
                        {getActionButton(notification.action, notification.id)}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="ml-3 flex-shrink-0">
                  <button 
                    className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    onClick={() => dismissNotification(notification.id)}
                  >
                    <span className="sr-only">Dismiss</span>
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p>No new notifications</p>
          </div>
        )}
      </div>
      
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-right">
        <button className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
          Mark all as read
        </button>
      </div>
    </div>
  );
}

export default NotificationCenter;