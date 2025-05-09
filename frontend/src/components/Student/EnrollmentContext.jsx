import { createContext, useContext, useState } from 'react';
import toast from 'react-hot-toast';

const EnrollmentContext = createContext(null);

export function useEnrollment() {
  const context = useContext(EnrollmentContext);
  if (!context) {
    throw new Error('useEnrollment must be used within an EnrollmentProvider');
  }
  return context;
}

export default function EnrollmentProvider({ children }) {
  const [enrolledModules, setEnrolledModules] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);

  // Check if the module is already enrolled
  const isEnrolled = (moduleCode) => {
    return enrolledModules.includes(moduleCode);
  };

  // Open the enrollment modal
  const openEnrollModal = (module) => {
    setSelectedModule(module);
    setIsModalOpen(true);
  };

  // Close the enrollment modal
  const closeEnrollModal = () => {
    setIsModalOpen(false);
    setSelectedModule(null);
  };

  // Enroll in a module
  const enrollInModule = async (moduleCode, password) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please sign in.');
      }
      const response = await fetch('http://localhost:5000/api/module/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({ moduleCode, password }),
      });
      const data = await response.json();
      if (data.success) {
        setEnrolledModules([...enrolledModules, moduleCode]);
        toast.success(`Successfully enrolled in ${selectedModule.name}!`);
        closeEnrollModal();
        return true;
      } else {
        toast.error(data.error || 'Enrollment failed');
        return false;
      }
    } catch (error) {
      console.error('Enrollment error:', error);
      toast.error('An error occurred during enrollment');
      return false;
    }
  };

  const value = {
    enrolledModules,
    isModalOpen,
    selectedModule,
    isEnrolled,
    openEnrollModal,
    closeEnrollModal,
    enrollInModule,
  };

  return (
    <EnrollmentContext.Provider value={value}>
      {children}
    </EnrollmentContext.Provider>
  );
}