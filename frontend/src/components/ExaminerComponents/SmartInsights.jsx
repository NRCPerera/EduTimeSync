import React from 'react';
import { BarChart3, Clock, Calendar, Check, Users } from 'lucide-react';

function SmartInsights() {
  // Sample data - in a real app, this would come from an API
  const examinerMetrics = {
    averageGradingTime: 28,
    evaluationsCompleted: 42,
    evaluationsPending: 15,
    onTimePercentage: 95,
    rescheduleRate: 8,
    studentSatisfaction: 4.7,
  };

  const departmentAverages = {
    averageGradingTime: 35,
    evaluationsCompleted: 38,
    evaluationsPending: 18,
    onTimePercentage: 90,
    rescheduleRate: 12,
    studentSatisfaction: 4.2,
  };

  // Calculate the percentage of completed evaluations
  const totalEvaluations = examinerMetrics.evaluationsCompleted + examinerMetrics.evaluationsPending;
  const completionPercentage = Math.round((examinerMetrics.evaluationsCompleted / totalEvaluations) * 100);

  // Helper function to determine if examiner metric is better than department average
  const isBetter = (metric, deptMetric, higherIsBetter = true) => {
    return higherIsBetter ? metric > deptMetric : metric < deptMetric;
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden h-full">
      <div className="px-4 py-5 sm:px-6 bg-indigo-600">
        <h3 className="text-lg leading-6 font-medium text-white flex items-center">
          <BarChart3 className="mr-2 h-5 w-5" />
          Smart Insights
        </h3>
        <p className="mt-1 max-w-5xl text-sm text-indigo-100">
          Your performance metrics and statistics
        </p>
      </div>
      
      <div className="px-4 py-5 sm:p-6">
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Evaluation Progress</h4>
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 bg-indigo-100">
                  {completionPercentage}% Complete
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-gray-600">
                  {examinerMetrics.evaluationsCompleted}/{totalEvaluations} Evaluations
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-100">
              <div style={{ width: `${completionPercentage}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500 transition-all duration-500 ease-in-out"></div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3">
                <Clock className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-gray-500">Avg. Grading Time</h4>
                <div className="flex items-center">
                  <span className="text-2xl font-bold text-gray-900">{examinerMetrics.averageGradingTime} min</span>
                  {isBetter(examinerMetrics.averageGradingTime, departmentAverages.averageGradingTime, false) ? (
                    <span className="ml-2 text-xs font-medium text-green-600">
                      {Math.abs(examinerMetrics.averageGradingTime - departmentAverages.averageGradingTime)}m faster
                    </span>
                  ) : (
                    <span className="ml-2 text-xs font-medium text-gray-500">
                      Dept. avg: {departmentAverages.averageGradingTime}m
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-gray-500">On-Time Rate</h4>
                <div className="flex items-center">
                  <span className="text-2xl font-bold text-gray-900">{examinerMetrics.onTimePercentage}%</span>
                  {isBetter(examinerMetrics.onTimePercentage, departmentAverages.onTimePercentage) ? (
                    <span className="ml-2 text-xs font-medium text-green-600">
                      {Math.abs(examinerMetrics.onTimePercentage - departmentAverages.onTimePercentage)}% higher
                    </span>
                  ) : (
                    <span className="ml-2 text-xs font-medium text-gray-500">
                      Dept. avg: {departmentAverages.onTimePercentage}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-amber-100 rounded-md p-3">
                <Calendar className="h-6 w-6 text-amber-600" />
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-gray-500">Reschedule Rate</h4>
                <div className="flex items-center">
                  <span className="text-2xl font-bold text-gray-900">{examinerMetrics.rescheduleRate}%</span>
                  {isBetter(examinerMetrics.rescheduleRate, departmentAverages.rescheduleRate, false) ? (
                    <span className="ml-2 text-xs font-medium text-green-600">
                      {Math.abs(examinerMetrics.rescheduleRate - departmentAverages.rescheduleRate)}% lower
                    </span>
                  ) : (
                    <span className="ml-2 text-xs font-medium text-gray-500">
                      Dept. avg: {departmentAverages.rescheduleRate}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-gray-500">Student Satisfaction</h4>
                <div className="flex items-center">
                  <span className="text-2xl font-bold text-gray-900">{examinerMetrics.studentSatisfaction}/5</span>
                  {isBetter(examinerMetrics.studentSatisfaction, departmentAverages.studentSatisfaction) ? (
                    <span className="ml-2 text-xs font-medium text-green-600">
                      Top 10% of examiners
                    </span>
                  ) : (
                    <span className="ml-2 text-xs font-medium text-gray-500">
                      Dept. avg: {departmentAverages.studentSatisfaction}/5
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
            View detailed analytics →
          </a>
        </div>
      </div>
    </div>
  );
}

export default SmartInsights;