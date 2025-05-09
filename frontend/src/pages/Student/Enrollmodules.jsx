import React from 'react'
import EnrollmentProvider from '../../components/Student/EnrollmentContext'
import ModuleGrid from '../../components/Student/ModuleGrid'

function Enrollmodules() {
  return (
    <EnrollmentProvider>
      <div className="min-h-screen bg-gray-50">
        <main className="container mx-auto px-4 py-8">
          <ModuleGrid />
        </main>
      </div>
    </EnrollmentProvider>
  )
}

export default Enrollmodules