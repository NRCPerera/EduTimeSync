import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, Users, Video, ChevronLeft, ChevronRight, CalendarRange } from 'lucide-react';
import ExaminerHeader from '../../components/ExaminerHeader';
import RescheduleForm from './ResheduleForm';

const ExaminerSchedule = () => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
    const [selectedExam, setSelectedExam] = useState(null);
    const [rescheduleForm, setRescheduleForm] = useState({
      examId: 0,
      newDate: "",
      newTime: "",
      reason: "",
    });
  
    const examinerSchedule = [
      {
        id: 1,
        subject: "Advanced Mathematics",
        date: "2024-03-20",
        time: "10:00 AM",
        duration: "2 hours",
        location: "Room 301",
        type: "Final Exam",
        participants: 30,
        status: "Upcoming",
      },
      {
        id: 2,
        subject: "Data Structures",
        date: "2024-03-22",
        time: "2:00 PM",
        duration: "3 hours",
        location: "Virtual",
        type: "Midterm",
        participants: 25,
        status: "Upcoming",
      },
    ];
  
    const handlePreviousMonth = () => {
      setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1));
    };
  
    const handleNextMonth = () => {
      setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1));
    };
  
    const handleReschedule = (exam) => {
      setSelectedExam(exam);
      setRescheduleForm({
        examId: exam.id,
        newDate: exam.date,
        newTime: exam.time,
        reason: "",
      });
      setIsRescheduleModalOpen(true);
    };
  
    return (
      <div className="min-h-screen bg-gray-50">
        <ExaminerHeader />
        <main className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {currentMonth.toLocaleString("default", { month: "long", year: "numeric" })}
            </h2>
            <div className="flex gap-2">
              <button onClick={handlePreviousMonth} className="p-2 hover:bg-gray-100 rounded-full">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 rounded-full">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900">Today's Exams</h3>
            <p className="text-3xl font-bold text-indigo-600 mt-2">2</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900">This Week</h3>
            <p className="text-3xl font-bold text-indigo-600 mt-2">5</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900">Total Students</h3>
            <p className="text-3xl font-bold text-indigo-600 mt-2">90</p>
          </div>
        </div>
  
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Examinations</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {examinerSchedule.map(exam => (
              <div key={exam.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{exam.subject}</h4>
                    <span className="text-sm text-gray-500">{exam.type}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      exam.status === 'Upcoming' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {exam.status}
                    </span>
                    {exam.status === 'Upcoming' && (
                      <button
                        onClick={() => handleReschedule(exam)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100 transition-colors"
                      >
                        <CalendarRange className="h-4 w-4" />
                        Reschedule
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex items-center text-gray-600">
                    <CalendarIcon className="h-5 w-5 mr-2" />
                    <span>{new Date(exam.date).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-5 w-5 mr-2" />
                    <span>{exam.time} ({exam.duration})</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-5 w-5 mr-2" />
                    <span>{exam.location}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <Users className="h-5 w-5 mr-2" />
                    <span>{exam.participants} students</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
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