import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axiosConfig';
import Header from './Header';
import ApplicationTable from './ApplicationTable';
import ApplicationForm from './ApplicationForm';
import EditApplicationModal from './EditApplicationModal';

const Dashboard = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingApplication, setEditingApplication] = useState(null);
  const [error, setError] = useState('');
  const [adminEmail, setAdminEmail] = useState('');

  useEffect(() => {
    const email = localStorage.getItem('adminEmail');
    if (email) {
      setAdminEmail(email);
    }

    // Listen for add application event from header
    const handleOpenAddForm = () => {
      setShowAddForm(true);
    };
    window.addEventListener('openAddForm', handleOpenAddForm);

    return () => {
      window.removeEventListener('openAddForm', handleOpenAddForm);
    };
  }, []);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/applications');
      setApplications(response.data);
      setError('');
    } catch (err) {
      if (err.response && err.response.status !== 401) {
        setError('Failed to fetch applications. Please try again.');
      }
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminEmail');
    navigate('/login');
  };

  const handleAddApplication = async (formData, file) => {
    try {
      if (file) {
        const data = new FormData();
        Object.keys(formData).forEach(key => {
          data.append(key, formData[key]);
        });
        data.append('document', file);

        await api.post('/applications/with-document', data, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        await api.post('/applications', formData);
      }

      setShowAddForm(false);
      fetchApplications();
    } catch (err) {
      throw err;
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.patch(`/applications/${id}/status`, { status });
      fetchApplications();
    } catch (err) {
      if (err.response && err.response.status !== 401) {
        alert('Failed to update status. Please try again.');
      }
      console.error('Error updating status:', err);
    }
  };

  const handleUpdateApplication = async (id, formData) => {
    try {
      await api.put(`/applications/${id}`, formData);
      setEditingApplication(null);
      fetchApplications();
    } catch (err) {
      throw err;
    }
  };

  const handleUploadDocument = async (id, file) => {
    try {
      const formData = new FormData();
      formData.append('document', file);

      await api.post(`/applications/${id}/document`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      fetchApplications();
      alert('Document uploaded successfully!');
    } catch (err) {
      if (err.response && err.response.status !== 401) {
        alert('Failed to upload document. Please try again.');
      }
      console.error('Error uploading document:', err);
    }
  };

  const handleDeleteApplication = async (id) => {
    if (window.confirm('Are you sure you want to delete this application?')) {
      try {
        await api.delete(`/applications/${id}`);
        fetchApplications();
      } catch (err) {
        if (err.response && err.response.status !== 401) {
          alert('Failed to delete application. Please try again.');
        }
        console.error('Error deleting application:', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onLogout={handleLogout} adminEmail={adminEmail} />
      
      {/* Add padding-top to account for fixed header */}
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Visa Application Dashboard</h1>
            <p className="text-sm text-gray-600 mt-2">Manage all visa applications from this dashboard</p>
          </div>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600">Loading applications...</p>
          </div>
        ) : (
          <ApplicationTable
            applications={applications}
            onUpdateStatus={handleUpdateStatus}
            onEdit={(app) => setEditingApplication(app)}
            onUploadDocument={handleUploadDocument}
            onDelete={handleDeleteApplication}
          />
        )}
        </div>
      </div>

      {showAddForm && (
        <ApplicationForm
          onClose={() => setShowAddForm(false)}
          onSubmit={handleAddApplication}
        />
      )}

      {editingApplication && (
        <EditApplicationModal
          application={editingApplication}
          onClose={() => setEditingApplication(null)}
          onUpdate={handleUpdateApplication}
        />
      )}
    </div>
  );
};

export default Dashboard;


