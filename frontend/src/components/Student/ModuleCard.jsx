import { motion } from 'framer-motion';
import { useEnrollment } from './EnrollmentContext';
import img from '../../Image/EduTimeSync.png';

export default function ModuleCard({ module, index }) {
  const { isEnrolled, openEnrollModal } = useEnrollment();
  const enrolled = isEnrolled(module.code);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        delay: index * 0.1,
        duration: 0.4 
      }}
      whileHover={{ 
        y: -5,
        boxShadow: "0 10px 30px -15px rgba(0, 0, 0, 0.2)"
      }}
      className="card group"
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={module.image || {img}} 
          alt={module.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {enrolled && (
          <div className="absolute top-3 right-3">
            <span className="bg-success-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
              Enrolled
            </span>
          </div>
        )}
      </div>
      
      <div className="p-6">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {module.name}
          </h3>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {module.description || 'No description available'}
        </p>
        
        <div className="border-t border-gray-100 pt-4 mt-auto">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <span className="text-xs font-medium text-gray-500">Module Code:</span>
              <span className="text-sm font-medium text-gray-800 ml-1">{module.code || 'Unknown'}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <span className="text-xs font-medium text-gray-500">Module Name:</span>
              <span className="text-sm font-medium text-gray-800 ml-1">{module.name || 'N/A'}</span>
            </div>
          </div>
          
          <button
            onClick={() => !enrolled && openEnrollModal(module)}
            disabled={enrolled}
            className={`w-full py-2 px-4 rounded-md font-medium text-center transition-colors ${
              enrolled
                ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                : 'bg-primary-600 text-white hover:bg-primary-700'
            }`}
          >
            {enrolled ? 'Enrolled' : 'Enroll'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}