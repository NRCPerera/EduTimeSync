import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, AlertCircle, Search, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EvaluatedSchedules = () => {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isTableVisible, setIsTableVisible] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [reportLoading, setReportLoading] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      setError('Please log in to view your schedules');
      setLoading(false);
      navigate('/sign-in');
      return;
    }
    fetchSchedules();
  }, [currentMonth, token, navigate]);

  // Animation effect when data loads
  useEffect(() => {
    if (!loading && schedules.length > 0) {
      setIsTableVisible(true);
    }
  }, [loading, schedules]);

  const fetchSchedules = async () => {
    setLoading(true);
    setError(null);
    setIsTableVisible(false);

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
      if (!data.success) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      // Filter schedules to show only those with evaluations
      const evaluatedSchedules = data.data.filter(schedule => schedule.hasEvaluation);
      setSchedules(evaluatedSchedules || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch your evaluated schedules');
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

  // Filter schedules based on search query
  const filteredSchedules = schedules.filter((exam) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      (exam.eventName && exam.eventName.toLowerCase().includes(query)) ||
      (exam.module && exam.module.toLowerCase().includes(query)) ||
      (exam.studentId?.name && exam.studentId.name.toLowerCase().includes(query)) ||
      (exam.studentId?.email && exam.studentId.email.toLowerCase().includes(query)) ||
      (exam.evaluation?.grade && exam.evaluation.grade.toString().toLowerCase().includes(query))
    );
  });

  // Get unique events for dropdown
  const uniqueEvents = useMemo(() => {
    return Array.from(
      new Map(
        filteredSchedules.map((exam) => {
          const eventId = exam.eventId?._id || exam.eventId || 'unknown';
          const eventName = exam.eventId?.name || exam.module || 'Unknown Event';
          return [
            eventId,
            { eventId, eventName },
          ];
        })
      ).values()
    );
  }, [filteredSchedules]);

  // Debug state changes
  useEffect(() => {
  }, [selectedEventId, uniqueEvents, filteredSchedules]);

  const showExamDetails = (exam) => {
    setSelectedExam(exam);
    setIsDetailModalOpen(true);
  };

  const generateEventReport = async (eventId) => {
    if (!eventId || eventId === 'unknown') {
      setError('Please select a valid event');
      return;
    }

    setReportLoading(true);
    setError(null);

    try {
      console.log(`Generating report for eventId: ${eventId}`);
      const response = await fetch(`http://localhost:5000/api/evaluations/report/event/${eventId}`, {
        method: 'GET',
        headers: {
          'x-auth-token': token,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.error || `Failed to generate event report (status: ${response.status})`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `event_grade_report_${eventId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      console.log('Report downloaded successfully');
    } catch (err) {
      setError(err.message || 'Failed to generate event report');
      console.error('Event report generation error:', err);
    } finally {
      setReportLoading(false);
    }
  };

  const getGradeColorClass = (grade) => {
    if (!grade) return 'bg-gray-100 text-gray-800';

    const gradeNum = parseFloat(grade);
    if (isNaN(gradeNum)) return 'bg-purple-100 text-purple-800';

    if (gradeNum >= 80 && gradeNum <= 100)
      return 'bg-green-100 text-green-800';
    if (gradeNum >= 65 && gradeNum < 80)
      return 'bg-blue-100 text-blue-800';
    if (gradeNum >= 55 && gradeNum < 65)
      return 'bg-yellow-100 text-yellow-800';
    if (gradeNum >= 45 && gradeNum < 55)
      return 'bg-orange-100 text-orange-800';
    if (gradeNum < 45)
      return 'bg-red-100 text-red-800';

    return 'bg-purple-100 text-purple-800';
  };

  const closeModal = () => {
    setIsDetailModalOpen(false);
    setTimeout(() => setSelectedExam(null), 300);
  };

  const tableAnimationClass = isTableVisible
    ? 'transform transition-all duration-500 translate-y-0 opacity-100'
    : 'transform transition-all duration-500 translate-y-4 opacity-0';

  const monthAnimationClass = 'transition-all duration-300 transform';

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6 bg-white rounded-lg p-4 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center">
              <Calendar className="h-6 w-6 text-indigo-500 mr-2" />
              <h2 className={`text-xl font-semibold text-gray-900 ${monthAnimationClass}`}>
                {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h2>
              <div className="ml-2 flex gap-2">
                <button
                  onClick={handlePreviousMonth}
                  className="p-2 hover:bg-indigo-50 hover:text-indigo-600 rounded-full transition-colors duration-200"
                  disabled={loading}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-2 hover:bg-indigo-50 hover:text-indigo-600 rounded-full transition-colors duration-200"
                  disabled={loading}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 w-full md:w-1/2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="searchQuery"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by event name, module, student name, email, or grade"
                  className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all duration-200"
                />
              </div>
              <div className="flex-1 min-w-0">
                {uniqueEvents.length === 0 ? (
                  <p className="text-sm text-gray-500">No events available</p>
                ) : (
                  <select
                    value={selectedEventId}
                    onChange={(e) => setSelectedEventId(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    disabled={uniqueEvents.length === 0}
                  >
                    <option value="">Select an event to generate report</option>
                    {uniqueEvents.map((event) => (
                      <option key={event.eventId} value={event.eventId}>
                        {event.eventName}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>
          {selectedEventId && selectedEventId !== 'unknown' && (
            <div className="mt-4">
              <button
                onClick={() => generateEventReport(selectedEventId)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-150 disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={reportLoading}
              >
                {reportLoading ? 'Generating Report...' : 'Generate Event Report'}
              </button>
              <button
                onClick={() => setSelectedEventId('')}
                className="ml-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-150"
              >
                Clear Event
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-4 p-4 rounded-lg bg-red-50 text-red-600 flex items-center gap-2 animate-bounce">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden transition-shadow duration-300 hover:shadow-lg">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-indigo-500 to-purple-600">
            <h3 className="text-lg font-semibold text-white">Your Evaluated Examinations</h3>
          </div>
          <div className="px-6 py-4">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-700">Search Results</h4>
              {!loading && filteredSchedules.length > 0 && (
                <p className="text-sm text-gray-500">
                  Showing <span className="font-medium">{filteredSchedules.length}</span>{' '}
                  {filteredSchedules.length === 1 ? 'record' : 'records'}
                </p>
              )}
            </div>
          </div>
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
              <p className="mt-2 text-gray-600">Loading your evaluated schedules...</p>
            </div>
          ) : filteredSchedules.length === 0 ? (
            <div className="p-12 text-center text-gray-600 animate-pulse">
              <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 text-indigo-400">
                <Calendar className="h-8 w-8" />
              </div>
              <p>No evaluated schedules match your search</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className={`min-w-full divide-y divide-gray-200 ${tableAnimationClass}`}>
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Module
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Grade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSchedules.map((exam, index) => (
                    <tr
                      key={exam._id}
                      className="hover:bg-indigo-50 transition-colors duration-150"
                      style={{
                        animation: `fadeIn 0.3s ease-out forwards`,
                        animationDelay: `${index * 0.05}s`,
                        opacity: 0,
                      }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {exam.eventName || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {exam.module || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {exam.studentId?.name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${getGradeColorClass(
                            exam.evaluation?.grade
                          )}`}
                        >
                          {exam.evaluation?.grade ?? 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => showExamDetails(exam)}
                          className="text-indigo-600 hover:text-indigo-900 transition-colors duration-150 mr-4"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Detail Modal */}
      {isDetailModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden transform transition-all"
            style={{
              animation: isDetailModalOpen
                ? 'modalFadeIn 0.3s ease-out forwards'
                : 'modalFadeOut 0.3s ease-in forwards',
            }}
          >
            <div className="flex justify-between items-center px-6 py-4 bg-indigo-600 text-white">
              <h3 className="text-lg font-semibold">Evaluation Details</h3>
              <button
                onClick={closeModal}
                className="text-white hover:bg-indigo-700 rounded-full p-1"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {selectedExam && (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Event Details</h4>
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-900 mb-1">
                        <span className="font-medium">Event:</span> {selectedExam.eventName || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-900 mb-1">
                        <span className="font-medium">Module:</span> {selectedExam.module || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">Date:</span>{' '}
                        {new Date(selectedExam.startTime).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Student Details</h4>
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-900 mb-1">
                        <span className="font-medium">Name:</span>{' '}
                        {selectedExam.studentId?.name || 'Unknown'}
                      </p>
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">Email:</span>{' '}
                        {selectedExam.studentId?.email || 'Unknown'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Evaluation</h4>
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center mb-4">
                      <span className="text-sm font-semibold text-gray-700 mr-2">Grade:</span>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${getGradeColorClass(
                          selectedExam.evaluation?.grade
                        )}`}
                      >
                        {selectedExam.evaluation?.grade || 'Not Graded'}
                      </span>
                    </div>

                    {selectedExam.evaluation?.presentation && (
                      <div>
                        <h5 className="text-sm font-semibold text-gray-700 mb-2">
                          Presentation Notes:
                        </h5>
                        <div className="bg-gray-50 p-3 rounded-lg text-sm whitespace-pre-wrap">
                          {selectedExam.evaluation.presentation}
                        </div>
                      </div>
                    )}

                    {!selectedExam.evaluation?.presentation && (
                      <p className="text-sm text-gray-500 italic">No presentation notes available.</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-4">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-150"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes modalFadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes modalFadeOut {
          from {
            opacity: 1;
            transform: scale(1);
          }
          to {
            opacity: 0;
            transform: scale(0.95);
          }
        }
      `}</style>
    </div>
  );
};

export default EvaluatedSchedules;