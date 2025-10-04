import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import api from '../utils/api';

const SubscriptionForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    subscriptionType: 'free',
    preferences: {
      frequency: 'weekly',
      topics: ['sql-basics']
    }
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/subscribe', formData);
      toast.success('Successfully subscribed! Check your email for confirmation.');
      setFormData({
        email: '',
        name: '',
        subscriptionType: 'free',
        preferences: {
          frequency: 'weekly',
          topics: ['sql-basics']
        }
      });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to subscribe');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('preferences.')) {
      const prefKey = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [prefKey]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleTopicChange = (topic, checked) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        topics: checked 
          ? [...prev.preferences.topics, topic]
          : prev.preferences.topics.filter(t => t !== topic)
      }
    }));
  };

  const topics = [
    { id: 'sql-basics', label: 'SQL Basics' },
    { id: 'advanced-queries', label: 'Advanced Queries' },
    { id: 'database-design', label: 'Database Design' },
    { id: 'interview-tips', label: 'Interview Tips' },
    { id: 'practice-problems', label: 'Practice Problems' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Subscribe to SQL Newsletter
        </h2>
        <p className="text-gray-600">
          Get expert SQL tips and interview questions delivered to your inbox
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="your@email.com"
          />
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Name (Optional)
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Your Name"
          />
        </div>

        {/* Subscription Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subscription Plan
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="subscriptionType"
                value="free"
                checked={formData.subscriptionType === 'free'}
                onChange={handleInputChange}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm">
                <strong>Free</strong> - Weekly SQL tips
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="subscriptionType"
                value="paid"
                checked={formData.subscriptionType === 'paid'}
                onChange={handleInputChange}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm">
                <strong>Premium</strong> - Daily tips + exclusive content ($9.99/month)
              </span>
            </label>
          </div>
        </div>

        {/* Frequency */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Frequency
          </label>
          <select
            name="preferences.frequency"
            value={formData.preferences.frequency}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        {/* Topics */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Interested Topics
          </label>
          <div className="space-y-2">
            {topics.map(topic => (
              <label key={topic.id} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.preferences.topics.includes(topic.id)}
                  onChange={(e) => handleTopicChange(topic.id, e.target.checked)}
                  className="text-blue-600 focus:ring-blue-500 rounded"
                />
                <span className="ml-2 text-sm">{topic.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-300 disabled:opacity-50"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Subscribing...
            </div>
          ) : (
            'Subscribe Now'
          )}
        </button>

        <p className="text-xs text-gray-500 text-center">
          By subscribing, you agree to receive SQL tips and updates. 
          You can unsubscribe at any time.
        </p>
      </form>
    </div>
  );
};

export default SubscriptionForm;
