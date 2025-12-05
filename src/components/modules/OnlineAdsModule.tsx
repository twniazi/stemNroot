import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Image, Video, Type, LayoutGrid as Layout, Target, Users, TrendingUp, DollarSign, Eye, MousePointer, Zap, Copy, CreditCard as Edit, Trash2, Play, Pause, BarChart2, Layers, CheckCircle, AlertCircle, RefreshCw, Download, Filter, FileText } from 'lucide-react';
import NewAdModal from '../modals/NewAdModal';

interface AdCreative {
  id: string;
  name: string;
  type: 'image' | 'video' | 'carousel' | 'text';
  platform: string;
  format: string;
  headline: string;
  description: string;
  cta_text: string;
  image_url?: string;
  video_url?: string;
  status: 'draft' | 'active' | 'paused' | 'archived';
  created_at: string;
}

interface AdPerformance {
  ad_id: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  ctr: number;
  cpc: number;
  cpa: number;
}

interface Audience {
  id: string;
  name: string;
  size: number;
  demographics: any;
  interests: string[];
  locations: string[];
}

export default function OnlineAdsModule() {
  const [ads, setAds] = useState<AdCreative[]>([]);
  const [audiences, setAudiences] = useState<Audience[]>([]);
  const [performance, setPerformance] = useState<Record<string, AdPerformance>>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ads' | 'audiences' | 'abtest'>('ads');
  const [showNewAdModal, setShowNewAdModal] = useState(false);
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: adsData } = await supabase
        .from('ad_creatives')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      const { data: performanceData } = await supabase
        .from('ad_performance')
        .select('*');

      if (adsData && adsData.length > 0) {
        setAds(adsData);
      } else {
        const mockAds: AdCreative[] = [
        {
          id: '1',
          name: 'Summer Sale Banner',
          type: 'image',
          platform: 'Facebook',
          format: '1200x628',
          headline: 'Summer Sale - 50% Off',
          description: 'Get incredible deals on all products this summer',
          cta_text: 'Shop Now',
          image_url: 'https://images.pexels.com/photos/1292241/pexels-photo-1292241.jpeg?auto=compress&cs=tinysrgb&w=800',
          status: 'active',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Product Demo Video',
          type: 'video',
          platform: 'YouTube',
          format: '1920x1080',
          headline: 'See Our Product in Action',
          description: 'Watch how easy it is to use our amazing product',
          cta_text: 'Learn More',
          video_url: 'https://example.com/video.mp4',
          status: 'active',
          created_at: new Date().toISOString()
        },
        {
          id: '3',
          name: 'Carousel Ad - Products',
          type: 'carousel',
          platform: 'Instagram',
          format: '1080x1080',
          headline: 'Discover Our Collection',
          description: 'Swipe to see all our amazing products',
          cta_text: 'View Collection',
          status: 'draft',
          created_at: new Date().toISOString()
        }
      ];

        setAds(mockAds);
      }

      const mockPerformance: Record<string, AdPerformance> = {};

      if (performanceData && performanceData.length > 0) {
        performanceData.forEach((perf: any) => {
          if (!mockPerformance[perf.ad_id]) {
            mockPerformance[perf.ad_id] = {
              ad_id: perf.ad_id,
              impressions: 0,
              clicks: 0,
              conversions: 0,
              spend: 0,
              ctr: 0,
              cpc: 0,
              cpa: 0
            };
          }
          mockPerformance[perf.ad_id].impressions += perf.impressions || 0;
          mockPerformance[perf.ad_id].clicks += perf.clicks || 0;
          mockPerformance[perf.ad_id].conversions += perf.conversions || 0;
          mockPerformance[perf.ad_id].spend += Number(perf.spend) || 0;
        });

        Object.keys(mockPerformance).forEach(id => {
          const p = mockPerformance[id];
          p.ctr = p.impressions > 0 ? (p.clicks / p.impressions) * 100 : 0;
          p.cpc = p.clicks > 0 ? p.spend / p.clicks : 0;
          p.cpa = p.conversions > 0 ? p.spend / p.conversions : 0;
        });
      } else {
        mockPerformance['1'] = {
          ad_id: '1',
          impressions: 125000,
          clicks: 3750,
          conversions: 225,
          spend: 5000,
          ctr: 3.0,
          cpc: 1.33,
          cpa: 22.22
        };
        mockPerformance['2'] = {
          ad_id: '2',
          impressions: 85000,
          clicks: 2550,
          conversions: 178,
          spend: 3800,
          ctr: 3.0,
          cpc: 1.49,
          cpa: 21.35
        };
      }

      const mockAudiences: Audience[] = [
        {
          id: '1',
          name: 'Young Professionals',
          size: 2500000,
          demographics: { age: '25-34', gender: 'all' },
          interests: ['Technology', 'Business', 'Career Development'],
          locations: ['Pakistan', 'India', 'UAE']
        },
        {
          id: '2',
          name: 'Parents & Families',
          size: 1800000,
          demographics: { age: '30-45', gender: 'all' },
          interests: ['Family', 'Education', 'Parenting'],
          locations: ['Pakistan', 'United States']
        },
        {
          id: '3',
          name: 'Tech Enthusiasts',
          size: 950000,
          demographics: { age: '18-35', gender: 'all' },
          interests: ['Technology', 'Gaming', 'Innovation'],
          locations: ['Worldwide']
        }
      ];

      setPerformance(mockPerformance);
      setAudiences(mockAudiences);
    } catch (error) {
      console.error('Error fetching ads data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return Image;
      case 'video': return Video;
      case 'carousel': return Layers;
      case 'text': return Type;
      default: return Layout;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'image': return 'bg-blue-100 text-blue-800';
      case 'video': return 'bg-purple-100 text-purple-800';
      case 'carousel': return 'bg-pink-100 text-pink-800';
      case 'text': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlatformColor = (platform: string) => {
    const colors: Record<string, string> = {
      'Facebook': 'bg-blue-100 text-blue-800',
      'Instagram': 'bg-pink-100 text-pink-800',
      'Google Ads': 'bg-red-100 text-red-800',
      'YouTube': 'bg-red-100 text-red-800',
      'LinkedIn': 'bg-cyan-100 text-cyan-800',
      'Twitter': 'bg-sky-100 text-sky-800',
      'TikTok': 'bg-purple-100 text-purple-800'
    };
    return colors[platform] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'archived': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDeleteAd = async (id: string) => {
    if (!confirm('Are you sure you want to delete this ad?')) return;

    try {
      const { error } = await supabase
        .from('ad_creatives')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error('Error deleting ad:', error);
      alert('Failed to delete ad');
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';

    try {
      const { error } = await supabase
        .from('ad_creatives')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error('Error updating ad status:', error);
      alert('Failed to update ad status');
    }
  };

  const handleDuplicateAd = async (ad: AdCreative) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const newAd = {
        user_id: user.id,
        name: `${ad.name} (Copy)`,
        type: ad.type,
        platform: ad.platform,
        format: ad.format,
        headline: ad.headline,
        description: ad.description,
        cta_text: ad.cta_text,
        image_url: ad.image_url,
        video_url: ad.video_url,
        status: 'draft'
      };

      const { error } = await supabase
        .from('ad_creatives')
        .insert([newAd]);

      if (error) throw error;
      fetchData();
      alert('Ad duplicated successfully!');
    } catch (error) {
      console.error('Error duplicating ad:', error);
      alert('Failed to duplicate ad');
    }
  };

  const filteredAds = ads.filter(ad => {
    const platformMatch = filterPlatform === 'all' || ad.platform === filterPlatform;
    const statusMatch = filterStatus === 'all' || ad.status === filterStatus;
    return platformMatch && statusMatch;
  });

  const platforms = [...new Set(ads.map(ad => ad.platform))];

  const totalImpressions = Object.values(performance).reduce((sum, p) => sum + p.impressions, 0);
  const totalClicks = Object.values(performance).reduce((sum, p) => sum + p.clicks, 0);
  const totalConversions = Object.values(performance).reduce((sum, p) => sum + p.conversions, 0);
  const totalSpend = Object.values(performance).reduce((sum, p) => sum + p.spend, 0);
  const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const avgCPC = totalClicks > 0 ? totalSpend / totalClicks : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Online Ads</h2>
          <p className="text-gray-600 mt-1">Create and manage ad creatives across all platforms</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchData}
            className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={20} className="mr-2" />
            Refresh
          </button>
          <button
            onClick={() => setShowNewAdModal(true)}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus size={20} className="mr-2" />
            Create Ad
          </button>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Impressions</h3>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Eye size={20} className="text-purple-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{(totalImpressions / 1000).toFixed(1)}K</p>
          <p className="text-sm text-gray-500 mt-1">Across all ads</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Clicks</h3>
            <div className="p-2 bg-blue-100 rounded-lg">
              <MousePointer size={20} className="text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalClicks.toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-1">CTR: {avgCTR.toFixed(2)}%</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Conversions</h3>
            <div className="p-2 bg-green-100 rounded-lg">
              <Target size={20} className="text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalConversions}</p>
          <p className="text-sm text-gray-500 mt-1">From all creatives</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Spend</h3>
            <div className="p-2 bg-orange-100 rounded-lg">
              <DollarSign size={20} className="text-orange-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">PKR {totalSpend.toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-1">CPC: PKR {avgCPC.toFixed(2)}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('ads')}
              className={`px-6 py-4 text-sm font-medium border-b-2 ${
                activeTab === 'ads'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Layout size={18} />
                Ad Creatives ({ads.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('audiences')}
              className={`px-6 py-4 text-sm font-medium border-b-2 ${
                activeTab === 'audiences'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Users size={18} />
                Audiences ({audiences.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('abtest')}
              className={`px-6 py-4 text-sm font-medium border-b-2 ${
                activeTab === 'abtest'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <BarChart2 size={18} />
                A/B Testing
              </div>
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'ads' && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter size={20} className="text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Filters:</span>
                </div>
                <select
                  value={filterPlatform}
                  onChange={(e) => setFilterPlatform(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">All Platforms</option>
                  {platforms.map(platform => (
                    <option key={platform} value={platform}>{platform}</option>
                  ))}
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
                <button className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm ml-auto">
                  <Download size={16} />
                  Export
                </button>
              </div>

              {/* Ad Creatives Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                  <div className="col-span-3 flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                  </div>
                ) : filteredAds.length === 0 ? (
                  <div className="col-span-3 text-center py-12">
                    <Layout size={48} className="mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500">No ads found</p>
                    <button
                      onClick={() => setShowNewAdModal(true)}
                      className="mt-4 text-green-600 hover:text-green-700 font-medium"
                    >
                      Create your first ad
                    </button>
                  </div>
                ) : (
                  filteredAds.map((ad) => {
                    const TypeIcon = getTypeIcon(ad.type);
                    const perf = performance[ad.id];

                    return (
                      <div key={ad.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                        {/* Ad Preview */}
                        <div className="relative h-48 bg-gray-100 flex items-center justify-center">
                          {ad.image_url ? (
                            <img src={ad.image_url} alt={ad.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="text-center p-6">
                              <TypeIcon size={48} className="mx-auto text-gray-400 mb-2" />
                              <p className="text-sm text-gray-500">{ad.type} ad</p>
                            </div>
                          )}
                          <div className="absolute top-2 right-2 flex gap-2">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(ad.type)}`}>
                              {ad.type}
                            </span>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ad.status)}`}>
                              {ad.status}
                            </span>
                          </div>
                        </div>

                        {/* Ad Details */}
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-gray-900 truncate">{ad.name}</h3>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPlatformColor(ad.platform)}`}>
                              {ad.platform}
                            </span>
                          </div>

                          <div className="space-y-2 mb-4">
                            <p className="text-sm font-medium text-gray-900">{ad.headline}</p>
                            <p className="text-xs text-gray-600 line-clamp-2">{ad.description}</p>
                            <div className="flex items-center gap-2">
                              <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">
                                CTA: {ad.cta_text}
                              </span>
                              <span className="text-xs text-gray-500">{ad.format}</span>
                            </div>
                          </div>

                          {/* Performance */}
                          {perf && (
                            <div className="pt-3 border-t border-gray-200">
                              <div className="grid grid-cols-3 gap-2 text-center">
                                <div>
                                  <p className="text-xs text-gray-600">Impressions</p>
                                  <p className="text-sm font-bold text-gray-900">{(perf.impressions / 1000).toFixed(1)}K</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-600">Clicks</p>
                                  <p className="text-sm font-bold text-gray-900">{perf.clicks}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-600">Conv.</p>
                                  <p className="text-sm font-bold text-gray-900">{perf.conversions}</p>
                                </div>
                              </div>
                              <div className="mt-2 text-xs text-gray-600 text-center">
                                CTR: {perf.ctr.toFixed(2)}% • CPC: PKR {perf.cpc.toFixed(2)}
                              </div>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="mt-4 flex items-center justify-between pt-3 border-t border-gray-200">
                            <div className="flex gap-2">
                              {ad.status === 'active' ? (
                                <button
                                  onClick={() => handleToggleStatus(ad.id, ad.status)}
                                  className="p-1 text-yellow-600 hover:text-yellow-900"
                                  title="Pause"
                                >
                                  <Pause size={16} />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleToggleStatus(ad.id, ad.status)}
                                  className="p-1 text-green-600 hover:text-green-900"
                                  title="Activate"
                                >
                                  <Play size={16} />
                                </button>
                              )}
                              <button
                                onClick={() => handleDuplicateAd(ad)}
                                className="p-1 text-blue-600 hover:text-blue-900"
                                title="Duplicate"
                              >
                                <Copy size={16} />
                              </button>
                              <button className="p-1 text-gray-600 hover:text-gray-900" title="Edit">
                                <Edit size={16} />
                              </button>
                            </div>
                            <button
                              onClick={() => handleDeleteAd(ad.id)}
                              className="p-1 text-red-600 hover:text-red-900"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {activeTab === 'audiences' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600">Manage your target audiences for ad campaigns</p>
                <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
                  <Plus size={16} className="mr-2" />
                  Create Audience
                </button>
              </div>

              <div className="space-y-4">
                {audiences.map(audience => (
                  <div key={audience.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{audience.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Estimated reach: <span className="font-medium text-gray-900">{(audience.size / 1000000).toFixed(1)}M people</span>
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-2 text-blue-600 hover:text-blue-900">
                          <Edit size={18} />
                        </button>
                        <button className="p-2 text-red-600 hover:text-red-900">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-2">Demographics</p>
                        <div className="flex flex-wrap gap-2">
                          <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                            Age: {audience.demographics.age}
                          </span>
                          <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                            {audience.demographics.gender}
                          </span>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-2">Interests</p>
                        <div className="flex flex-wrap gap-2">
                          {audience.interests.map((interest, i) => (
                            <span key={i} className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded">
                              {interest}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-2">Locations</p>
                        <div className="flex flex-wrap gap-2">
                          {audience.locations.map((location, i) => (
                            <span key={i} className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded">
                              {location}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'abtest' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600">Test different ad variations to optimize performance</p>
                <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
                  <Plus size={16} className="mr-2" />
                  New A/B Test
                </button>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-8 text-center">
                <BarChart2 size={48} className="mx-auto text-blue-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">A/B Testing</h3>
                <p className="text-gray-600 mb-4">
                  Create A/B tests to compare different ad creatives and find what works best
                </p>
                <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Start Your First A/B Test
                </button>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-4">A/B Testing Best Practices</h4>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Test one variable at a time</p>
                      <p className="text-sm text-gray-600">Change only one element between versions to identify what drives results</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Run tests for sufficient duration</p>
                      <p className="text-sm text-gray-600">Allow at least 7 days to gather meaningful data</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Use similar audience sizes</p>
                      <p className="text-sm text-gray-600">Ensure both variants reach comparable audience segments</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      <NewAdModal
        isOpen={showNewAdModal}
        onClose={() => setShowNewAdModal(false)}
        onSuccess={fetchData}
      />
    </div>
  );
}
