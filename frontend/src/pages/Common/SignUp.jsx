import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function SignUp() {
  const [formData, setFormData] = useState({});
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false); 
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword || !formData.nic || !formData.phoneNumber || !formData.address) {
      return setErrorMessage('Please fill out all fields.');
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return setErrorMessage('Please enter a valid email address.');
    }

    // Phone number validation
    const phoneNumberRegex = /^\d{10}$/;
    if (!phoneNumberRegex.test(formData.phoneNumber)) {
      return setErrorMessage('Please enter a valid 10-digit phone number.');
    }

    // NIC validation
    const nicRegex = /^[0-9]{9}[vVxX]$/;
    if (!nicRegex.test(formData.nic)) {
      return setErrorMessage('Please enter a valid NIC (e.g., 123456789V).');
    }

    // Password match validation
    if (formData.password !== formData.confirmPassword) {
      return setErrorMessage('Passwords do not match.');
    }

    // Simulate a successful sign-up process
    setLoading(true);
    setErrorMessage(null);
    setTimeout(() => {
      setLoading(false);
      navigate('/sign-in');
    }, 2000);
  };

  return (
    <div className="flex items-center justify-center min-h-screen min-w-screen bg-gray-200">
      <div className='p-6 bg-white rounded-lg shadow-lg' style={{ maxWidth: '500px', width: '100%' }}>
        <h1 className='text-3xl text-center font-semibold my-7'>Sign Up</h1>
        {errorMessage && <p className='text-red-500'>{errorMessage}</p>}
        <form onSubmit={handleSubmit} className='flex flex-col items-center gap-4'>
          <input
            type='text'
            placeholder='Username'
            className='border border-gray-300 p-3 rounded-lg'
            id='username'
            onChange={handleChange}
          />
          <input
            type='email'
            placeholder='Email'
            className='border p-3 border-gray-300 rounded-lg'
            id='email'
            onChange={handleChange}
          />
          <input
            type='password'
            placeholder='Password'
            className='border border-gray-300 p-3 rounded-lg'
            id='password'
            onChange={handleChange}
          />
          <input
            type='password'
            placeholder='Confirm Password'
            className='border border-gray-300 p-3 rounded-lg'
            id='confirmPassword'
            onChange={handleChange}
          />
          <input
            type='text'
            placeholder='NIC'
            className='border border-gray-300 p-3 rounded-lg'
            id='nic'
            onChange={handleChange}
          />
          <input
            type='text'
            placeholder='Telephone Number'
            className='border border-gray-300 p-3 rounded-lg'
            id='phoneNumber'
            onChange={handleChange}
          />
          <input
            type='text'
            placeholder='Address'
            className='border border-gray-300 p-3 rounded-lg'
            id='address'
            onChange={handleChange}
          />
          <button disabled={loading} className='bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80'>
            {loading ? 'Loading...' : 'Sign Up'}
          </button>
        </form>
        <div className='flex gap-2 mt-5'>
          <p>Have an account?</p>
          <Link to='/sign-in' className='text-blue-700'>Sign In</Link>
        </div>
      </div>
    </div>
  );
}