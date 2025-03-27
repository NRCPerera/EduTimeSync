import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, Users, Video, ChevronLeft, ChevronRight, CalendarRange } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ExaminerHeader from '../../components/ExaminerHeader';
import RescheduleForm from './ResheduleForm';

const ExaminerSchedule = () => {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [rescheduleForm, setRescheduleForm] = useState({
    examId: '',
    newDate: '',
    newTime: '',
    reason: '',
  });
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchSchedules();
  }, [currentMonth]);

  const fetchSchedules = async () => {
    setLoading(true);
    setError(null);

    if (!token) {
      setError('Please log in to view your schedules');
      setLoading(false);
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/schedule/examiner?month=${currentMonth.getMonth() + 1}&year=${currentMonth.getFullYear()}`,
        {
          headers: {
            'x-auth-token': token,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSchedules(data.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch your schedules');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1));
  };

  const handleReschedule = (exam) => {
    setSelectedExam(exam);
    setRescheduleForm({
      examId: exam._id,
      newDate: exam.scheduledTime.date,
      newTime: exam.scheduledTime.startTime,
      reason: '',
    });
    setIsRescheduleModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ExaminerHeader />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex gap-2">
            <button onClick={handlePreviousMonth} className="p-2 hover:bg-gray-100 rounded-full" disabled={loading}>
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 rounded-full" disabled={loading}>
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Your Upcoming Examinations</h3>
          </div>
          {loading ? (
            <div className="p-6 text-center text-gray-600">Loading your schedules...</div>
          ) : error ? (
            <div className="p-6 text-center text-red-500">{error}</div>
          ) : schedules.length === 0 ? (
            <div className="p-6 text-center text-gray-600">No schedules found for this month</div>
          ) : (
            <div className="divide-y divide-gray-200">
              {schedules.map((exam) => (
                <div key={exam._id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{exam.module}</h4>
                      <span className="text-sm text-gray-500">Exam</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                        Upcoming
                      </span>
                      <button
                        onClick={() => handleReschedule(exam)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100 transition-colors"
                      >
                        <CalendarRange className="h-4 w-4" />
                        Reschedule
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex items-center text-gray-600">
                      <CalendarIcon className="h-5 w-5 mr-2" />
                      <span>{exam.scheduledTime.date}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="h-5 w-5 mr-2" />
                      <span>
                        {exam.scheduledTime.startTime} - {exam.scheduledTime.endTime}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-5 w-5 mr-2" />
                      <span>{exam.googleMeetLink ? 'Virtual' : 'In-person'}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Users className="h-5 w-5 mr-2" />
                      <span>1 student</span>
                    </div>
                    {exam.googleMeetLink && (
                      <div className="flex items-center text-gray-600 col-span-full">
                        <Video className="h-5 w-5 mr-2" />
                        <a href={exam.googleMeetLink} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                          Google Meet Link
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {isRescheduleModalOpen && selectedExam && (
        <RescheduleForm
          selectedExam={selectedExam}
          rescheduleForm={rescheduleForm}
          setRescheduleForm={setRescheduleForm}
          handleCloseModal={() => setIsRescheduleModalOpen(false)}
          handleSubmitReschedule={() => setIsRescheduleModalOpen(false)}
        />
      )}
    </div>
  );
};

export default ExaminerSchedule;