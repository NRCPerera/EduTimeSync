/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { Lock, Mail, Github, Twitter } from 'lucide-react';
//import axios from 'axios';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false); // Added missing loading state

  // Function to navigate to different pages (simulating routing)
  const navigate = (path) => {
    console.log(`Navigating to: ${path}`);
    window.location.href = path;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
  
    try {
      console.log('Sending sign-in request:', { email, url: 'http://localhost:5000/api/users/signin' });
      const response = await fetch('http://localhost:5000/api/users/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
  
      const data = await response.json();
      console.log('Sign-in response:', data);
  
      if (!response.ok) {
        throw new Error(data.error || `Sign-in failed (Status: ${response.status})`);
      }
  
      // Inspect token
      console.log('Token received:', data.token ? 'Token exists' : 'No token');
      
      if (!data.token) {
        throw new Error('No token received from server');
      }
      
      // Store token with debugging
      localStorage.clear(); // Clear any previous tokens
      localStorage.setItem('token', data.token);
      
      // Verify token was stored
      const savedToken = localStorage.getItem('token');
      console.log('Token saved successfully:', savedToken ? 'Yes' : 'No');
      
      if (!savedToken) {
        throw new Error('Failed to save token to localStorage');
      }
      
      // Log token format
      console.log('Token format check:', 
        savedToken.includes('.') ? 'Contains periods (likely JWT)' : 'No periods (might not be JWT)',
        'Length:', savedToken.length
      );
  
      setSuccess('Sign-in successful! Redirecting...');
  
      setTimeout(() => {
        if (data.user?.role === 'Admin') {
          navigate('/admin-dashboard');
        } else if (data.user?.role === 'LIC') {
          navigate('/lic-dashboard');
        } else if (data.user?.role === 'Examiner') {
          navigate('/examiner-dashboard');
        } else if (data.user?.role === 'Student') {
          navigate('/student-dashboard');
        } else {
          throw new Error(`Unknown user role: ${data.user?.role || 'undefined'}`);
        }
      }, 1000);
    } catch (err) {
      let errorMessage = err.message;
      if (err.message.includes('Failed to fetch')) {
        errorMessage = 'Unable to connect to the server. Please check if the backend is running at http://localhost:5000.';
      }
      setError(errorMessage);
      console.error('Sign-in error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        {/* Header */}
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Please sign in to your account
          </p>
        </div>

        {/* Error and Success Messages */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        
        {success && (
          <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg">
            {success}
          </div>
        )}

        {/* Sign In Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                Forgot your password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white ${
                loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </div>
        </form>

        {/* Social Sign In */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors duration-200"
            >
              <Github className="h-5 w-5" />
              <span className="ml-2">Github</span>
            </button>
            <button
              type="button"
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors duration-200"
            >
              <Twitter className="h-5 w-5" />
              <span className="ml-2">Twitter</span>
            </button>
          </div>
        </div>

        {/* Sign Up Link */}
        <div className="text-center text-sm">
          <span className="text-gray-600">Don't have an account?</span>
          {' '}
          <a href="sign-up" className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign up
          </a>
        </div>
        
        {/* Development Mode Quick Access */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-2">Development Options:</p>
          <div className="grid grid-cols-2 gap-2">
            <a 
              href="/lic-dashboard?dev=true" 
              className="text-xs text-center py-1 px-2 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
            >
              LIC Dashboard (Dev Mode)
            </a>
            <a 
              href="/examiner-dashboard?dev=true" 
              className="text-xs text-center py-1 px-2 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
            >
              Examiner Dashboard (Dev Mode)
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;