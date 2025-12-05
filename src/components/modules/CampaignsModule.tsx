import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Target, DollarSign, TrendingUp, Eye, MousePointer, Users, BarChart3, PlayCircle, PauseCircle, CreditCard as Edit, Trash2, Copy, AlertCircle, CheckCircle, Clock, TrendingDown, Zap, Filter, Download, RefreshCw, Settings } from 'lucide-react';
import NewCampaignModal from '../modals/NewCampaignModal';

interface Campaign {
  id: string;
  name: string;
  channel: string;
  status: string;
  budget: number;
  spent: number;
  objective: string;
  start_date: string;
  end_date: string;
  target_audience: any;
  created_at: string;
}

interface CampaignPerformance {
  campaign_id: string;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  ctr: number;
  cpc: number;
  cpa: number;
  roas: number;
}

export default function CampaignsModule() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [performance, setPerformance] = useState<Record<string, CampaignPerformance>>({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterChannel, setFilterChannel] = useState('all');

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const [campaignsData, performanceData] = await Promise.all([
        supabase
          .from('campaigns')
          .select('*')
          .order('start_date', { ascending: false }),
        supabase
          .from('campaign_performance')
          .select('*')
      ]);

      if (campaignsData.data) {
        setCampaigns(campaignsData.data);
      }

      if (performanceData.data) {
        const perfMap: Record<string, CampaignPerformance> = {};
        performanceData.data.forEach((perf: any) => {
          if (!perfMap[perf.campaign_id]) {
            perfMap[perf.campaign_id] = {
              campaign_id: perf.campaign_id,
              impressions: 0,
              clicks: 0,
              conversions: 0,
              revenue: 0,
              ctr: 0,
              cpc: 0,
              cpa: 0,
              roas: 0
            };
          }
          perfMap[perf.campaign_id].impressions += perf.impressions || 0;
          perfMap[perf.campaign_id].clicks += perf.clicks || 0;
          perfMap[perf.campaign_id].conversions += perf.conversions || 0;
          perfMap[perf.campaign_id].revenue += perf.revenue || 0;
        });

        Object.keys(perfMap).forEach(id => {
          const p = perfMap[id];
          p.ctr = p.impressions > 0 ? (p.clicks / p.impressions) * 100 : 0;
          const campaign = campaignsData.data?.find(c => c.id === id);
          const spent = campaign?.spent || 0;
          p.cpc = p.clicks > 0 ? spent / p.clicks : 0;
          p.cpa = p.conversions > 0 ? spent / p.conversions : 0;
          p.roas = spent > 0 ? (p.revenue / spent) * 100 : 0;
        });

        setPerformance(perfMap);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePauseCampaign = async (id: string) => {
    try {
      await supabase
        .from('campaigns')
        .update({ status: 'paused' })
        .eq('id', id);
      fetchCampaigns();
    } catch (error) {
      console.error('Error pausing campaign:', error);
    }
  };

  const handleResumeCampaign = async (id: string) => {
    try {
      await supabase
        .from('campaigns')
        .update({ status: 'active' })
        .eq('id', id);
      fetchCampaigns();
    } catch (error) {
      console.error('Error resuming campaign:', error);
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;

    try {
      await supabase
        .from('campaigns')
        .delete()
        .eq('id', id);
      fetchCampaigns();
    } catch (error) {
      console.error('Error deleting campaign:', error);
    }
  };

  const handleDuplicateCampaign = async (campaign: Campaign) => {
    try {
      const newCampaign = {
        ...campaign,
        name: `${campaign.name} (Copy)`,
        status: 'draft',
        id: undefined,
        created_at: undefined
      };

      await supabase.from('campaigns').insert([newCampaign]);
      fetchCampaigns();
      alert('Campaign duplicated successfully!');
    } catch (error) {
      console.error('Error duplicating campaign:', error);
    }
  };

  const getChannelColor = (channel: string) => {
    const colors: Record<string, string> = {
      'Facebook': 'bg-blue-100 text-blue-800',
      'Google Ads': 'bg-red-100 text-red-800',
      'Email': 'bg-green-100 text-green-800',
      'Instagram': 'bg-pink-100 text-pink-800',
      'LinkedIn': 'bg-cyan-100 text-cyan-800',
      'Twitter': 'bg-sky-100 text-sky-800',
      'TikTok': 'bg-purple-100 text-purple-800'
    };
    return colors[channel] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'active': 'bg-green-100 text-green-800',
      'paused': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-gray-100 text-gray-800',
      'draft': 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return CheckCircle;
      case 'paused': return PauseCircle;
      case 'completed': return CheckCircle;
      case 'draft': return Clock;
      default: return AlertCircle;
    }
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    const statusMatch = filterStatus === 'all' || campaign.status === filterStatus;
    const channelMatch = filterChannel === 'all' || campaign.channel === filterChannel;
    return statusMatch && channelMatch;
  });

  const totalBudget = campaigns.reduce((sum, c) => sum + Number(c.budget || 0), 0);
  const totalSpent = campaigns.reduce((sum, c) => sum + Number(c.spent || 0), 0);
  const totalImpressions = Object.values(performance).reduce((sum, p) => sum + p.impressions, 0);
  const totalClicks = Object.values(performance).reduce((sum, p) => sum + p.clicks, 0);
  const totalConversions = Object.values(performance).reduce((sum, p) => sum + p.conversions, 0);
  const totalRevenue = Object.values(performance).reduce((sum, p) => sum + p.revenue, 0);
  const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const avgCPC = totalClicks > 0 ? totalSpent / totalClicks : 0;
  const avgROAS = totalSpent > 0 ? (totalRevenue / totalSpent) * 100 : 0;

  const channels = [...new Set(campaigns.map(c => c.channel))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Advertising Campaigns</h2>
          <p className="text-gray-600 mt-1">Create, manage and optimize your online advertising campaigns</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchCampaigns}
            className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={20} className="mr-2" />
            Refresh
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus size={20} className="mr-2" />
            New Campaign
          </button>
        </div>
      </div>

      {/* Performance Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Budget</h3>
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign size={20} className="text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">PKR {totalBudget.toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-1">Spent: PKR {totalSpent.toLocaleString()}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Impressions</h3>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Eye size={20} className="text-purple-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{(totalImpressions / 1000).toFixed(1)}K</p>
          <p className="text-sm text-gray-500 mt-1">Across all campaigns</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Clicks</h3>
            <div className="p-2 bg-green-100 rounded-lg">
              <MousePointer size={20} className="text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalClicks.toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-1">CTR: {avgCTR.toFixed(2)}%</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Conversions</h3>
            <div className="p-2 bg-orange-100 rounded-lg">
              <Target size={20} className="text-orange-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalConversions}</p>
          <p className="text-sm text-gray-500 mt-1">ROAS: {avgROAS.toFixed(0)}%</p>
        </div>
      </div>

      {/* Campaign Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <Target size={20} className="text-gray-700" />
            <h3 className="text-sm font-medium text-gray-600">Total Campaigns</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{campaigns.length}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <PlayCircle size={20} className="text-green-600" />
            <h3 className="text-sm font-medium text-gray-600">Active</h3>
          </div>
          <p className="text-3xl font-bold text-green-600">
            {campaigns.filter(c => c.status === 'active').length}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <PauseCircle size={20} className="text-yellow-600" />
            <h3 className="text-sm font-medium text-gray-600">Paused</h3>
          </div>
          <p className="text-3xl font-bold text-yellow-600">
            {campaigns.filter(c => c.status === 'paused').length}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <Clock size={20} className="text-blue-600" />
            <h3 className="text-sm font-medium text-gray-600">Draft</h3>
          </div>
          <p className="text-3xl font-bold text-blue-600">
            {campaigns.filter(c => c.status === 'draft').length}
          </p>
        </div>
      </div>

      {/* Top Performing Campaigns */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Zap size={20} className="text-yellow-600" />
          <h3 className="text-lg font-semibold text-gray-900">Top Performing Campaigns</h3>
        </div>
        <div className="space-y-3">
          {campaigns
            .filter(c => performance[c.id])
            .sort((a, b) => (performance[b.id]?.roas || 0) - (performance[a.id]?.roas || 0))
            .slice(0, 5)
            .map(campaign => {
              const perf = performance[campaign.id];
              return (
                <div key={campaign.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-medium text-gray-900">{campaign.name}</h4>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getChannelColor(campaign.channel)}`}>
                        {campaign.channel}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span>Impressions: {(perf.impressions / 1000).toFixed(1)}K</span>
                      <span>Clicks: {perf.clicks}</span>
                      <span>CTR: {perf.ctr.toFixed(2)}%</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">ROAS</p>
                    <p className="text-2xl font-bold text-green-600">{perf.roas.toFixed(0)}%</p>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="draft">Draft</option>
            <option value="completed">Completed</option>
          </select>
          <select
            value={filterChannel}
            onChange={(e) => setFilterChannel(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">All Channels</option>
            {channels.map(channel => (
              <option key={channel} value={channel}>{channel}</option>
            ))}
          </select>
          <button className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">All Campaigns ({filteredCampaigns.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredCampaigns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center">
                    <Target size={48} className="mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500">No campaigns found</p>
                    <button
                      onClick={() => setShowModal(true)}
                      className="mt-4 text-green-600 hover:text-green-700 font-medium"
                    >
                      Create your first campaign
                    </button>
                  </td>
                </tr>
              ) : (
                filteredCampaigns.map((campaign) => {
                  const StatusIcon = getStatusIcon(campaign.status);
                  const perf = performance[campaign.id];
                  const budgetUsed = campaign.budget > 0 ? (campaign.spent / campaign.budget) * 100 : 0;

                  return (
                    <tr key={campaign.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getChannelColor(campaign.channel)}`}>
                                {campaign.channel}
                              </span>
                              <span className="text-xs text-gray-500">{campaign.objective}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(campaign.status)}`}>
                          <StatusIcon size={12} />
                          {campaign.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {perf ? (
                          <div className="text-sm">
                            <div className="text-gray-900 font-medium">{(perf.impressions / 1000).toFixed(1)}K impressions</div>
                            <div className="text-gray-500 text-xs">
                              {perf.clicks} clicks • CTR {perf.ctr.toFixed(2)}% • {perf.conversions} conv.
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">No data</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="text-gray-900 font-medium">PKR {campaign.budget.toLocaleString()}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="w-24 bg-gray-200 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full ${budgetUsed > 90 ? 'bg-red-600' : budgetUsed > 70 ? 'bg-yellow-600' : 'bg-green-600'}`}
                                style={{ width: `${Math.min(budgetUsed, 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-500">{budgetUsed.toFixed(0)}%</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>{new Date(campaign.start_date).toLocaleDateString()}</div>
                        <div className="text-xs text-gray-400">
                          to {campaign.end_date ? new Date(campaign.end_date).toLocaleDateString() : 'Ongoing'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          {campaign.status === 'active' ? (
                            <button
                              onClick={() => handlePauseCampaign(campaign.id)}
                              className="text-yellow-600 hover:text-yellow-900"
                              title="Pause"
                            >
                              <PauseCircle size={18} />
                            </button>
                          ) : campaign.status === 'paused' ? (
                            <button
                              onClick={() => handleResumeCampaign(campaign.id)}
                              className="text-green-600 hover:text-green-900"
                              title="Resume"
                            >
                              <PlayCircle size={18} />
                            </button>
                          ) : null}
                          <button
                            onClick={() => handleDuplicateCampaign(campaign)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Duplicate"
                          >
                            <Copy size={18} />
                          </button>
                          <button className="text-gray-600 hover:text-gray-900" title="Edit">
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteCampaign(campaign.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <NewCampaignModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={fetchCampaigns}
      />
    </div>
  );
}
