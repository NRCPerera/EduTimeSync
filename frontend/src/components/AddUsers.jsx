import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AddUser = ({ onUserAdded }) => {
  const navigate = useNavigate();
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Examiner',
    nic: '',
    phoneNumber: '',
    address: '',
  });
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');

  const handleAddUser = async (e) => {
    e.preventDefault();  // Ensure form doesn't auto-submit
  
    console.log("Current User State Before Validation:", newUser);
  
    // Ensure the fields are actually populated
    if (!newUser.name || !newUser.email || !newUser.password) {
      console.error("Validation Failed: Missing required fields");
      setError('Name, email, and password are required');
      return;
    }
  
    try {
      console.log("Sending request with:", JSON.stringify(newUser, null, 2));
  
      const response = await fetch('http://localhost:5000/api/users/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify(newUser),
      });
  
      const responseData = await response.json();
      console.log("Server Response:", responseData);
  
      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to add user');
      }
  
      console.log("User added successfully!");
  
      setNewUser({ name: '', email: '', password: '', role: 'examiner', nic: '', phoneNumber: '', address: '' });
      setError(null);
      if (onUserAdded) onUserAdded();
    } catch (err) {
      console.error("Error Occurred:", err.message);
      setError(err.message);
      if (err.message.includes('denied')) {
        navigate('/sign-in');
      }
    }
  };
  
  

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <h2 className="text-xl font-semibold mb-4">Add New User</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Name"
          value={newUser.name}
          onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
          className="p-2 border rounded"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={newUser.email}
          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          className="p-2 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={newUser.password}
          onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
          className="p-2 border rounded"
          required
        />
        <select
          value={newUser.role}
          onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
          className="p-2 border rounded"
        >
          <option value="Examiner">Examiner</option>
          <option value="LIC">LIC</option>
        </select>
        <input
          type="text"
          placeholder="NIC (e.g., 123456789V)"
          value={newUser.nic}
          onChange={(e) => setNewUser({ ...newUser, nic: e.target.value })}
          className="p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Phone Number (10 digits)"
          value={newUser.phoneNumber}
          onChange={(e) => setNewUser({ ...newUser, phoneNumber: e.target.value })}
          className="p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Address"
          value={newUser.address}
          onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
          className="p-2 border rounded md:col-span-2"
        />
        <button type="submit" className="p-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 md:col-span-2">
          Add User
        </button>
      </form>
    </div>
  );
};

export default AddUser;