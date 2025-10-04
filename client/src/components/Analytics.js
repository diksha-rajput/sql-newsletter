import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../utils/api';

const Analytics = ({ newsletterId }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (newsletterId) {
      fetchAnalytics();
    }
  }, [newsletterId]);

  const fetchAnalytics = async () => {
    try {
      const response = await api.get(`/analytics/summary/${newsletterId}`);
      setAnalytics(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No analytics data available</p>
      </div>
    );
  }

  const pieData = [
    { name: 'Opened', value: analytics.stats.opened, color: '#3B82F6' },
    { name: 'Clicked', value: analytics.stats.clicked, color: '#10B981' },
    { name: 'Bounced', value: analytics.stats.bounced, color: '#EF4444' }
  ];

  const engagementData = [
    { name: 'Sent', value: analytics.newsletter.sentTo },
    { name: 'Delivered', value: analytics.stats.delivered },
    { name: 'Opened', value: analytics.stats.opened },
    { name: 'Clicked', value: analytics.stats.clicked }
  ];

  return (
    <div className="space-y-6">
      {/* Newsletter Info */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {analytics.newsletter.title}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-500">Sent To</p>
            <p className="text-2xl font-bold text-gray-900">{analytics.newsletter.sentTo}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Open Rate</p>
            <p className="text-2xl font-bold text-blue-600">{analytics.rates.openRate}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Click Rate</p>
            <p className="text-2xl font-bold text-green-600">{analytics.rates.clickRate}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Sent Date</p>
            <p className="text-sm text-gray-700">
              {new Date(analytics.newsletter.sentAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h4 className="text-md font-semibold text-gray-900 mb-4">Engagement Breakdown</h4>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h4 className="text-md font-semibold text-gray-900 mb-4">Engagement Funnel</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={engagementData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={80} />
              <Tooltip />
              <Bar dataKey="value" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h4 className="text-md font-semibold text-gray-900 mb-4">Detailed Statistics</h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(analytics.stats).map(([key, value]) => (
            <div key={key} className="text-center p-3 bg-gray-50 rounded">
              <p className="text-sm text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
              <p className="text-xl font-semibold text-gray-900">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
