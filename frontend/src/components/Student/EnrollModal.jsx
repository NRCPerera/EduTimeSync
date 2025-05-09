import { useState } from 'react'
import { motion } from 'framer-motion'
import { useEnrollment } from './EnrollmentContext'

export default function EnrollModal() {
  const { selectedModule, closeEnrollModal, enrollInModule } = useEnrollment()
  const [moduleCode, setModuleCode] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!selectedModule) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    // Simple validation
    if (!moduleCode.trim() || !password.trim()) {
      setError('Both module code and password are required')
      setIsSubmitting(false)
      return
    }

    // Attempt to enroll
    const success = enrollInModule(selectedModule.id, moduleCode, password)
    
    if (!success) {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden"
      >
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              Enroll in Module
            </h3>
            <button 
              onClick={closeEnrollModal}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex items-center mb-6">
            <div className="bg-primary-100 rounded-md p-3 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-primary-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">
                {selectedModule.name}
              </h4>
              <p className="text-sm text-gray-600">
                Instructor: {selectedModule.instructor}
              </p>
            </div>
          </div>
          
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 p-3 bg-error-50 border border-error-200 text-error-700 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <div className="mb-4">
              <label htmlFor="moduleCode" className="block text-sm font-medium text-gray-700 mb-1">
                Module Code
              </label>
              <input
                id="moduleCode"
                type="text"
                value={moduleCode}
                onChange={(e) => setModuleCode(e.target.value)}
                placeholder="Enter module code"
                className="input"
                disabled={isSubmitting}
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Enrollment Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter enrollment password"
                className="input"
                disabled={isSubmitting}
              />
              <p className="mt-1 text-xs text-gray-500">
                For this demo, use password: "password123"
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={closeEnrollModal}
                className="btn-secondary"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </div>
                ) : 'Enroll Now'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  )
}