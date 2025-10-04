import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import api from '../utils/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [analyticsData, setAnalyticsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, analyticsResponse] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/analytics/dashboard')
      ]);

      setStats(statsResponse.data);
      setAnalyticsData(analyticsResponse.data.engagementTrends);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Failed to load dashboard data</p>
      </div>
    );
  }

  const chartData = analyticsData.reduce((acc, item) => {
    const date = item._id.date;
    const existing = acc.find(d => d.date === date);

    if (existing) {
      existing[item._id.eventType] = item.count;
    } else {
      acc.push({
        date,
        [item._id.eventType]: item.count
      });
    }

    return acc;
  }, []);

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stats-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <i className="fas fa-users text-blue-500 text-2xl"></i>
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Total Subscribers</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.users.total}</p>
              <p className="text-sm text-green-600">
                {stats.users.active} active
              </p>
            </div>
          </div>
        </div>

        <div className="stats-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <i className="fas fa-crown text-yellow-500 text-2xl"></i>
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Premium Users</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.users.paid}</p>
              <p className="text-sm text-gray-500">
                {((stats.users.paid / stats.users.total) * 100).toFixed(1)}% conversion
              </p>
            </div>
          </div>
        </div>

        <div className="stats-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <i className="fas fa-envelope text-purple-500 text-2xl"></i>
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Newsletters Sent</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.newsletters.sent}</p>
              <p className="text-sm text-gray-500">
                {stats.newsletters.total} total created
              </p>
            </div>
          </div>
        </div>

        <div className="stats-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <i className="fas fa-chart-line text-green-500 text-2xl"></i>
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Open Rate</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.emailStats.sent > 0 
                  ? ((stats.emailStats.opened / stats.emailStats.sent) * 100).toFixed(1)
                  : 0
                }%
              </p>
              <p className="text-sm text-gray-500">
                {stats.emailStats.opened} opens
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      {chartData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Email Engagement Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="opened" stroke="#3B82F6" name="Opens" />
                <Line type="monotone" dataKey="clicked" stroke="#10B981" name="Clicks" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Daily Activity</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="opened" fill="#3B82F6" name="Opens" />
                <Bar dataKey="clicked" fill="#10B981" name="Clicks" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recent Signups */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Signups</h3>
          <div className="space-y-3">
            {stats.recentSignups.map((user, index) => (
              <div key={user._id || index} className="flex items-center justify-between py-2 border-b border-gray-100">
                <div>
                  <p className="text-sm font-medium text-gray-900">{user.email}</p>
                  <p className="text-xs text-gray-500">{user.name || 'No name provided'}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    user.subscriptionType === 'paid' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user.subscriptionType}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
