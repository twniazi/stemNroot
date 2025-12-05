import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Mail, Send, Users, BarChart2 } from 'lucide-react';
import NewEmailCampaignModal from '../modals/NewEmailCampaignModal';

export default function EmailMarketingModule() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [campaignsData, subscribersData] = await Promise.all([
        supabase.from('email_campaigns').select('*').order('created_at', { ascending: false }),
        supabase.from('email_subscribers').select('*', { count: 'exact' })
      ]);

      if (campaignsData.data) setCampaigns(campaignsData.data);
      if (subscribersData.data) setSubscribers(subscribersData.data);
    } catch (error) {
      console.error('Error fetching email data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'sent': 'bg-green-100 text-green-800',
      'scheduled': 'bg-blue-100 text-blue-800',
      'draft': 'bg-gray-100 text-gray-800',
      'sending': 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const totalSent = campaigns.filter(c => c.status === 'sent').reduce((sum, c) => sum + (c.sent_count || 0), 0);
  const avgOpenRate = campaigns.filter(c => c.status === 'sent').reduce((sum, c) => sum + (c.open_rate || 0), 0) / Math.max(campaigns.filter(c => c.status === 'sent').length, 1);
  const avgClickRate = campaigns.filter(c => c.status === 'sent').reduce((sum, c) => sum + (c.click_rate || 0), 0) / Math.max(campaigns.filter(c => c.status === 'sent').length, 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Email Marketing</h2>
          <p className="text-gray-600 mt-1">Create and manage email campaigns</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus size={20} className="mr-2" />
          New Campaign
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Subscribers', value: subscribers.length, icon: Users },
          { label: 'Emails Sent', value: totalSent.toLocaleString(), icon: Send },
          { label: 'Avg Open Rate', value: `${avgOpenRate.toFixed(1)}%`, icon: Mail },
          { label: 'Avg Click Rate', value: `${avgClickRate.toFixed(1)}%`, icon: BarChart2 }
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">{stat.label}</h3>
                <Icon size={20} className="text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Email Campaigns</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {loading ? (
            <div className="p-6 text-center text-gray-500">Loading...</div>
          ) : campaigns.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No campaigns found</div>
          ) : (
            campaigns.map((campaign) => (
              <div key={campaign.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">{campaign.subject}</h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                        {campaign.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{campaign.preview_text}</p>
                    {campaign.status === 'sent' && (
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <span>Sent: {campaign.sent_count?.toLocaleString()}</span>
                        <span>Opens: {campaign.open_rate?.toFixed(1)}%</span>
                        <span>Clicks: {campaign.click_rate?.toFixed(1)}%</span>
                        <span>Unsubscribes: {campaign.unsubscribe_count || 0}</span>
                      </div>
                    )}
                    {campaign.status === 'scheduled' && campaign.scheduled_time && (
                      <p className="text-sm text-gray-500">
                        Scheduled for: {new Date(campaign.scheduled_time).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="ml-4 text-right">
                    <p className="text-sm text-gray-500">
                      {new Date(campaign.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Campaigns</h3>
        <div className="space-y-3">
          {campaigns
            .filter(c => c.status === 'sent')
            .sort((a, b) => (b.open_rate || 0) - (a.open_rate || 0))
            .slice(0, 5)
            .map((campaign) => (
              <div key={campaign.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{campaign.subject}</p>
                  <p className="text-xs text-gray-500">{new Date(campaign.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <span className="text-gray-600">Opens: <strong>{campaign.open_rate?.toFixed(1)}%</strong></span>
                  <span className="text-gray-600">Clicks: <strong>{campaign.click_rate?.toFixed(1)}%</strong></span>
                </div>
              </div>
            ))}
        </div>
      </div>

      <NewEmailCampaignModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={fetchData}
      />
    </div>
  );
}
