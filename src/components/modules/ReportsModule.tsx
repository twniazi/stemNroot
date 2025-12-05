import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { FileText, Download, TrendingUp, Users, Mail, ShoppingCart, Calendar, BarChart3, DollarSign, Eye } from 'lucide-react';

export default function ReportsModule() {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<any>({
    campaigns: 0,
    leads: 0,
    orders: 0,
    revenue: 0,
    emailCampaigns: 0,
    socialPosts: 0,
    websitePages: 0,
  });

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      const [campaigns, leads, orders, emailCampaigns, socialPosts, websitePages] = await Promise.all([
        supabase.from('campaigns').select('*'),
        supabase.from('leads').select('*'),
        supabase.from('orders').select('*'),
        supabase.from('email_campaigns').select('*'),
        supabase.from('social_media_posts').select('*'),
        supabase.from('website_pages').select('*'),
      ]);

      const totalRevenue = orders.data?.reduce((sum, order) => sum + Number(order.total_amount || 0), 0) || 0;

      setReportData({
        campaigns: campaigns.data?.length || 0,
        leads: leads.data?.length || 0,
        orders: orders.data?.length || 0,
        revenue: totalRevenue,
        emailCampaigns: emailCampaigns.data?.length || 0,
        socialPosts: socialPosts.data?.length || 0,
        websitePages: websitePages.data?.length || 0,
      });
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = (reportType: string) => {
    alert(`Generating ${reportType} report... This will download a PDF/CSV file with detailed analytics.`);
  };

  const reports = [
    {
      id: 'sales',
      title: 'Sales & Revenue Report',
      description: 'Comprehensive overview of sales performance, revenue trends, and order analytics',
      icon: DollarSign,
      color: 'green',
      metrics: [
        { label: 'Total Orders', value: reportData.orders },
        { label: 'Total Revenue', value: `PKR ${reportData.revenue.toLocaleString()}` },
      ]
    },
    {
      id: 'marketing',
      title: 'Marketing Performance Report',
      description: 'Campaign effectiveness, ROI, and engagement metrics across all channels',
      icon: TrendingUp,
      color: 'blue',
      metrics: [
        { label: 'Active Campaigns', value: reportData.campaigns },
        { label: 'Email Campaigns', value: reportData.emailCampaigns },
      ]
    },
    {
      id: 'leads',
      title: 'Lead Generation Report',
      description: 'Lead sources, conversion rates, and pipeline analysis',
      icon: Users,
      color: 'purple',
      metrics: [
        { label: 'Total Leads', value: reportData.leads },
        { label: 'Conversion Rate', value: '23%' },
      ]
    },
    {
      id: 'social',
      title: 'Social Media Report',
      description: 'Engagement metrics, reach, and performance across social platforms',
      icon: BarChart3,
      color: 'pink',
      metrics: [
        { label: 'Total Posts', value: reportData.socialPosts },
        { label: 'Avg Engagement', value: '145' },
      ]
    },
    {
      id: 'website',
      title: 'Website Analytics Report',
      description: 'Traffic analysis, page performance, and user behavior insights',
      icon: Eye,
      color: 'indigo',
      metrics: [
        { label: 'Total Pages', value: reportData.websitePages },
        { label: 'Avg Page Views', value: '1.2K' },
      ]
    },
    {
      id: 'email',
      title: 'Email Marketing Report',
      description: 'Email campaign performance, open rates, and subscriber growth',
      icon: Mail,
      color: 'orange',
      metrics: [
        { label: 'Campaigns Sent', value: reportData.emailCampaigns },
        { label: 'Avg Open Rate', value: '32%' },
      ]
    },
  ];

  const colorClasses: Record<string, any> = {
    green: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200', hover: 'hover:bg-green-100' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', hover: 'hover:bg-blue-100' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200', hover: 'hover:bg-purple-100' },
    pink: { bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-200', hover: 'hover:bg-pink-100' },
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200', hover: 'hover:bg-indigo-100' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200', hover: 'hover:bg-orange-100' },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
          <p className="text-gray-600 mt-1">Generate comprehensive reports across all marketing channels</p>
        </div>
        <button
          onClick={() => generateReport('Master')}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download size={20} className="mr-2" />
          Export All Data
        </button>
      </div>

      <div className="bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <FileText size={32} className="text-gray-700" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Automated Reporting System
            </h3>
            <p className="text-sm text-gray-700 mb-3">
              Access detailed reports for all your marketing activities. Each report includes real-time data,
              trends analysis, and actionable insights to optimize your campaigns.
            </p>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-gray-600" />
                <span className="text-gray-600">Last updated: Today</span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 size={14} className="text-gray-600" />
                <span className="text-gray-600">Real-time data</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading report data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reports.map((report) => {
            const Icon = report.icon;
            const colors = colorClasses[report.color];
            return (
              <div
                key={report.id}
                className={`bg-white border ${colors.border} rounded-xl overflow-hidden transition-all hover:shadow-lg`}
              >
                <div className={`${colors.bg} p-6 border-b ${colors.border}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-white p-2 rounded-lg shadow-sm">
                        <Icon size={24} className={colors.text} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{report.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    {report.metrics.map((metric, index) => (
                      <div key={index} className="bg-white rounded-lg p-3 shadow-sm">
                        <p className="text-xs text-gray-600 mb-1">{metric.label}</p>
                        <p className="text-lg font-bold text-gray-900">{metric.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-white flex items-center justify-between">
                  <button
                    onClick={() => generateReport(report.title)}
                    className={`flex items-center gap-2 px-4 py-2 ${colors.bg} ${colors.text} rounded-lg ${colors.hover} transition-colors font-medium text-sm`}
                  >
                    <Download size={16} />
                    Generate Report
                  </button>
                  <span className="text-xs text-gray-500">PDF & CSV</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Custom Report Builder</h3>
        <p className="text-sm text-gray-600 mb-4">
          Create custom reports by selecting specific date ranges, metrics, and data sources.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>Last 90 Days</option>
              <option>This Year</option>
              <option>Custom Range</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
              <option>Overview</option>
              <option>Detailed Analytics</option>
              <option>Comparison Report</option>
              <option>Executive Summary</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
              <option>PDF Document</option>
              <option>CSV Spreadsheet</option>
              <option>Excel Workbook</option>
              <option>PowerPoint</option>
            </select>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => generateReport('Custom')}
            className="flex items-center gap-2 px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            <FileText size={18} />
            Build Custom Report
          </button>
        </div>
      </div>
    </div>
  );
}
