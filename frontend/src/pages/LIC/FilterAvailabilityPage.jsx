import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Search, Filter, CheckCircle2, XCircle as XCircle2, AlertCircle } from 'lucide-react';
import LICHeader from '../../components/LICHeader';


const FilterAvailabilityPage = () => {
  const [examiners, setExaminers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    date: '',
    timeSlot: '',
    expertise: '',
    searchQuery: '',
  });

  useEffect(() => {
    const fetchExaminers = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/get-examiners-availability');
        if (!response.ok) {
          const errorData = await response.json(); // Attempt to parse error message from response
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        const data = await response.json(); // Parse the successful response
        setExaminers(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load examiners: ' + (err.message || 'Unknown error'));
        setLoading(false);
      }
    };
    fetchExaminers();
  }, []);

  const expertiseAreas = [...new Set(examiners.map(examiner => examiner.expertise))];
  const allTimeSlots = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];

  const filteredExaminers = examiners.filter(examiner => {
    const matchesSearch = examiner.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
                         examiner.expertise.toLowerCase().includes(filters.searchQuery.toLowerCase());
    
    const matchesExpertise = !filters.expertise || examiner.expertise === filters.expertise;
    
    const matchesAvailability = !filters.date || !filters.timeSlot || 
                               examiner.availability.some(a => 
                                 a.day === filters.date && a.slots.includes(filters.timeSlot)
                               );

    return matchesSearch && matchesExpertise && matchesAvailability;
  });

  const getAvailabilityStatus = (examiner, date, timeSlot) => {
    if (!date || !timeSlot) return null;
    
    const dayAvailability = examiner.availability.find(a => a.day === date);
    return dayAvailability?.slots.includes(timeSlot);
  };

  const getLoadColor = (current, max) => {
    const ratio = current / max;
    if (ratio < 0.5) return 'text-green-600';
    if (ratio < 0.8) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <LICHeader />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="sm:flex sm:items-center sm:justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Filter Examiner Availability</h1>
              <p className="mt-2 text-sm text-gray-600">
                Find available examiners based on date, time, and expertise requirements.
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Search examiners..."
                  value={filters.searchQuery}
                  onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={filters.date}
                onChange={(e) => setFilters({ ...filters, date: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time Slot</label>
              <select
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={filters.timeSlot}
                onChange={(e) => setFilters({ ...filters, timeSlot: e.target.value })}
              >
                <option value="">All time slots</option>
                {allTimeSlots.map(slot => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expertise</label>
              <select
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={filters.expertise}
                onChange={(e) => setFilters({ ...filters, expertise: e.target.value })}
              >
                <option value="">All areas</option>
                {expertiseAreas.map(area => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Results */}
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Examiner Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expertise
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Availability
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Load
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredExaminers.map((examiner) => (
                  <tr key={examiner.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-100 flex items-center justify-center">
                          <Users className="h-5 w-5 text-gray-500" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{examiner.name}</div>
                          <div className="text-sm text-gray-500">ID: {examiner.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        {examiner.expertise}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {filters.date && filters.timeSlot ? (
                        <div className="flex items-center">
                          {getAvailabilityStatus(examiner, filters.date, filters.timeSlot) ? (
                            <div className="flex items-center text-green-600">
                              <CheckCircle2 className="h-5 w-5 mr-2" />
                              <span>Available</span>
                            </div>
                          ) : (
                            <div className="flex items-center text-red-600">
                              <XCircle2 className="h-5 w-5 mr-2" />
                              <span>Unavailable</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">
                          Select date and time to check availability
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className={`text-sm font-medium ${getLoadColor(examiner.currentLoad, examiner.maxLoad)}`}>
                          {examiner.currentLoad} / {examiner.maxLoad}
                        </div>
                        <div className="ml-2 w-24 h-2 bg-gray-200 rounded-full">
                          <div
                            className={`h-full rounded-full ${
                              examiner.currentLoad / examiner.maxLoad < 0.5
                                ? 'bg-green-500'
                                : examiner.currentLoad / examiner.maxLoad < 0.8
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${(examiner.currentLoad / examiner.maxLoad) * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterAvailabilityPage;