import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Save, PlusCircle } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { startOfWeek } from 'date-fns';

// Function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

function AvailabilityManager() {
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const timeSlots = [
    '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
    '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM'
  ];

  const [availability, setAvailability] = useState({
    Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: []
  });
  const [selectedWeekStart, setSelectedWeekStart] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [aiSuggestionsVisible, setAiSuggestionsVisible] = useState(false);

  // AI Suggestions
  const aiSuggestions = [
    { day: 'Monday', slots: ['11:00 AM', '11:30 AM'] },
    { day: 'Wednesday', slots: ['10:00 AM', '10:30 AM'] },
    { day: 'Friday', slots: ['3:00 PM', '3:30 PM'] }
  ];

  useEffect(() => {
    const today = new Date();
    const currentMonday = startOfWeek(today, { weekStartsOn: 1 });
    setSelectedWeekStart(currentMonday);
    fetchAvailabilityForWeek(currentMonday);
  }, []);

  const fetchAvailabilityForWeek = async (date) => {
    try {
      const token = getAuthToken();
      if (!token) {
        console.warn('No authentication token found');
        setAvailability({
          Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: []
        });
        return;
      }
      const response = await fetch(`http://localhost:5000/api/examiner/get-examiners-availability?weekStart=${date.toISOString().split('T')[0]}`, {
        headers: {
          'x-auth-token': token,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch availability');
      const data = await response.json();
      setAvailability(data.availability || {
        Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: []
      });
    } catch (error) {
      console.error('Error fetching availability:', error);
      setAvailability({
        Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: []
      });
    }
  };

  const handleDateChange = (date) => {
    if (date) {
      setSelectedWeekStart(date);
      fetchAvailabilityForWeek(date);
    }
  };

  const handleSaveAvailability = async () => {
    if (!selectedWeekStart) {
      alert('Please select a week first.');
      return;
    }
    const token = getAuthToken();
    if (!token) {
      alert('Please log in to save availability.');
      return;
    }
    try {
      console.log(token);
      const response = await fetch('http://localhost:5000/api/examiner/availability', {
        method: 'POST',
        headers: {
          'x-auth-token': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          weekStart: selectedWeekStart.toISOString().split('T')[0],
          availability: availability
        })
      });
      if (!response.ok) throw new Error('Failed to save availability');
      alert('Availability saved successfully');
    } catch (error) {
      console.error('Error saving availability:', error);
      alert('Failed to save availability');
    }

  };
   
  const toggleTimeSlot = (day, time) => {
    setAvailability(prev => {
      const daySlots = [...(prev[day] || [])];
      if (daySlots.includes(time)) {
        return {
          ...prev,
          [day]: daySlots.filter(slot => slot !== time)
        };
      } else {
        return {
          ...prev,
          [day]: [...daySlots, time].sort((a, b) => timeSlots.indexOf(a) - timeSlots.indexOf(b))
        };
      }
    });
  };

  const addSuggestedSlots = (day, slots) => {
    setAvailability(prev => {
      const daySlots = [...(prev[day] || [])];
      const newSlots = [...new Set([...daySlots, ...slots])].sort((a, b) => {
        return timeSlots.indexOf(a) - timeSlots.indexOf(b);
      });
      return {
        ...prev,
        [day]: newSlots
      };
    });
    setAiSuggestionsVisible(false);
  };

  const getWeekDates = (start) => {
    if (!start) return Array(5).fill(null);
    const dates = [];
    for (let i = 0; i < 5; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = selectedWeekStart ? getWeekDates(selectedWeekStart) : Array(5).fill(null);

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-4 py-5 sm:px-6 bg-indigo-600">
        <h3 className="text-lg leading-6 font-medium text-white flex items-center">
          <Calendar className="mr-2 h-5 w-5" />
          Availability Manager
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-indigo-100">
          Set your available time slots for student meetings
        </p>
      </div>

      <div className="p-6">
        <div className="mb-6">
          <label htmlFor="weekStart" className="block text-sm font-medium text-gray-700">Select Week (Monday)</label>
          <DatePicker
            selected={selectedWeekStart}
            onChange={handleDateChange}
            filterDate={(date) => date.getDay() === 1} // Only allow Mondays
            dateFormat="yyyy-MM-dd"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        {selectedWeekStart && (
          <p className="text-sm text-gray-700 mb-4">
            Availability for week starting {selectedWeekStart.toDateString()}
          </p>
        )}

        <div className="flex justify-between mb-6">
          <button
            onClick={() => setAiSuggestionsVisible(!aiSuggestionsVisible)}
            className={`inline-flex items-center px-4 py-2 border ${
              aiSuggestionsVisible ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-300 bg-white text-gray-700'
            } text-sm font-medium rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150`}
          >
            <span className={`${aiSuggestionsVisible ? 'text-emerald-500' : 'text-indigo-500'} mr-2`}>AI</span>
            {aiSuggestionsVisible ? 'Hide Suggestions' : 'Show AI Suggestions'}
          </button>

          <button
            onClick={handleSaveAvailability}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors duration-150"
          >
            <Save className="h-4 w-4 mr-1" />
            Save Changes
          </button>
        </div>

        {aiSuggestionsVisible && (
          <div className="mb-6 bg-emerald-50 border border-emerald-100 rounded-md p-4">
            <h4 className="text-sm font-medium text-emerald-800 mb-2">AI-Suggested Time Slots</h4>
            <p className="text-xs text-emerald-600 mb-3">Based on your previous patterns and student availability</p>
            <div className="space-y-3">
              {aiSuggestions.map((suggestion, idx) => (
                <div key={idx} className="flex items-center justify-between bg-white p-3 rounded border border-emerald-200">
                  <div>
                    <span className="text-sm font-medium text-gray-700">{suggestion.day}: </span>
                    <span className="text-sm text-gray-500">{suggestion.slots.join(', ')}</span>
                  </div>
                  <button
                    onClick={() => addSuggestedSlots(suggestion.day, suggestion.slots)}
                    className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-emerald-500 hover:bg-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <PlusCircle className="h-3 w-3 mr-1" />
                    Add
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time / Day
                </th>
                {daysOfWeek.map((day, index) => (
                  <th key={day} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {weekDates[index] ? `${day.substring(0,3)}, ${weekDates[index].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {timeSlots.map(time => (
                <tr key={time} className="hover:bg-gray-50">
                  <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-gray-400 mr-2" />
                      {time}
                    </div>
                  </td>
                  {daysOfWeek.map(day => {
                    const isAvailable = availability[day]?.includes(time);
                    return (
                      <td
                        key={`${day}-${time}`}
                        className="px-6 py-2 whitespace-nowrap text-sm text-gray-500"
                        onMouseDown={() => {
                          setIsSelecting(true);
                          toggleTimeSlot(day, time);
                        }}
                        onMouseUp={() => setIsSelecting(false)}
                        onMouseEnter={() => {
                          if (isSelecting) {
                            toggleTimeSlot(day, time);
                          }
                        }}
                      >
                        <div
                          className={`h-6 w-6 rounded-md cursor-pointer transition-all duration-200 ${
                            isAvailable
                              ? 'bg-indigo-500 hover:bg-indigo-600'
                              : 'bg-gray-200 hover:bg-gray-300'
                          }`}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 text-sm text-gray-500">
          <p>Drag to select multiple time slots. Click on a time slot to toggle availability.</p>
        </div>
      </div>
    </div>
  );
}

export default AvailabilityManager;