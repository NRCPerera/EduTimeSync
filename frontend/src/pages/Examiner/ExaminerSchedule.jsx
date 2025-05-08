import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, Users, Video, ChevronLeft, ChevronRight, CalendarRange, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ExaminerHeader from '../../components/ExaminerComponents/ExaminerHeader';
import RescheduleForm from '../../components/RescheduleForm';

const ExaminerSchedule = () => {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rescheduleRequests, setRescheduleRequests] = useState([]);
  const [modalError, setModalError] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchSchedules();
    fetchRescheduleRequests();
  }, [currentMonth]);

  const fetchSchedules = async () => {
    setLoading(true);
    setError(null);

    if (!token) {
      setError('Please log in to view your schedules');
      setLoading(false);
      navigate('/sign-in');
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

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      setSchedules(data.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch your schedules');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRescheduleRequests = async () => {
    try {
      const response = await fetch(
        'http://localhost:5000/api/rescheduleRequest/examiner',
        {
          headers: {
            'x-auth-token': token,
          },
        }
      );

      const data = await response.json();
      if (!response.ok) {
        console.error('Failed to fetch reschedule requests:', data.error);
        return;
      }

      setRescheduleRequests(data.data || []);
    } catch (err) {
      console.error('Error fetching reschedule requests:', err);
    }
  };

  const hasExistingRescheduleRequest = (examId) => {
    return rescheduleRequests.some(
      request => request.scheduleId?._id === examId && request.status === 'pending'
    );
  };

  const handlePreviousMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1));
  };

  const handleReschedule = (exam) => {
    if (!exam || !exam._id || !exam.startTime || !exam.endTime) {
      setError('Invalid exam data. Cannot reschedule.');
      return;
    }

    // Check if there's an existing pending reschedule request
    if (hasExistingRescheduleRequest(exam._id)) {
      setError('A reschedule request already exists for this exam. Please check your existing requests or contact support.');
      // Scroll to the error message
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSelectedExam(exam);
    setIsRescheduleModalOpen(true);
    setModalError(null); // Clear any previous modal errors
  };

  const handleSubmitReschedule = async (formData) => {
    try {
      setModalError(null); // Clear previous errors
      
      const response = await fetch('http://localhost:5000/api/rescheduleRequest/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({
          scheduleId: formData.examId,
          proposedTime: {
            date: formData.newDate,
            startTime: formData.newStartTime,
            endTime: formData.newEndTime,
          },
          reason: formData.reason,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        if (data.error === 'A reschedule request already exists for this schedule') {
          throw new Error('A reschedule request already exists for this exam. Please check your existing requests or contact support.');
        }
        throw new Error(data.error || 'Failed to submit reschedule request');
      }

      // Success - close modal and refresh data
      setIsRescheduleModalOpen(false);
      setSelectedExam(null);
      setError(null);
      
      // Refresh both schedules and reschedule requests
      fetchSchedules();
      fetchRescheduleRequests();
      
      // Show success message
      alert('Reschedule request submitted successfully!');
    } catch (err) {
      // Show error inside the modal
      setModalError(err.message);
      console.error('Reschedule error:', err);
    }
  };

  const getExamStatus = (exam) => {
    if (hasExistingRescheduleRequest(exam._id)) {
      return {
        label: 'Reschedule Pending',
        className: 'bg-yellow-100 text-yellow-800'
      };
    }
    return {
      label: 'Upcoming',
      className: 'bg-green-100 text-green-800'
    };
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

        {error && (
          <div className="mb-4 p-4 rounded-lg bg-red-50 text-red-600 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Your Upcoming Examinations</h3>
          </div>
          {loading ? (
            <div className="p-6 text-center text-gray-600">Loading your schedules...</div>
          ) : schedules.length === 0 ? (
            <div className="p-6 text-center text-gray-600">No schedules found for this month</div>
          ) : (
            <div className="divide-y divide-gray-200">
              {schedules.map((exam) => {
                const examStatus = getExamStatus(exam);
                const hasPendingRequest = hasExistingRescheduleRequest(exam._id);
                
                return (
                  <div key={exam._id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">{exam.module}</h4>
                        <span className="text-sm text-gray-500">Exam</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-sm ${examStatus.className}`}>
                          {examStatus.label}
                        </span>
                        <button
                          onClick={() => handleReschedule(exam)}
                          disabled={hasPendingRequest}
                          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors
                            ${hasPendingRequest
                              ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                              : 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100'}`}
                        >
                          <CalendarRange className="h-4 w-4" />
                          {hasPendingRequest ? 'Request Pending' : 'Reschedule'}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="flex items-center text-gray-600">
                        <CalendarIcon className="h-5 w-5 mr-2" />
                        <span>{exam.startTime ? new Date(exam.startTime).toLocaleDateString() : 'N/A'}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="h-5 w-5 mr-2" />
                        <span>
                          {exam.startTime && exam.endTime
                            ? `${new Date(exam.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(exam.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                            : 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-5 w-5 mr-2" />
                        <span>{exam.googleMeetLink ? 'Virtual' : 'In-person'}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Users className="h-5 w-5 mr-2" />
                        <span>Student: {exam.studentId?.email || 'Unknown'}</span>
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
                );
              })}
            </div>
          )}
        </div>
      </main>

      {isRescheduleModalOpen && selectedExam && (
        <RescheduleForm
          selectedExam={selectedExam}
          onClose={() => {
            setIsRescheduleModalOpen(false);
            setSelectedExam(null);
            setModalError(null);
          }}
          onSubmit={handleSubmitReschedule}
          error={modalError}
        />
      )}
    </div>
  );
};

export default ExaminerSchedule;