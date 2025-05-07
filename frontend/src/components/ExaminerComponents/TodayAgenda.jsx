import React from 'react';
import { Clock, Video, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

function TodayAgenda() {
    
  const [meetings, setMeetings] = React.useState([
    {
      id: 1,
      studentName: "Alex Chen",
      topic: "Machine Learning Applications in Healthcare",
      time: "09:00 AM - 09:30 AM",
      meetingLink: "https://meet.edu/abc123",
      status: "completed",
      timestamp: new Date(new Date().setHours(9, 0, 0))
    },
    {
      id: 2,
      studentName: "Maria Garcia",
      topic: "Sustainable Architecture Design Principles",
      time: "10:15 AM - 10:45 AM",
      meetingLink: "https://meet.edu/def456",
      status: "ongoing",
      timestamp: new Date(new Date().setHours(10, 15, 0))
    },
    {
      id: 3,
      studentName: "James Wilson",
      topic: "Analysis of Economic Impact of Pandemic",
      time: "11:30 AM - 12:00 PM",
      meetingLink: "https://meet.edu/ghi789",
      status: "upcoming",
      timestamp: new Date(new Date().setHours(11, 30, 0))
    },
    {
      id: 4,
      studentName: "Sarah Johnson",
      topic: "Quantum Computing and Cryptography",
      time: "02:00 PM - 02:30 PM",
      meetingLink: "https://meet.edu/jkl012",
      status: "upcoming",
      timestamp: new Date(new Date().setHours(14, 0, 0))
    },
    {
      id: 5,
      studentName: "Raj Patel",
      topic: "Advances in Renewable Energy Storage",
      time: "03:45 PM - 04:15 PM",
      meetingLink: "https://meet.edu/mno345",
      status: "upcoming",
      timestamp: new Date(new Date().setHours(15, 45, 0))
    }
  ]);

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'ongoing':
        return <Clock className="h-5 w-5 text-amber-500 animate-pulse" />;
      case 'missed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'upcoming':
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
      default:
        return null;
    }
  };

  const getStatusClass = (status) => {
    switch(status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'ongoing':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'missed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTimeRemaining = (timestamp) => {
    const now = new Date();
    const diff = timestamp - now;
    
    if (diff < 0) return "Started";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const updateMeetingStatus = (id, newStatus) => {
    setMeetings(meetings.map(meeting => 
      meeting.id === id ? {...meeting, status: newStatus} : meeting
    ));
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-4 py-5 sm:px-6 bg-indigo-600">
        <h3 className="text-lg leading-6 font-medium text-white flex items-center">
          <Clock className="mr-2 h-5 w-5" />
          Today's Agenda
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-indigo-100">
          Your scheduled meetings for today
        </p>
      </div>

      <div className="border-t border-gray-200 overflow-x-auto">
        <div className="min-w-full">
          <div className="flex justify-between bg-gray-50 px-6 py-3">
            <div className="w-1/3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Student & Topic
            </div>
            <div className="w-1/4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Time
            </div>
            <div className="w-1/6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </div>
            <div className="w-1/4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </div>
          </div>
          
          <div className="bg-white divide-y divide-gray-200">
            {meetings.length > 0 ? meetings.map((meeting) => (
              <div key={meeting.id} className="px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors duration-150">
                <div className="w-1/3">
                  <div className="text-sm font-medium text-gray-900">{meeting.studentName}</div>
                  <div className="text-sm text-gray-500 truncate max-w-xs">{meeting.topic}</div>
                </div>
                <div className="w-1/4">
                  <div className="text-sm text-gray-900">{meeting.time}</div>
                  {meeting.status !== 'completed' && meeting.status !== 'missed' && (
                    <div className="text-xs text-gray-500">
                      {meeting.status === 'ongoing' ? 'In progress' : `In ${formatTimeRemaining(meeting.timestamp)}`}
                    </div>
                  )}
                </div>
                <div className="w-1/6">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(meeting.status)}`}>
                    <span className="flex items-center">
                      {getStatusIcon(meeting.status)}
                      <span className="ml-1 capitalize">{meeting.status}</span>
                    </span>
                  </span>
                </div>
                <div className="w-1/4 text-right">
                  {(meeting.status === 'ongoing' || meeting.status === 'upcoming') && (
                    <a 
                      href={meeting.meetingLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150 mr-2"
                    >
                      <Video className="h-4 w-4 mr-1" />
                      Join
                    </a>
                  )}
                  
                  <div className="inline-block relative">
                    <select
                      className="appearance-none bg-white border border-gray-300 text-gray-700 py-1 px-3 pr-8 rounded leading-tight focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      value={meeting.status}
                      onChange={(e) => updateMeetingStatus(meeting.id, e.target.value)}
                    >
                      <option value="upcoming">Upcoming</option>
                      <option value="ongoing">Ongoing</option>
                      <option value="completed">Completed</option>
                      <option value="missed">Missed</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              <div className="px-6 py-4 text-center text-gray-500">
                No meetings scheduled for today
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TodayAgenda;