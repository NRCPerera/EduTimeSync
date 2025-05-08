import React, { useState, useEffect } from 'react';
import { ClipboardList, Search, CheckCircle, Edit, FileText, Download, Upload } from 'lucide-react';

function EvaluationZone() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });
  const [feedbackModal, setFeedbackModal] = useState({ isOpen: false, studentId: null, currentFeedback: '' });
  const [allStudents, setAllStudents] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const examinerId = 'YOUR_EXAMINER_ID'; // Replace with actual examiner ID (e.g., from auth context)

  // Fetch data from backend on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/evaluations/students?examinerId=${examinerId}`);
        const data = await response.json();
        // Map backend data to frontend student objects
        setAllStudents(data.map(backendStudent => ({
          id: backendStudent.id,
          name: backendStudent.name,
          studentId: backendStudent.id, // Use id as studentId (backend doesn't provide 'S1234567')
          topic: 'N/A', // Not available from backend
          meetingTime: null, // Not available from backend
          submissionStatus: 'submitted', // Assume all are submitted (backend doesn't provide this)
          grade: backendStudent.grade === '' ? null : Number(backendStudent.grade),
          feedback: backendStudent.presentation || '',
          completionStatus: backendStudent.evaluated ? 'completed' : 'pending',
          eventId: backendStudent.module
        })));
        // Extract unique modules to create events
        const uniqueModules = [...new Set(data.map(s => s.module))];
        setEvents(uniqueModules.map(module => ({ id: module, name: module })));
        // Set default selected event
        if (uniqueModules.length > 0) {
          setSelectedEvent(uniqueModules[0]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [examinerId]);

  // Filter and sort students
  const filteredStudents = allStudents
    .filter(student => student.eventId === selectedEvent)
    .filter(student =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.topic.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const sortedStudents = [...filteredStudents].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });

  // Helper functions
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not scheduled';
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getSubmissionStatusBadge = (status) => {
    switch (status) {
      case 'submitted':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Submitted</span>;
      case 'not submitted':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Not Submitted</span>;
      default:
        return null;
    }
  };

  const getCompletionStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">Completed</span>;
      case 'pending':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
      default:
        return null;
    }
  };

  const openFeedbackModal = (student) => {
    setFeedbackModal({
      isOpen: true,
      studentId: student.id,
      currentFeedback: student.feedback
    });
  };

  const updateStudentGrade = (studentId, newGrade) => {
    console.log(`Updating grade for student ${studentId} to ${newGrade}`);
    // In a real app, this would update the backend via API
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Header */}
      <div className="px-4 py-5 sm:px-6 bg-indigo-600">
        <h3 className="text-lg leading-6 font-medium text-white flex items-center">
          <ClipboardList className="mr-2 h-5 w-5" />
          Student Evaluation Zone
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-indigo-100">
          Manage and submit evaluations for your assigned students
        </p>
      </div>

      {/* Search and Event Select */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <div className="flex flex-wrap justify-between items-center gap-2">
          <div className="w-full md:w-auto">
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                placeholder="Search by name, ID or topic"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="w-full md:w-auto flex items-center mt-2 md:mt-0">
            <span className="text-sm font-medium text-gray-700 mr-2">Event:</span>
            <div className="relative inline-block w-60">
              <select
                className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-2 px-3 pr-8 rounded leading-tight focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
              >
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.name}
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

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('name')}
              >
                <div className="flex items-center">
                  Student
                  {sortConfig.key === 'name' && (
                    <span className="ml-1">{sortConfig.direction === 'ascending' ? '↓' : '↑'}</span>
                  )}
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Topic
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('meetingTime')}
              >
                <div className="flex items-center">
                  Meeting Time
                  {sortConfig.key === 'meetingTime' && (
                    <span className="ml-1">{sortConfig.direction === 'ascending' ? '↓' : '↑'}</span>
                  )}
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Submission
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Grade
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedStudents.length > 0 ? (
              sortedStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{student.name}</div>
                        <div className="text-sm text-gray-500">{student.studentId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{student.topic || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.meetingTime ? formatDate(student.meetingTime) : 'Not scheduled'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getSubmissionStatusBadge(student.submissionStatus)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {student.submissionStatus === 'submitted' && (
                      <input
                        type="number"
                        min="0"
                        max="100"
                        className="max-w-[70px] focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        value={student.grade !== null ? student.grade : ''}
                        onChange={(e) => updateStudentGrade(student.id, e.target.value)}
                        placeholder="-"
                      />
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getCompletionStatusBadge(student.completionStatus)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex space-x-2">
                      {student.submissionStatus === 'submitted' && (
                        <>
                          <button
                            className="text-indigo-600 hover:text-indigo-900"
                            onClick={() => openFeedbackModal(student)}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="text-gray-600 hover:text-gray-900">
                            <Download className="h-4 w-4" />
                          </button>
                          <button className="text-emerald-600 hover:text-emerald-900">
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                  No students found matching your search criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
        <span className="text-sm text-gray-700">
          Showing <span className="font-medium">{sortedStudents.length}</span> students
        </span>
        <div className="flex space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <Download className="h-4 w-4 mr-1" />
            Export Grades
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <Upload className="h-4 w-4 mr-1" />
            Submit All
          </button>
        </div>
      </div>

      {/* Feedback Modal */}
      {feedbackModal.isOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true"></span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center justify-center">
                    <FileText className="h-5 w-5 mr-2 text-indigo-500" />
                    Add Feedback
                  </h3>
                  <div className="mt-2">
                    <textarea
                      rows={4}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Enter detailed feedback for the student..."
                      value={feedbackModal.currentFeedback}
                      onChange={(e) => setFeedbackModal({ ...feedbackModal, currentFeedback: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 flex space-x-3">
                <button
                  type="button"
                  className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                  onClick={() => setFeedbackModal({ ...feedbackModal, isOpen: false })}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                  onClick={() => setFeedbackModal({ ...feedbackModal, isOpen: false })}
                >
                  Save Feedback
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EvaluationZone;