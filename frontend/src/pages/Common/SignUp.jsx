import React, { useState } from 'react';
import { useNavigate, Link  } from 'react-router-dom';

const SignUp = () => {
  const [errorMessage, setErrorMessage] = useState(null);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    nic: '',
    phoneNumber: '',
    address: '',
    role: 'Student' // Default role
});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    // Client-side validation
    if (!formData.username || !formData.email || !formData.password || !formData.nic || !formData.phoneNumber || !formData.address) {
      setLoading(false);
      return setErrorMessage('Please fill out all fields.');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setLoading(false);
      return setErrorMessage('Please enter a valid email address.');
    }

    const phoneNumberRegex = /^\d{10}$/;
    if (!phoneNumberRegex.test(formData.phoneNumber)) {
      setLoading(false);
      return setErrorMessage('Please enter a valid 10-digit phone number.');
    }

    // const nicRegex = /^[0-9]{9}[vVxX]$/;
    // if (!nicRegex.test(formData.nic)) {
    //   setLoading(false);
    //   return setErrorMessage('Please enter a valid NIC (e.g., 123456789V).');
    // }

    if (formData.password !== formData.confirmPassword) {
      setLoading(false);
      return setErrorMessage('Passwords do not match.');
    }

    try {
      const response = await fetch('http://localhost:5000/api/users/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.username,
          email: formData.email,
          password: formData.password,
          nic: formData.nic,
          phoneNumber: formData.phoneNumber,
          address: formData.address,
          role: formData.role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Sign up failed');
      }

      setLoading(false);
      localStorage.setItem('token', data.token); // Store token
      navigate('/sign-in'); // Redirect to sign-in page (or dashboard if preferred)
    } catch (error) {
      setLoading(false);
      setErrorMessage(error.message);
      console.error('Sign up error:', error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen min-w-screen bg-gray-200">
      <div className='p-6 bg-white rounded-lg shadow-lg' style={{ maxWidth: '500px', width: '100%' }}>
        <h1 className='text-3xl text-center font-semibold my-7'>Sign Up</h1>
        {errorMessage && <p className='text-red-500 text-center'>{errorMessage}</p>}
        <form onSubmit={handleSubmit} className='flex flex-col items-center gap-4'>
          <input
            type='text'
            placeholder='Username'
            className='border border-gray-300 p-3 rounded-lg w-full'
            name='username'
            onChange={handleChange}
          />
          <input
            type='email'
            placeholder='Email'
            className='border p-3 border-gray-300 rounded-lg w-full'
            name='email'
            onChange={handleChange}
          />
          <input
            type='password'
            placeholder='Password'
            className='border border-gray-300 p-3 rounded-lg w-full'
            name='password'
            onChange={handleChange}
          />
          <input
            type='password'
            placeholder='Confirm Password'
            className='border border-gray-300 p-3 rounded-lg w-full'
            name='confirmPassword'
            onChange={handleChange}
          />
          <input
            type='text'
            placeholder='NIC'
            className='border border-gray-300 p-3 rounded-lg w-full'
            name='nic'
            onChange={handleChange}
          />
          <input
            type='text'
            placeholder='Telephone Number'
            className='border border-gray-300 p-3 rounded-lg w-full'
            name='phoneNumber'
            onChange={handleChange}
          />
          <input
            type='text'
            placeholder='Address'
            className='border border-gray-300 p-3 rounded-lg w-full'
            name='address'
            onChange={handleChange}
          />
          <button
            disabled={loading}
            className='bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80 w-full'
          >
            {loading ? 'Loading...' : 'Sign Up'}
          </button>
        </form>
        <div className='flex gap-2 mt-5 justify-center'>
          <p>Have an account?</p>
          <Link to='/sign-in' className='text-blue-700'>Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default SignUp;