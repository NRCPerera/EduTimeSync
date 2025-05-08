import React, { useState, useEffect } from 'react';
import { CalendarClock, Filter, Users, Clock, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function UpcomingEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterModule, setFilterModule] = useState('all');
  const navigate = useNavigate();

  // Fetch events from backend
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/event/get-events', {
          headers: { 
          'x-auth-token': token,
          'Content-Type': 'application/json'
        }
  });
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }
        const data = await response.json();
        // Transform backend data to match frontend structure
        const transformedData = data.map(event => ({
          id: event._id,
          title: event.title,
          period: event.period,
          module: event.module,
          assignedStudents: event.assignedStudents,
          assignedExaminer: event.examinerIds[0]?.name || 'None',
          meetingDuration: event.meetingDuration,
        }));
        setEvents(transformedData);
      } catch (error) {
        console.error('Error fetching events:', error);
        setError('Failed to load events');
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Filter events based on selected module
  const filteredEvents = filterModule === 'all' 
    ? events 
    : events.filter(event => event.module === filterModule);

  // Derive unique modules from fetched events
  const modules = ['all', ...new Set(events.map(event => event.module))];

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-4 py-5 sm:px-6 bg-indigo-600">
        <h3 className="text-lg leading-6 font-medium text-white flex items-center">
          <CalendarClock className="mr-2 h-5 w-5" />
          Upcoming Events
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-indigo-100">
          Events scheduled for the upcoming weeks
        </p>
      </div>

      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center">
            <Filter className="h-4 w-4 text-gray-500 mr-2" />
            <span className="text-sm font-medium text-gray-700 mr-2">Filter by Module:</span>
            <div className="relative inline-block w-40">
              <select
                className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-1 px-3 pr-8 rounded leading-tight focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                value={filterModule}
                onChange={(e) => setFilterModule(e.target.value)}
              >
                {modules.map((module) => (
                  <option key={module} value={module}>
                    {module === 'all' ? 'All Modules' : module}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        {loading ? (
          <div className="col-span-2 text-center py-8">Loading...</div>
        ) : error ? (
          <div className="col-span-2 text-center py-8 text-red-500">{error}</div>
        ) : filteredEvents.length > 0 ? (
          filteredEvents.map((event) => (
            <div 
              key={event.id}
              className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200"
            >
              <div className="bg-indigo-50 px-4 py-3 border-b border-gray-200">
                <h4 className="text-md font-semibold text-indigo-700 truncate">{event.title}</h4>
                <p className="text-sm text-gray-600">{event.period}</p>
              </div>
              
              <div className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <Users className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="ml-2">
                      <div className="text-xs text-gray-500">Assigned Students</div>
                      <div className="text-sm font-medium text-gray-900">{event.assignedStudents}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <Clock className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="ml-2">
                      <div className="text-xs text-gray-500">Meeting Duration</div>
                      <div className="text-sm font-medium text-gray-900">{event.meetingDuration} mins</div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="text-xs text-gray-500">Module</div>
                  <div className="text-sm font-medium text-gray-900">{event.module}</div>
                </div>
                
                <div className="mt-2">
                  <div className="text-xs text-gray-500">Assigned Examiner</div>
                  <div className="text-sm font-medium text-gray-900">{event.assignedExaminer}</div>
                </div>
                
                <div className="mt-4 flex justify-end">
                  <button onClick={() => navigate('/examiner-schedule')} className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150">
                    Reschedule Event
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 text-center py-8 text-gray-500">
            No events found matching the selected filter
          </div>
        )}
      </div>
    </div>
  );
}

export default UpcomingEvents;