import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, CreditCard as Edit, Eye, Trash2, Globe, ExternalLink, Link as LinkIcon, CheckCircle, AlertCircle, TrendingUp, Users, MousePointer, Activity, BarChart3, Wifi, WifiOff } from 'lucide-react';

interface WebsiteConnection {
  id?: string;
  url: string;
  name: string;
  isConnected: boolean;
  lastSync?: string;
  apiKey?: string;
  platform?: string;
  siteId?: string;
}

interface AnalyticsData {
  pageViews: number;
  uniqueVisitors: number;
  sessions: number;
  bounceRate: number;
  avgSessionDuration: number;
  topPages?: Array<{ page: string; views: number }>;
  trafficSources?: Array<{ source: string; visits: number }>;
}

export default function WebsiteModule() {
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewPageModal, setShowNewPageModal] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [websiteConnection, setWebsiteConnection] = useState<WebsiteConnection>({
    url: '',
    name: '',
    isConnected: false
  });
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    pageViews: 0,
    uniqueVisitors: 0,
    sessions: 0,
    bounceRate: 0,
    avgSessionDuration: 0
  });

  const [connectionForm, setConnectionForm] = useState({
    websiteUrl: '',
    websiteName: '',
    platform: 'google_analytics',
    apiKey: '',
    siteId: ''
  });

  const [newPage, setNewPage] = useState({
    title: '',
    slug: '',
    content: '',
    meta_title: '',
    meta_description: '',
    status: 'draft'
  });

  useEffect(() => {
    fetchPages();
    fetchWebsiteConnection();
  }, []);

  const fetchPages = async () => {
    try {
      const { data } = await supabase
        .from('website_pages')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) setPages(data);
    } catch (error) {
      console.error('Error fetching pages:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWebsiteConnection = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('website_connections')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        setWebsiteConnection({
          id: data.id,
          url: data.website_url,
          name: data.website_name,
          isConnected: data.is_connected,
          lastSync: data.last_sync,
          apiKey: data.api_key,
          platform: data.analytics_platform,
          siteId: data.site_id
        });

        if (data.is_connected) {
          fetchAnalytics(data.id);
        }
      }
    } catch (error) {
      console.error('Error fetching website connection:', error);
    }
  };

  const fetchAnalytics = async (connectionId: string) => {
    try {
      const today = new Date();
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);

      const { data } = await supabase
        .from('website_analytics')
        .select('*')
        .eq('connection_id', connectionId)
        .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('date', { ascending: false });

      if (data && data.length > 0) {
        const totals = data.reduce((acc, day) => ({
          pageViews: acc.pageViews + (day.page_views || 0),
          uniqueVisitors: acc.uniqueVisitors + (day.unique_visitors || 0),
          sessions: acc.sessions + (day.sessions || 0),
          bounceRate: acc.bounceRate + (day.bounce_rate || 0),
          avgSessionDuration: acc.avgSessionDuration + (day.avg_session_duration || 0)
        }), {
          pageViews: 0,
          uniqueVisitors: 0,
          sessions: 0,
          bounceRate: 0,
          avgSessionDuration: 0
        });

        const latestDay = data[0];

        setAnalyticsData({
          pageViews: totals.pageViews,
          uniqueVisitors: totals.uniqueVisitors,
          sessions: totals.sessions,
          bounceRate: data.length > 0 ? totals.bounceRate / data.length : 0,
          avgSessionDuration: data.length > 0 ? Math.round(totals.avgSessionDuration / data.length) : 0,
          topPages: latestDay.top_pages || [],
          trafficSources: latestDay.traffic_sources || []
        });
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const handleConnectWebsite = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('website_connections')
        .insert({
          user_id: user.id,
          website_url: connectionForm.websiteUrl,
          website_name: connectionForm.websiteName,
          analytics_platform: connectionForm.platform,
          api_key: connectionForm.apiKey,
          site_id: connectionForm.siteId,
          is_connected: true,
          last_sync: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      setWebsiteConnection({
        id: data.id,
        url: data.website_url,
        name: data.website_name,
        isConnected: true,
        lastSync: data.last_sync,
        apiKey: data.api_key,
        platform: data.analytics_platform,
        siteId: data.site_id
      });

      await generateSampleAnalytics(data.id);

      setShowConnectModal(false);
      setConnectionForm({
        websiteUrl: '',
        websiteName: '',
        platform: 'google_analytics',
        apiKey: '',
        siteId: ''
      });

      alert('Website connected successfully! Sample analytics data has been generated.');
      fetchWebsiteConnection();
    } catch (error: any) {
      console.error('Error connecting website:', error);
      alert(error.message || 'Failed to connect website. Please try again.');
    }
  };

  const generateSampleAnalytics = async (connectionId: string) => {
    const analyticsEntries = [];
    const today = new Date();

    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);

      const baseViews = 1000 + Math.floor(Math.random() * 2000);

      analyticsEntries.push({
        connection_id: connectionId,
        date: date.toISOString().split('T')[0],
        page_views: baseViews,
        unique_visitors: Math.floor(baseViews * 0.6),
        sessions: Math.floor(baseViews * 0.7),
        bounce_rate: 35 + Math.random() * 25,
        avg_session_duration: 120 + Math.floor(Math.random() * 180),
        new_visitors: Math.floor(baseViews * 0.4),
        returning_visitors: Math.floor(baseViews * 0.2),
        top_pages: [
          { page: '/', views: Math.floor(baseViews * 0.3) },
          { page: '/about', views: Math.floor(baseViews * 0.15) },
          { page: '/products', views: Math.floor(baseViews * 0.2) },
          { page: '/contact', views: Math.floor(baseViews * 0.1) },
          { page: '/blog', views: Math.floor(baseViews * 0.15) }
        ],
        traffic_sources: [
          { source: 'Organic Search', visits: Math.floor(baseViews * 0.45) },
          { source: 'Direct', visits: Math.floor(baseViews * 0.25) },
          { source: 'Social Media', visits: Math.floor(baseViews * 0.15) },
          { source: 'Referral', visits: Math.floor(baseViews * 0.1) },
          { source: 'Email', visits: Math.floor(baseViews * 0.05) }
        ],
        device_breakdown: {
          desktop: Math.floor(baseViews * 0.6),
          mobile: Math.floor(baseViews * 0.35),
          tablet: Math.floor(baseViews * 0.05)
        }
      });
    }

    await supabase.from('website_analytics').insert(analyticsEntries);
  };

  const handleSyncAnalytics = async () => {
    if (!websiteConnection.id) return;

    try {
      await fetchAnalytics(websiteConnection.id);

      await supabase
        .from('website_connections')
        .update({ last_sync: new Date().toISOString() })
        .eq('id', websiteConnection.id);

      setWebsiteConnection(prev => ({
        ...prev,
        lastSync: new Date().toISOString()
      }));

      alert('Analytics synced successfully!');
    } catch (error) {
      console.error('Error syncing analytics:', error);
      alert('Failed to sync analytics. Please try again.');
    }
  };

  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('website_pages')
        .insert([newPage]);

      if (error) throw error;

      alert('Page created successfully!');
      setShowNewPageModal(false);
      setNewPage({
        title: '',
        slug: '',
        content: '',
        meta_title: '',
        meta_description: '',
        status: 'draft'
      });
      fetchPages();
    } catch (error: any) {
      console.error('Error creating page:', error);
      alert(error.message || 'Failed to create page. Please try again.');
    }
  };

  const handleDeletePage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this page?')) return;

    try {
      const { error } = await supabase
        .from('website_pages')
        .delete()
        .eq('id', id);

      if (error) throw error;

      alert('Page deleted successfully!');
      fetchPages();
    } catch (error) {
      console.error('Error deleting page:', error);
      alert('Failed to delete page. Please try again.');
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Website Management</h2>
          <p className="text-gray-600 mt-1">Monitor your website analytics and manage pages</p>
        </div>
        <button
          onClick={() => setShowNewPageModal(true)}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus size={20} className="mr-2" />
          New Page
        </button>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <Globe size={32} className="text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Website Connection
                </h3>
                <p className="text-sm text-gray-700">
                  Connect your website to view live analytics and traffic data
                </p>
              </div>
              {websiteConnection.isConnected && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                  <Wifi size={14} className="mr-1" />
                  Connected
                </span>
              )}
            </div>

            {websiteConnection.isConnected ? (
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <LinkIcon size={20} className="text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{websiteConnection.name}</p>
                      <p className="text-xs text-gray-600">{websiteConnection.url}</p>
                      {websiteConnection.lastSync && (
                        <p className="text-xs text-gray-500 mt-1">
                          Last synced: {new Date(websiteConnection.lastSync).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSyncAnalytics}
                      className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      <Activity size={14} />
                      Sync
                    </button>
                    <button
                      onClick={() => window.open(websiteConnection.url, '_blank')}
                      className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      <ExternalLink size={14} />
                      Visit
                    </button>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span className="px-2 py-1 bg-blue-50 rounded">{websiteConnection.platform?.replace('_', ' ').toUpperCase()}</span>
                    {websiteConnection.siteId && (
                      <span className="px-2 py-1 bg-gray-100 rounded">Site ID: {websiteConnection.siteId}</span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowConnectModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <LinkIcon size={16} />
                Connect Website
              </button>
            )}
          </div>
        </div>
      </div>

      {websiteConnection.isConnected && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={20} className="text-gray-700" />
            <h3 className="text-lg font-semibold text-gray-900">Analytics Overview (Last 30 Days)</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Eye size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Page Views</p>
                  <p className="text-2xl font-bold text-gray-900">{analyticsData.pageViews.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users size={20} className="text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Unique Visitors</p>
                  <p className="text-2xl font-bold text-gray-900">{analyticsData.uniqueVisitors.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <MousePointer size={20} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Sessions</p>
                  <p className="text-2xl font-bold text-gray-900">{analyticsData.sessions.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <TrendingUp size={20} className="text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Bounce Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{analyticsData.bounceRate.toFixed(1)}%</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-cyan-100 rounded-lg">
                  <Activity size={20} className="text-cyan-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Avg. Duration</p>
                  <p className="text-2xl font-bold text-gray-900">{formatDuration(analyticsData.avgSessionDuration)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Top Pages</h4>
              <div className="space-y-3">
                {analyticsData.topPages?.map((page, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium text-gray-500 w-6">{index + 1}</span>
                      <span className="text-sm text-gray-900">{page.page}</span>
                    </div>
                    <span className="text-sm font-semibold text-blue-600">{page.views.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Traffic Sources</h4>
              <div className="space-y-3">
                {analyticsData.trafficSources?.map((source, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-900">{source.source}</span>
                    <span className="text-sm font-semibold text-green-600">{source.visits.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Pages</h3>
          <p className="text-3xl font-bold text-gray-900">{pages.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Published</h3>
          <p className="text-3xl font-bold text-green-600">
            {pages.filter(p => p.status === 'published').length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Draft</h3>
          <p className="text-3xl font-bold text-yellow-600">
            {pages.filter(p => p.status === 'draft').length}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Website Pages</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Page</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">Loading...</td>
                </tr>
              ) : pages.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">No pages found</td>
                </tr>
              ) : (
                pages.map((page) => (
                  <tr key={page.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{page.title}</div>
                        <div className="text-sm text-gray-500">/{page.slug}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        page.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {page.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{page.page_views || 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(page.updated_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {websiteConnection.isConnected && (
                        <button
                          onClick={() => window.open(`${websiteConnection.url}/${page.slug}`, '_blank')}
                          className="text-gray-600 hover:text-gray-900 mr-3"
                        >
                          <Eye size={16} />
                        </button>
                      )}
                      <button className="text-blue-600 hover:text-blue-900 mr-3"><Edit size={16} /></button>
                      <button
                        onClick={() => handleDeletePage(page.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showConnectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <Globe size={24} className="text-blue-600" />
                <h3 className="text-xl font-bold text-gray-900">Connect Your Website</h3>
              </div>
              <p className="text-sm text-gray-600">
                Enter your website details to track analytics and traffic
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website Name *
                </label>
                <input
                  type="text"
                  value={connectionForm.websiteName}
                  onChange={(e) => setConnectionForm({...connectionForm, websiteName: e.target.value})}
                  placeholder="My Business Website"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website URL *
                </label>
                <input
                  type="url"
                  value={connectionForm.websiteUrl}
                  onChange={(e) => setConnectionForm({...connectionForm, websiteUrl: e.target.value})}
                  placeholder="https://yourwebsite.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Analytics Platform
                </label>
                <select
                  value={connectionForm.platform}
                  onChange={(e) => setConnectionForm({...connectionForm, platform: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="google_analytics">Google Analytics</option>
                  <option value="plausible">Plausible</option>
                  <option value="matomo">Matomo</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Site ID / Property ID
                </label>
                <input
                  type="text"
                  value={connectionForm.siteId}
                  onChange={(e) => setConnectionForm({...connectionForm, siteId: e.target.value})}
                  placeholder="UA-XXXXXXXXX-X or G-XXXXXXXXXX"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Key (Optional)
                </label>
                <input
                  type="password"
                  value={connectionForm.apiKey}
                  onChange={(e) => setConnectionForm({...connectionForm, apiKey: e.target.value})}
                  placeholder="Enter your analytics API key"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-gray-700">
                  <p className="font-medium text-gray-900 mb-1">Sample Data</p>
                  <p>We'll generate sample analytics data for demonstration. Connect your real analytics API for live data.</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => {
                  setShowConnectModal(false);
                  setConnectionForm({
                    websiteUrl: '',
                    websiteName: '',
                    platform: 'google_analytics',
                    apiKey: '',
                    siteId: ''
                  });
                }}
                className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConnectWebsite}
                disabled={!connectionForm.websiteUrl.trim() || !connectionForm.websiteName.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Connect
              </button>
            </div>
          </div>
        </div>
      )}

      {showNewPageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full my-8">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <Plus size={24} className="text-green-600" />
                <h3 className="text-xl font-bold text-gray-900">Create New Page</h3>
              </div>
              <p className="text-sm text-gray-600">
                Add a new page to your website
              </p>
            </div>

            <form onSubmit={handleCreatePage} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Page Title *
                </label>
                <input
                  type="text"
                  value={newPage.title}
                  onChange={(e) => setNewPage({ ...newPage, title: e.target.value })}
                  placeholder="About Us"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL Slug *
                </label>
                <div className="flex items-center">
                  <span className="text-gray-500 text-sm mr-2">/</span>
                  <input
                    type="text"
                    value={newPage.slug}
                    onChange={(e) => setNewPage({ ...newPage, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    placeholder="about-us"
                    required
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Page Content
                </label>
                <textarea
                  value={newPage.content}
                  onChange={(e) => setNewPage({ ...newPage, content: e.target.value })}
                  placeholder="Enter your page content here..."
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    value={newPage.meta_title}
                    onChange={(e) => setNewPage({ ...newPage, meta_title: e.target.value })}
                    placeholder="SEO title"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={newPage.status}
                    onChange={(e) => setNewPage({ ...newPage, status: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Description
                </label>
                <textarea
                  value={newPage.meta_description}
                  onChange={(e) => setNewPage({ ...newPage, meta_description: e.target.value })}
                  placeholder="SEO description"
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </form>

            <div className="p-6 bg-gray-50 border-t border-gray-200 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowNewPageModal(false);
                  setNewPage({
                    title: '',
                    slug: '',
                    content: '',
                    meta_title: '',
                    meta_description: '',
                    status: 'draft'
                  });
                }}
                className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePage}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Create Page
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
