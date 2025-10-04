import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../utils/api';

const Admin = ({ isAdmin }) => {
  const [stats, setStats] = useState(null);
  const [newsletters, setNewsletters] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [newNewsletter, setNewNewsletter] = useState({
    title: '',
    content: '',
    targetSubscribers: 'all',
    category: 'sql-basics'
  });

  useEffect(() => {
    if (isAdmin) {
      fetchStats();
      fetchNewsletters();
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data);
    } catch (error) {
      toast.error('Failed to fetch stats');
    }
  };

  const fetchNewsletters = async () => {
    try {
      const response = await api.get('/admin/newsletters');
      setNewsletters(response.data.newsletters);
    } catch (error) {
      toast.error('Failed to fetch newsletters');
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data.users);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch users');
      setLoading(false);
    }
  };

  const createNewsletter = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/newsletter', newNewsletter);
      toast.success('Newsletter created successfully');
      setNewNewsletter({ title: '', content: '', targetSubscribers: 'all', category: 'sql-basics' });
      fetchNewsletters();
    } catch (error) {
      toast.error('Failed to create newsletter');
    }
  };

  const sendNewsletter = async (id) => {
    try {
      const response = await api.post(`/admin/newsletter/${id}/send`);
      toast.success(`Newsletter sent to ${response.data.sent} recipients`);
      fetchNewsletters();
      fetchStats();
    } catch (error) {
      toast.error('Failed to send newsletter');
    }
  };

  const scrapeContent = async () => {
    try {
      toast.loading('Scraping SQL content...', { id: 'scraping' });
      const response = await api.post('/scrape/sql-content');
      toast.success('Content scraped and newsletter created', { id: 'scraping' });
      fetchNewsletters();
    } catch (error) {
      toast.error('Failed to scrape content', { id: 'scraping' });
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <i className="fas fa-lock text-4xl text-gray-400 mb-4"></i>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your newsletter platform</p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {['dashboard', 'newsletters', 'users', 'scraping'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <i className="fas fa-users text-blue-500 text-2xl"></i>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.users.total}</dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <i className="fas fa-user-check text-green-500 text-2xl"></i>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Active Users</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.users.active}</dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <i className="fas fa-newspaper text-purple-500 text-2xl"></i>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Newsletters Sent</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.newsletters.sent}</dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <i className="fas fa-envelope-open text-orange-500 text-2xl"></i>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Email Opens</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.emailStats.opened}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Newsletter Tab */}
        {activeTab === 'newsletters' && (
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Newsletter</h3>
              <form onSubmit={createNewsletter} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    value={newNewsletter.title}
                    onChange={(e) => setNewNewsletter({...newNewsletter, title: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Content</label>
                  <textarea
                    value={newNewsletter.content}
                    onChange={(e) => setNewNewsletter({...newNewsletter, content: e.target.value})}
                    rows={6}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Target Audience</label>
                    <select
                      value={newNewsletter.targetSubscribers}
                      onChange={(e) => setNewNewsletter({...newNewsletter, targetSubscribers: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="all">All Subscribers</option>
                      <option value="free">Free Only</option>
                      <option value="paid">Paid Only</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <select
                      value={newNewsletter.category}
                      onChange={(e) => setNewNewsletter({...newNewsletter, category: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="sql-basics">SQL Basics</option>
                      <option value="advanced-queries">Advanced Queries</option>
                      <option value="database-design">Database Design</option>
                      <option value="interview-tips">Interview Tips</option>
                      <option value="practice-problems">Practice Problems</option>
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Create Newsletter
                </button>
              </form>
            </div>

            {/* Existing Newsletters */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Newsletters</h3>
              <div className="space-y-4">
                {newsletters.slice(0, 5).map((newsletter) => (
                  <div key={newsletter._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">{newsletter.title}</h4>
                        <p className="text-sm text-gray-500">
                          Status: {newsletter.status} | Target: {newsletter.targetSubscribers}
                        </p>
                      </div>
                      {newsletter.status === 'draft' && (
                        <button
                          onClick={() => sendNewsletter(newsletter._id)}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                        >
                          Send
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Subscribers</h3>
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Plan
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.slice(0, 10).map((user) => (
                      <tr key={user._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.subscriptionType === 'paid' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {user.subscriptionType}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Scraping Tab */}
        {activeTab === 'scraping' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Content Scraping</h3>
            <p className="text-gray-600 mb-6">
              Scrape latest SQL interview questions and tips from various educational websites.
            </p>
            <button
              onClick={scrapeContent}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <i className="fas fa-spider mr-2"></i>
              Scrape Content Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
