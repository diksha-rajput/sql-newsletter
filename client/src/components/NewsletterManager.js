import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Analytics from './Analytics';
import api from '../utils/api';

const NewsletterManager = () => {
  const [newsletters, setNewsletters] = useState([]);
  const [selectedNewsletter, setSelectedNewsletter] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNewsletters();
  }, []);

  const fetchNewsletters = async () => {
    try {
      const response = await api.get('/admin/newsletters');
      setNewsletters(response.data.newsletters);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch newsletters');
      setLoading(false);
    }
  };

  const sendNewsletter = async (id) => {
    try {
      toast.loading('Sending newsletter...', { id: 'sending' });
      const response = await api.post(`/admin/newsletter/${id}/send`);
      toast.success(`Newsletter sent to ${response.data.sent} recipients`, { id: 'sending' });
      fetchNewsletters();
    } catch (error) {
      toast.error('Failed to send newsletter', { id: 'sending' });
    }
  };

  const deleteNewsletter = async (id) => {
    if (window.confirm('Are you sure you want to delete this newsletter?')) {
      try {
        await api.delete(`/admin/newsletter/${id}`);
        toast.success('Newsletter deleted');
        fetchNewsletters();
      } catch (error) {
        toast.error('Failed to delete newsletter');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (showAnalytics && selectedNewsletter) {
    return (
      <div>
        <button
          onClick={() => setShowAnalytics(false)}
          className="mb-4 text-blue-600 hover:text-blue-800 flex items-center"
        >
          <i className="fas fa-arrow-left mr-2"></i>
          Back to Newsletters
        </button>
        <Analytics newsletterId={selectedNewsletter._id} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Newsletter Management</h3>
        <span className="text-sm text-gray-500">{newsletters.length} newsletters</span>
      </div>

      <div className="grid gap-6">
        {newsletters.map((newsletter) => (
          <div key={newsletter._id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h4 className="text-lg font-medium text-gray-900">{newsletter.title}</h4>
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(newsletter.status)}`}>
                    {newsletter.status}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {newsletter.excerpt || newsletter.content?.substring(0, 150) + '...'}
                </p>

                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <span>
                    <i className="fas fa-calendar mr-1"></i>
                    {new Date(newsletter.createdAt).toLocaleDateString()}
                  </span>
                  <span>
                    <i className="fas fa-users mr-1"></i>
                    Target: {newsletter.targetSubscribers}
                  </span>
                  <span>
                    <i className="fas fa-tag mr-1"></i>
                    {newsletter.category}
                  </span>
                  {newsletter.sentAt && (
                    <span>
                      <i className="fas fa-paper-plane mr-1"></i>
                      Sent to {newsletter.sentTo?.count || 0} recipients
                    </span>
                  )}
                </div>

                {newsletter.status === 'sent' && newsletter.analytics && (
                  <div className="mt-3 flex items-center space-x-4 text-sm">
                    <span className="text-blue-600">
                      <i className="fas fa-envelope-open mr-1"></i>
                      {newsletter.analytics.opened} opens
                    </span>
                    <span className="text-green-600">
                      <i className="fas fa-mouse-pointer mr-1"></i>
                      {newsletter.analytics.clicked} clicks
                    </span>
                    <span className="text-gray-500">
                      Open rate: {newsletter.sentTo?.count > 0 ? 
                        ((newsletter.analytics.opened / newsletter.sentTo.count) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2 ml-4">
                {newsletter.status === 'sent' && (
                  <button
                    onClick={() => {
                      setSelectedNewsletter(newsletter);
                      setShowAnalytics(true);
                    }}
                    className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
                  >
                    <i className="fas fa-chart-bar mr-1"></i>
                    Analytics
                  </button>
                )}

                {newsletter.status === 'draft' && (
                  <button
                    onClick={() => sendNewsletter(newsletter._id)}
                    className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                  >
                    <i className="fas fa-paper-plane mr-1"></i>
                    Send Now
                  </button>
                )}

                <button
                  onClick={() => deleteNewsletter(newsletter._id)}
                  className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                >
                  <i className="fas fa-trash mr-1"></i>
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {newsletters.length === 0 && (
        <div className="text-center py-12">
          <i className="fas fa-newspaper text-4xl text-gray-400 mb-4"></i>
          <p className="text-gray-500">No newsletters created yet</p>
          <p className="text-sm text-gray-400">Create your first newsletter to get started</p>
        </div>
      )}
    </div>
  );
};

export default NewsletterManager;
