import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ModuleCard from './ModuleCard';
import EnrollModal from './EnrollModal';
import { useEnrollment } from './EnrollmentContext';
import { useNavigate } from 'react-router-dom';

export default function ModuleGrid() {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isModalOpen, selectedModule } = useEnrollment();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please sign in to view modules');
          navigate('/sign-in');
          return;
        }
        const response = await fetch('http://localhost:5000/api/module/all', {
          headers: {
            'x-auth-token': token,
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch modules');
        }
        const data = await response.json();
        setModules(data.data || []);
      } catch (err) {
        console.error('Error fetching modules:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchModules();
  }, [navigate]);

  if (loading) {
    return <div className="text-center py-8">Loading modules...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Available Modules</h2>
          <p className="text-gray-600">Discover and enroll in our wide range of educational modules</p>
        </div>
        <div className="mt-4 md:mt-0">
          {/* Filter/sort options could go here in a future iteration */}
        </div>
      </div>

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1 }}
      >
        {modules.map((module, index) => (
          <ModuleCard 
            key={module._id} 
            module={module} 
            index={index}
          />
        ))}
      </motion.div>

      {isModalOpen && selectedModule && <EnrollModal />}
    </div>
  );
}