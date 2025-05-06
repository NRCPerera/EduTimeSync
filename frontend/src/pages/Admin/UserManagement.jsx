import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, Trash2, PlusCircle } from 'lucide-react';
import AddUser from '../../components/AddUsers'; 
import AdminHeader from '../../components/AdminHeader';

const UserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false); // New state for toggling AddUser

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);

    if (!token) {
      setError('Please log in as an admin');
      setLoading(false);
      navigate('/sign-in');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/users/lics-examiners', {
        headers: {
          'x-auth-token': token,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.data || []);
    } catch (err) {
      setError(err.message);
      if (err.message.includes('denied')) {
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = async (user) => {
    if (!editUser) {
      setEditUser(user);
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/users/user/${editUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify(editUser),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user');
      }

      setEditUser(null);
      fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/users/user/${id}`, {
        method: 'DELETE',
        headers: {
          'x-auth-token': token,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete user');
      }

      fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <AdminHeader />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage LICs and Examiners</h1>
          <p className="text-gray-600 mt-1">Manage and update LIC and Examiner accounts</p>
        </div>
        <button
          onClick={() => setIsAddingNew(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          <PlusCircle className="h-5 w-5" />
          Add New User
        </button>
      </div>

      {isAddingNew && (
        <AddUser onUserAdded={fetchUsers} onClose={() => setIsAddingNew(false)} />
      )}

      {loading ? (
        <p className="text-center text-gray-600">Loading users...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">NIC</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Address</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editUser && editUser._id === user._id ? (
                      <input
                        type="text"
                        value={editUser.name}
                        onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                        className="p-1 border rounded"
                      />
                    ) : (
                      user.name
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editUser && editUser._id === user._id ? (
                      <input
                        type="email"
                        value={editUser.email}
                        onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                        className="p-1 border rounded"
                      />
                    ) : (
                      user.email
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editUser && editUser._id === user._id ? (
                      <select
                        value={editUser.role}
                        onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
                        className="p-1 border rounded"
                      >
                        <option value="examiner">Examiner</option>
                        <option value="lic">LIC</option>
                      </select>
                    ) : (
                      user.role
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editUser && editUser._id === user._id ? (
                      <input
                        type="text"
                        value={editUser.nic}
                        onChange={(e) => setEditUser({ ...editUser, nic: e.target.value })}
                        className="p-1 border rounded"
                      />
                    ) : (
                      user.nic
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editUser && editUser._id === user._id ? (
                      <input
                        type="text"
                        value={editUser.phoneNumber}
                        onChange={(e) => setEditUser({ ...editUser, phoneNumber: e.target.value })}
                        className="p-1 border rounded"
                      />
                    ) : (
                      user.phoneNumber
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editUser && editUser._id === user._id ? (
                      <input
                        type="text"
                        value={editUser.address}
                        onChange={(e) => setEditUser({ ...editUser, address: e.target.value })}
                        className="p-1 border rounded"
                      />
                    ) : (
                      user.address
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editUser && editUser._id === user._id ? (
                      <button
                        onClick={() => handleEditUser(user)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Save
                      </button>
                    ) : (
                      <button
                        onClick={() => handleEditUser(user)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        <Pencil className="h-5 w-5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteUser(user._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserManagement;