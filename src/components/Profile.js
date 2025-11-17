import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import api from '../utils/axiosConfig';

const Profile = () => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState({
    name: '',
    email: '',
    password: '',
    oldpassword: '',
    emailUpdated: false,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const { data } = await api.get('/admin/profile'); // create a backend endpoint to get current admin info
        setAdmin({
          name: data.name || '',
          email: data.email || '',
          password: '',
          oldpassword: '',
          emailUpdated: data.emailUpdated || false,
        });
      } catch (err) {
        console.log('Failed to fetch admin info', err);
      }
    };
    fetchAdmin();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAdmin((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const payload = {};

      if (admin.name) payload.name = admin.name;
      if (admin.email && !admin.emailUpdated) payload.email = admin.email;
    //   if (admin.email && !admin.emailUpdated) payload.email = admin.email;
      if (admin.password) payload.newpassword = admin.password;
      if (admin.oldpassword) payload.oldPassword = admin.oldpassword;

      if (admin.password && !admin.oldpassword) {
        setError('Please provide old password to change password');
        setLoading(false);
        return;
      }

      await api.put('/admin/update', payload);
      setMessage('Profile updated successfully');

      // Update localStorage if email changed
      if (payload.email) {
        localStorage.setItem('adminEmail', payload.email);
        setAdmin((prev) => ({ ...prev, emailUpdated: true }));
      }

      // Clear password fields
      setAdmin((prev) => ({ ...prev, password: '', oldpassword: '' }));
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="max-w-md mx-auto mt-16 p-6 bg-white shadow-md rounded-md">
        <h2 className="text-2xl font-semibold mb-4 text-indigo-600">Admin Profile</h2>

        {message && <p className="text-green-600 mb-2">{message}</p>}
        {error && <p className="text-red-600 mb-2">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              name="name"
              value={admin.name}
              onChange={handleChange}
              placeholder="Enter your name"
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={admin.email}
              onChange={handleChange}
              placeholder="Enter your email"
              disabled={admin.emailUpdated}
              className={`mt-1 block w-full border rounded-md p-2 focus:outline-none ${
                admin.emailUpdated
                  ? 'bg-gray-100 cursor-not-allowed'
                  : 'border-gray-300 focus:ring-2 focus:ring-indigo-500'
              }`}
            />
            {admin.emailUpdated && (
              <p className="text-sm text-gray-500 mt-1">Email can only be updated once.</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Old Password</label>
            <input
              type="password"
              name="oldpassword"
              value={admin.oldpassword}
              onChange={handleChange}
              placeholder="Enter old password"
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-sm text-gray-500 mt-1">
              Please add old password to change password.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">New Password</label>
            <input
              type="password"
              name="password"
              value={admin.password}
              onChange={handleChange}
              placeholder="Enter new password"
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-sm text-gray-500 mt-1">Leave blank if you don't want to change password.</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-md text-sm font-medium transition-colors"
          >
            {loading ? 'Updating...' : 'Update Profile'}
          </button>
        </form>

        <button
          onClick={() => navigate('/dashboard')}
          className="mt-4 w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-md text-sm font-medium transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    </>
  );
};

export default Profile;
