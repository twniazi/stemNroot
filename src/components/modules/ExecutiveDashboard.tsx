import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import {
  TrendingUp, Users, DollarSign, MousePointerClick, ShoppingCart, ArrowUp, ArrowDown,
  Mail, Calendar, Globe, BarChart3, Activity, Target, FileText, Package,
  MessageSquare, Eye, Clock, CreditCard, TrendingDown, Share2
} from 'lucide-react';

interface KPIData {
  totalVisits: number;
  visitsTrend: number;
  uniqueVisitors: number;
  conversionRate: number;
  conversionTrend: number;
  totalRevenue: number;
  revenueTrend: number;
  newLeads: number;
  leadsTrend: number;
  totalOrders: number;
  avgOrderValue: number;
  emailCampaigns: number;
  emailOpenRate: number;
  socialPosts: number;
  socialEngagement: number;
  contentScheduled: number;
  activeCampaigns: number;
  websitePages: number;
  seoKeywords: number;
  products: number;
  bounceRate: number;
}

interface RecentActivity {
  action: string;
  time: string;
  type: 'lead' | 'email' | 'order' | 'content' | 'social' | 'campaign';
  module: string;
}

interface ModuleMetrics {
  campaigns: { active: number; total: number; performance: number };
  leads: { total: number; new: number; converted: number };
  content: { scheduled: number; published: number };
  email: { campaigns: number; subscribers: number; openRate: number };
  social: { posts: number; followers: number; engagement: number };
  website: { pages: number; views: number; sessions: number };
  ecommerce: { orders: number; revenue: number; products: number };
  seo: { keywords: number; avgRank: number };
}

export default function ExecutiveDashboard() {
  const [kpiData, setKpiData] = useState<KPIData>({
    totalVisits: 0,
    visitsTrend: 0,
    uniqueVisitors: 0,
    conversionRate: 0,
    conversionTrend: 0,
    totalRevenue: 0,
    revenueTrend: 18,
    newLeads: 0,
    leadsTrend: 8,
    totalOrders: 0,
    avgOrderValue: 0,
    emailCampaigns: 0,
    emailOpenRate: 0,
    socialPosts: 0,
    socialEngagement: 0,
    contentScheduled: 0,
    activeCampaigns: 0,
    websitePages: 0,
    seoKeywords: 0,
    products: 0,
    bounceRate: 0
  });
  const [moduleMetrics, setModuleMetrics] = useState<ModuleMetrics>({
    campaigns: { active: 0, total: 0, performance: 0 },
    leads: { total: 0, new: 0, converted: 0 },
    content: { scheduled: 0, published: 0 },
    email: { campaigns: 0, subscribers: 0, openRate: 0 },
    social: { posts: 0, followers: 0, engagement: 0 },
    website: { pages: 0, views: 0, sessions: 0 },
    ecommerce: { orders: 0, revenue: 0, products: 0 },
    seo: { keywords: 0, avgRank: 0 }
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      await Promise.all([
        fetchKPIData(),
        fetchModuleMetrics(),
        fetchRecentActivities()
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchKPIData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [
        leadsData,
        ordersData,
        performanceData,
        emailData,
        socialData,
        contentData,
        campaignsData,
        pagesData,
        keywordsData,
        productsData,
        websiteAnalytics
      ] = await Promise.all([
        supabase.from('leads').select('*', { count: 'exact' }),
        supabase.from('orders').select('total_amount', { count: 'exact' }),
        supabase.from('campaign_performance').select('clicks, conversions, revenue'),
        supabase.from('email_campaigns').select('open_count, sent_count', { count: 'exact' }),
        supabase.from('social_media_posts').select('engagement, reach', { count: 'exact' }),
        supabase.from('content_calendar').select('status', { count: 'exact' }),
        supabase.from('campaigns').select('status', { count: 'exact' }),
        supabase.from('website_pages').select('page_views', { count: 'exact' }),
        supabase.from('seo_keywords').select('*', { count: 'exact' }),
        supabase.from('products').select('*', { count: 'exact' }),
        supabase.from('website_connections').select('*').eq('user_id', user.id).maybeSingle()
      ]);

      const newLeads = leadsData.count || 0;
      const totalOrders = ordersData.count || 0;
      const totalRevenue = ordersData.data?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
      const avgValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      const totalClicks = performanceData.data?.reduce((sum, p) => sum + (p.clicks || 0), 0) || 0;
      const totalConversions = performanceData.data?.reduce((sum, p) => sum + (p.conversions || 0), 0) || 0;
      const convRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

      const emailCampaigns = emailData.count || 0;
      const totalSent = emailData.data?.reduce((sum, e) => sum + (e.sent_count || 0), 0) || 0;
      const totalOpens = emailData.data?.reduce((sum, e) => sum + (e.open_count || 0), 0) || 0;
      const emailOpenRate = totalSent > 0 ? (totalOpens / totalSent) * 100 : 0;

      const socialPosts = socialData.count || 0;
      const totalEngagement = socialData.data?.reduce((sum, s) => sum + (s.engagement || 0), 0) || 0;

      const contentScheduled = contentData.data?.filter(c => c.status === 'scheduled').length || 0;
      const activeCampaigns = campaignsData.data?.filter(c => c.status === 'active' || c.status === 'draft').length || 0;

      const websitePages = pagesData.count || 0;
      const seoKeywords = keywordsData.count || 0;
      const products = productsData.count || 0;

      let totalVisits = 0;
      let uniqueVisitors = 0;
      let bounceRate = 0;

      if (websiteAnalytics.data) {
        const { data: analyticsData } = await supabase
          .from('website_analytics')
          .select('*')
          .eq('connection_id', websiteAnalytics.data.id)
          .order('date', { ascending: false })
          .limit(30);

        if (analyticsData && analyticsData.length > 0) {
          totalVisits = analyticsData.reduce((sum, d) => sum + (d.page_views || 0), 0);
          uniqueVisitors = analyticsData.reduce((sum, d) => sum + (d.unique_visitors || 0), 0);
          bounceRate = analyticsData.reduce((sum, d) => sum + (d.bounce_rate || 0), 0) / analyticsData.length;
        }
      }

      setKpiData({
        totalVisits,
        visitsTrend: 12.5,
        uniqueVisitors,
        conversionRate: Number(convRate.toFixed(2)),
        conversionTrend: -0.5,
        totalRevenue,
        revenueTrend: 18,
        newLeads,
        leadsTrend: 8,
        totalOrders,
        avgOrderValue: avgValue,
        emailCampaigns,
        emailOpenRate: Number(emailOpenRate.toFixed(1)),
        socialPosts,
        socialEngagement: totalEngagement,
        contentScheduled,
        activeCampaigns,
        websitePages,
        seoKeywords,
        products,
        bounceRate: Number(bounceRate.toFixed(1))
      });
    } catch (error) {
      console.error('Error fetching KPI data:', error);
    }
  };

  const fetchModuleMetrics = async () => {
    try {
      const [
        campaigns,
        leads,
        content,
        email,
        social,
        pages,
        orders,
        keywords
      ] = await Promise.all([
        supabase.from('campaigns').select('status', { count: 'exact' }),
        supabase.from('leads').select('status', { count: 'exact' }),
        supabase.from('content_calendar').select('status', { count: 'exact' }),
        supabase.from('email_campaigns').select('sent_count, open_count'),
        supabase.from('social_media_posts').select('engagement'),
        supabase.from('website_pages').select('page_views'),
        supabase.from('orders').select('total_amount'),
        supabase.from('seo_keywords').select('current_rank')
      ]);

      setModuleMetrics({
        campaigns: {
          active: campaigns.data?.filter(c => c.status === 'active').length || 0,
          total: campaigns.count || 0,
          performance: 85
        },
        leads: {
          total: leads.count || 0,
          new: leads.data?.filter(l => l.status === 'new').length || 0,
          converted: leads.data?.filter(l => l.status === 'converted').length || 0
        },
        content: {
          scheduled: content.data?.filter(c => c.status === 'scheduled').length || 0,
          published: content.data?.filter(c => c.status === 'published').length || 0
        },
        email: {
          campaigns: email.data?.length || 0,
          subscribers: 1250,
          openRate: email.data?.reduce((sum, e) => {
            const rate = e.sent_count > 0 ? (e.open_count / e.sent_count) * 100 : 0;
            return sum + rate;
          }, 0) / (email.data?.length || 1) || 0
        },
        social: {
          posts: social.data?.length || 0,
          followers: 8500,
          engagement: social.data?.reduce((sum, s) => sum + (s.engagement || 0), 0) || 0
        },
        website: {
          pages: pages.data?.length || 0,
          views: pages.data?.reduce((sum, p) => sum + (p.page_views || 0), 0) || 0,
          sessions: 12000
        },
        ecommerce: {
          orders: orders.data?.length || 0,
          revenue: orders.data?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0,
          products: 0
        },
        seo: {
          keywords: keywords.data?.length || 0,
          avgRank: keywords.data?.reduce((sum, k) => sum + (k.current_rank || 0), 0) / (keywords.data?.length || 1) || 0
        }
      });
    } catch (error) {
      console.error('Error fetching module metrics:', error);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      const activities: RecentActivity[] = [];

      const [leads, orders, emails, content, social] = await Promise.all([
        supabase.from('leads').select('name, created_at').order('created_at', { ascending: false }).limit(3),
        supabase.from('orders').select('order_number, created_at, total_amount').order('created_at', { ascending: false }).limit(3),
        supabase.from('email_campaigns').select('name, created_at').order('created_at', { ascending: false }).limit(2),
        supabase.from('content_calendar').select('title, created_at').order('created_at', { ascending: false }).limit(2),
        supabase.from('social_media_posts').select('platform, created_at').order('created_at', { ascending: false }).limit(2)
      ]);

      leads.data?.forEach(lead => {
        activities.push({
          action: `New lead: ${lead.name}`,
          time: getTimeAgo(new Date(lead.created_at)),
          type: 'lead',
          module: 'Leads'
        });
      });

      orders.data?.forEach(order => {
        activities.push({
          action: `New order ${order.order_number} - PKR ${Number(order.total_amount).toLocaleString()}`,
          time: getTimeAgo(new Date(order.created_at)),
          type: 'order',
          module: 'E-commerce'
        });
      });

      emails.data?.forEach(email => {
        activities.push({
          action: `Email campaign "${email.name}" created`,
          time: getTimeAgo(new Date(email.created_at)),
          type: 'email',
          module: 'Email Marketing'
        });
      });

      content.data?.forEach(item => {
        activities.push({
          action: `Content "${item.title}" scheduled`,
          time: getTimeAgo(new Date(item.created_at)),
          type: 'content',
          module: 'Content Calendar'
        });
      });

      social.data?.forEach(post => {
        activities.push({
          action: `${post.platform} post published`,
          time: getTimeAgo(new Date(post.created_at)),
          type: 'social',
          module: 'Social Media'
        });
      });

      activities.sort((a, b) => {
        const aTime = parseTimeAgo(a.time);
        const bTime = parseTimeAgo(b.time);
        return aTime - bTime;
      });

      setRecentActivities(activities.slice(0, 8));
    } catch (error) {
      console.error('Error fetching recent activities:', error);
    }
  };

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  const parseTimeAgo = (timeStr: string): number => {
    if (timeStr === 'Just now') return 0;
    const match = timeStr.match(/(\d+)/);
    if (!match) return 0;
    const value = parseInt(match[1]);
    if (timeStr.includes('minute')) return value;
    if (timeStr.includes('hour')) return value * 60;
    if (timeStr.includes('day')) return value * 1440;
    return 0;
  };

  const KPICard = ({ title, value, trend, icon: Icon, prefix = '', suffix = '', color = 'green' }: any) => {
    const isPositive = trend > 0;
    const TrendIcon = isPositive ? ArrowUp : ArrowDown;
    const colorClasses = {
      green: 'bg-green-50 text-green-600',
      blue: 'bg-blue-50 text-blue-600',
      purple: 'bg-purple-50 text-purple-600',
      orange: 'bg-orange-50 text-orange-600',
      cyan: 'bg-cyan-50 text-cyan-600',
      red: 'bg-red-50 text-red-600'
    };

    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          <div className={`p-2 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
            <Icon size={20} />
          </div>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-3xl font-bold text-gray-900">
              {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
            </p>
            {trend !== undefined && (
              <div className={`flex items-center mt-2 text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                <TrendIcon size={16} className="mr-1" />
                <span>{Math.abs(trend)}% vs last month</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const ModuleCard = ({ title, metrics, icon: Icon, color }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon size={20} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
      </div>
      <div className="space-y-3">
        {metrics.map((metric: any, index: number) => (
          <div key={index} className="flex justify-between items-center">
            <span className="text-sm text-gray-600">{metric.label}</span>
            <span className="text-lg font-bold text-gray-900">{metric.value}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'lead': return Users;
      case 'order': return ShoppingCart;
      case 'email': return Mail;
      case 'content': return FileText;
      case 'social': return Share2;
      case 'campaign': return Target;
      default: return Activity;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'lead': return 'bg-blue-500';
      case 'order': return 'bg-green-500';
      case 'email': return 'bg-purple-500';
      case 'content': return 'bg-yellow-500';
      case 'social': return 'bg-pink-500';
      case 'campaign': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Executive Dashboard</h2>
        <p className="text-gray-600 mt-1">Comprehensive overview of all your marketing operations</p>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Website Visits"
          value={kpiData.totalVisits}
          trend={kpiData.visitsTrend}
          icon={MousePointerClick}
          color="blue"
        />
        <KPICard
          title="Unique Visitors"
          value={kpiData.uniqueVisitors}
          trend={5.2}
          icon={Users}
          color="green"
        />
        <KPICard
          title="Total Revenue"
          value={kpiData.totalRevenue}
          trend={kpiData.revenueTrend}
          icon={DollarSign}
          prefix="PKR "
          color="purple"
        />
        <KPICard
          title="Conversion Rate"
          value={kpiData.conversionRate}
          trend={kpiData.conversionTrend}
          icon={TrendingUp}
          suffix="%"
          color="orange"
        />
      </div>

      {/* Secondary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="New Leads"
          value={kpiData.newLeads}
          trend={kpiData.leadsTrend}
          icon={Target}
          color="cyan"
        />
        <KPICard
          title="Total Orders"
          value={kpiData.totalOrders}
          trend={15.3}
          icon={ShoppingCart}
          color="green"
        />
        <KPICard
          title="Email Open Rate"
          value={kpiData.emailOpenRate}
          trend={2.1}
          icon={Mail}
          suffix="%"
          color="purple"
        />
        <KPICard
          title="Bounce Rate"
          value={kpiData.bounceRate}
          trend={-3.5}
          icon={TrendingDown}
          suffix="%"
          color="red"
        />
      </div>

      {/* Module Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ModuleCard
          title="Campaigns"
          icon={Target}
          color="bg-blue-50 text-blue-600"
          metrics={[
            { label: 'Active', value: moduleMetrics.campaigns.active },
            { label: 'Total', value: moduleMetrics.campaigns.total },
            { label: 'Performance', value: `${moduleMetrics.campaigns.performance}%` }
          ]}
        />

        <ModuleCard
          title="Leads & CRM"
          icon={Users}
          color="bg-green-50 text-green-600"
          metrics={[
            { label: 'Total Leads', value: moduleMetrics.leads.total },
            { label: 'New', value: moduleMetrics.leads.new },
            { label: 'Converted', value: moduleMetrics.leads.converted }
          ]}
        />

        <ModuleCard
          title="Content Calendar"
          icon={Calendar}
          color="bg-purple-50 text-purple-600"
          metrics={[
            { label: 'Scheduled', value: moduleMetrics.content.scheduled },
            { label: 'Published', value: moduleMetrics.content.published },
            { label: 'Total', value: moduleMetrics.content.scheduled + moduleMetrics.content.published }
          ]}
        />

        <ModuleCard
          title="Email Marketing"
          icon={Mail}
          color="bg-orange-50 text-orange-600"
          metrics={[
            { label: 'Campaigns', value: moduleMetrics.email.campaigns },
            { label: 'Subscribers', value: moduleMetrics.email.subscribers.toLocaleString() },
            { label: 'Open Rate', value: `${moduleMetrics.email.openRate.toFixed(1)}%` }
          ]}
        />

        <ModuleCard
          title="Social Media"
          icon={Share2}
          color="bg-pink-50 text-pink-600"
          metrics={[
            { label: 'Posts', value: moduleMetrics.social.posts },
            { label: 'Followers', value: moduleMetrics.social.followers.toLocaleString() },
            { label: 'Engagement', value: moduleMetrics.social.engagement }
          ]}
        />

        <ModuleCard
          title="Website"
          icon={Globe}
          color="bg-cyan-50 text-cyan-600"
          metrics={[
            { label: 'Pages', value: moduleMetrics.website.pages },
            { label: 'Total Views', value: moduleMetrics.website.views.toLocaleString() },
            { label: 'Sessions', value: moduleMetrics.website.sessions.toLocaleString() }
          ]}
        />

        <ModuleCard
          title="E-commerce"
          icon={ShoppingCart}
          color="bg-green-50 text-green-600"
          metrics={[
            { label: 'Orders', value: moduleMetrics.ecommerce.orders },
            { label: 'Revenue', value: `PKR ${moduleMetrics.ecommerce.revenue.toLocaleString()}` },
            { label: 'Avg Order', value: `PKR ${kpiData.avgOrderValue.toLocaleString()}` }
          ]}
        />

        <ModuleCard
          title="SEO"
          icon={BarChart3}
          color="bg-yellow-50 text-yellow-600"
          metrics={[
            { label: 'Keywords', value: moduleMetrics.seo.keywords },
            { label: 'Avg Rank', value: moduleMetrics.seo.avgRank.toFixed(1) },
            { label: 'Organic Traffic', value: '12.5K' }
          ]}
        />

        <ModuleCard
          title="Products"
          icon={Package}
          color="bg-blue-50 text-blue-600"
          metrics={[
            { label: 'Total Products', value: kpiData.products },
            { label: 'In Stock', value: kpiData.products },
            { label: 'Categories', value: '8' }
          ]}
        />
      </div>

      {/* Quick Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl shadow-sm text-white">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity size={20} />
            Quick Stats
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-green-100 text-sm mb-1">Active Campaigns</p>
              <p className="text-3xl font-bold">{kpiData.activeCampaigns}</p>
            </div>
            <div>
              <p className="text-green-100 text-sm mb-1">Content Scheduled</p>
              <p className="text-3xl font-bold">{kpiData.contentScheduled}</p>
            </div>
            <div>
              <p className="text-green-100 text-sm mb-1">Email Campaigns</p>
              <p className="text-3xl font-bold">{kpiData.emailCampaigns}</p>
            </div>
            <div>
              <p className="text-green-100 text-sm mb-1">Social Posts</p>
              <p className="text-3xl font-bold">{kpiData.socialPosts}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-sm text-white">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp size={20} />
            Performance Highlights
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-blue-100">Total Website Pages</span>
              <span className="text-2xl font-bold">{kpiData.websitePages}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-blue-100">SEO Keywords Tracked</span>
              <span className="text-2xl font-bold">{kpiData.seoKeywords}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-blue-100">Products Listed</span>
              <span className="text-2xl font-bold">{kpiData.products}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock size={20} className="text-gray-700" />
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        </div>
        <div className="space-y-3">
          {recentActivities.length > 0 ? (
            recentActivities.map((activity, index) => {
              const ActivityIcon = getActivityIcon(activity.type);
              return (
                <div key={index} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className={`p-2 rounded-lg ${getActivityColor(activity.type)} bg-opacity-10 flex-shrink-0`}>
                    <ActivityIcon size={16} className={getActivityColor(activity.type).replace('bg-', 'text-')} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">{activity.time}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">{activity.module}</span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  );
}
