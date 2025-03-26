import React from 'react'
import Header from '../../components/Header'

const Home = () => {
  return (
    <div>
        <Header />
        <div className='flex items-center justify-center min-h-screen min-w-screen bg-gray-200'>
            <div className='p-6 bg-white rounded-lg shadow-lg' style={{ maxWidth: '500px', width: '100%' }}>
            <h1 className='text-3xl text-center font-semibold my-7'>Home</h1>
            <p className='text-center'>Welcome to the home page!</p>
            </div>
        </div>
    </div>
  )
}

export default Home