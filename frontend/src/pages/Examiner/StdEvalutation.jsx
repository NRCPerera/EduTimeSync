import { useState, useEffect } from 'react';
import axios from 'axios';

const StdEvaluation = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Hardcode examinerId for testing (replace with dynamic value later if needed)
  const examinerId = "67e5d8ec5a5e4ed664ca8f72"; // Dr. Alice Examiner from sample data

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/evaluations/students?examinerId=${examinerId}`);
        console.log('Fetched students:', response.data); // Debug response
        setStudents(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching students:', error.response?.data || error.message);
        setError('Failed to fetch students: ' + (error.response?.data?.message || error.message));
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const handleGradeChange = (id, value) => {
    setStudents(students.map(student =>
      student.id === id ? { ...student, grade: value } : student
    ));
  };

  const handlePresentationChange = (id, value) => {
    setStudents(students.map(student =>
      student.id === id ? { ...student, presentation: value } : student
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        'http://localhost:5000/api/evaluations/submit',
        {
          examinerId,
          evaluations: students.filter(student => student.grade && student.presentation && !student.evaluated),
        }
      );
      console.log('Submitted evaluations:', response.data);
      alert('Evaluations submitted successfully!');
      setStudents(students.map(student =>
        response.data.evaluations.some(evaluation => evaluation.studentId === student.id)
          ? { ...student, evaluated: true }
          : student
      ));
    } catch (error) {
      console.error('Error submitting evaluations:', error.response?.data || error.message);
      setError('Failed to submit evaluations: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-indigo-600 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">Student Presentation Evaluations</h1>
            <p className="text-indigo-200 mt-1">Enter grades and feedback for each student's presentation</p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid gap-6 mb-8">
              {students.map((student) => (
                <div 
                  key={student.id} 
                  className={`bg-white rounded-xl border border-gray-200 overflow-hidden transition-colors duration-300 ${
                    student.evaluated ? 'opacity-50 cursor-not-allowed' : 'hover:border-indigo-500'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-4 p-6">
                    <div className="md:w-1/4">
                      <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center mb-2">
                        <span className="text-xl font-semibold text-indigo-600">
                          {student.name.charAt(0)}
                        </span>
                      </div>
                      <h2 className="text-lg font-semibold text-gray-900">{student.name}</h2>
                      <p className="text-sm text-gray-500">{student.module}</p>
                    </div>
                    
                    <div className="md:w-1/4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Grade
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={student.grade}
                          onChange={(e) => handleGradeChange(student.id, e.target.value)}
                          className="block w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          required={!student.evaluated}
                          placeholder="0-100"
                          disabled={student.evaluated}
                        />
                        <span className="absolute right-3 top-2 text-gray-400">/ 100</span>
                      </div>
                    </div>
                    
                    <div className="md:w-2/4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Presentation Feedback
                      </label>
                      <textarea
                        value={student.presentation}
                        onChange={(e) => handlePresentationChange(student.id, e.target.value)}
                        rows="2"
                        className="block w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                        required={!student.evaluated}
                        placeholder="Enter your feedback here..."
                        disabled={student.evaluated}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transform transition-transform hover:scale-105"
                disabled={students.every(student => student.evaluated)}
              >
                Submit All Evaluations
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StdEvaluation;