import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, Users, Video, ChevronLeft, ChevronRight } from 'lucide-react';
import StudentHeader from '../../components/StudentHeader';

const StudentSchedule = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [examSchedule, setExamSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Assume we have a token stored from login
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchSchedules();
  }, [currentMonth]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:5000/api/schedule?month=${currentMonth.getMonth() + 1}&year=${currentMonth.getFullYear()}`,
        {
          headers: {
            'x-auth-token': token
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch schedules');
      }
      
      const data = await response.json();
      setExamSchedule(data.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentHeader />
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Examination Schedule</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <CalendarIcon className="h-6 w-6 text-gray-500" />
            <h2 className="text-xl font-semibold">
              {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handlePreviousMonth}
              className="p-2 hover:bg-gray-100 rounded-full"
              disabled={loading}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-gray-100 rounded-full"
              disabled={loading}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-center">Loading schedules...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : examSchedule.length === 0 ? (
          <p className="text-center">No schedules found for this month</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {examSchedule.map(exam => (
              <div key={exam._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">{exam.subject}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    exam.mode === 'Online' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {exam.mode}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <CalendarIcon className="h-5 w-5 mr-3" />
                    <span>{new Date(exam.date).toLocaleDateString('default', { 
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-5 w-5 mr-3" />
                    <span>{exam.time} ({exam.duration})</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-5 w-5 mr-3" />
                    <span>{exam.location}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <Users className="h-5 w-5 mr-3" />
                    <span>{exam.participants} participants</span>
                  </div>

                  <div className="pt-4 mt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-500">Examiner: {exam.examiner}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentSchedule;