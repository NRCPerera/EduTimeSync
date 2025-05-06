import React, { createContext, useState, useContext } from 'react';
import { GraduationCap, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertMessage from '../../components/AlertMessage';
import AppHeader from '../../components/AppHeader';

// ModuleRegistrationContext
const ModuleRegistrationContext = createContext();

const useModuleRegistration = () => {
  const context = useContext(ModuleRegistrationContext);
  if (!context) {
    throw new Error('useModuleRegistration must be used within a ModuleRegistrationProvider');
  }
  return context;
};

const ModuleRegistrationProvider = ({ children }) => {
  const [formData, setFormData] = useState({
    moduleCode: '',
    password: '',
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
  
    if (!formData.moduleCode || !formData.password) {
      setError('Please fill out all fields');
      setLoading(false);
      return;
    }
  
    const token = localStorage.getItem('token');
    
    if (!token) {
      setError('You must be logged in to register for a module');
      setLoading(false);
      return;
    }
  
    try {
      const response = await fetch('http://localhost:5000/api/module/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || `Server error: ${response.status}`);
      }
  
      setSuccess(`Successfully registered for ${data.data.moduleName} (${data.data.moduleCode})!`);
      
      setFormData({
        moduleCode: '',
        password: '',
      });
    } catch (err) {
      if (err.message === 'Failed to fetch') {
        setError('Unable to connect to the server. Please check if the server is running at http://localhost:5000');
      } else {
        setError(err.message || 'An error occurred during registration');
      }
    } finally {
      setLoading(false);
    }
  };

  const value = {
    formData,
    setFormData,
    error,
    setError,
    success,
    setSuccess,
    loading,
    setLoading,
    handleInputChange,
    handleSubmit,
  };

  return (
    <ModuleRegistrationContext.Provider value={value}>
      {children}
    </ModuleRegistrationContext.Provider>
  );
};

// FormInput Component
const FormInput = ({
  id,
  name,
  label,
  type,
  required = false,
  value,
  onChange,
  placeholder,
  tooltip,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  return (
    <div>
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="block text-sm font-semibold text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        
        {tooltip && (
          <div className="relative">
            <div 
              className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors duration-150" 
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              <HelpCircle size={16} />
            </div>
            
            {showTooltip && (
              <div className="absolute right-0 z-10 w-64 p-2 mt-1 text-sm text-white bg-gray-800 rounded-lg shadow-lg transition-opacity duration-150" style={{ transform: 'translateX(-45%)' }}>
                {tooltip}
                <div className="absolute -top-1 left-1/2 w-2 h-2 bg-gray-800 transform -translate-x-1/2 rotate-45"></div>
              </div>
            )}
          </div>
        )}
      </div>
      
      <input
        type={type}
        id={id}
        name={name}
        required={required}
        value={value}
        onChange={onChange}
        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border transition duration-150 ease-in-out"
        placeholder={placeholder}
      />
    </div>
  );
};

// RegistrationForm Component
const RegistrationForm = () => {
  const {
    formData,
    error,
    success,
    loading,
    handleInputChange,
    handleSubmit
  } = useModuleRegistration();

  return (
    
    <motion.div
      initial="hidden"
      animate="visible"
      className="bg-white/90 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden transform transition-all"
    >
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-indigo-600 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent"></div>
        <div className="relative flex items-center justify-center mb-2">
          <GraduationCap className="text-white mr-2" size={28} />
          <h1 className="text-3xl font-extrabold text-white">
            Module Registration
          </h1>
        </div>
        <p className="mt-2 text-indigo-100 text-center">
          Register for a module with your code and password
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {error && <AlertMessage type="error" message={error} />}
        {success && <AlertMessage type="success" message={success} />}

        <div className="space-y-4">
          <FormInput
            id="moduleCode"
            name="moduleCode"
            label="Module Code"
            type="text"
            required
            value={formData.moduleCode}
            onChange={handleInputChange}
            placeholder="e.g., CS101"
            tooltip="Enter the unique module code provided by your instructor"
          />

          <FormInput
            id="password"
            name="password"
            label="Module Password"
            type="password"
            required
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Enter module password"
            tooltip="Enter the password provided by your instructor to access this module"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-150 ease-in-out transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {loading ? (
            <>
              <LoadingSpinner size="small" className="mr-2" />
              <span>Registering...</span>
            </>
          ) : (
            'Register for Module'
          )}
        </button>
      </form>
    </motion.div>
  );
};

const ModuleRegistration = () => {
  return (
    <div><AppHeader />
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <ModuleRegistrationProvider>
        <div className="w-full max-w-md">
          <RegistrationForm />
        </div>
      </ModuleRegistrationProvider>
      </div>
      </div>
  );
};

export default ModuleRegistration;