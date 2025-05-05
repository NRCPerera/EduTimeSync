import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

const AlertMessage = ({ type, message, duration = 0 }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [duration]);

  if (!isVisible) return null;

  const alertStyles = {
    success: 'bg-green-100 text-green-800 border-green-200',
    error: 'bg-red-100 text-red-800 border-red-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200',
  };

  const icons = {
    success: <CheckCircle size={18} className="text-green-500" />,
    error: <AlertCircle size={18} className="text-red-500" />,
    warning: <AlertCircle size={18} className="text-yellow-500" />,
    info: <AlertCircle size={18} className="text-blue-500" />,
  };

  return (
    <div className={`p-3 rounded-lg border ${alertStyles[type]} animate-fadeIn shadow-sm relative`}>
      <div className="flex">
        <div className="flex-shrink-0 mr-2">
          {icons[type]}
        </div>
        <div className="flex-1">
          {message}
        </div>
        {duration === 0 && (
          <button
            onClick={() => setIsVisible(false)}
            className="ml-2 text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default AlertMessage;