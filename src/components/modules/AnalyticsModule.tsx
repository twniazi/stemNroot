import { BarChart3, TrendingUp, Users, Globe } from 'lucide-react';

export default function AnalyticsModule() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
        <p className="text-gray-600 mt-1">Website traffic and user behavior analytics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Page Views', value: '45.2K', icon: Globe, trend: '+12%' },
          { label: 'Unique Visitors', value: '12.8K', icon: Users, trend: '+8%' },
          { label: 'Bounce Rate', value: '42%', icon: TrendingUp, trend: '-3%' },
          { label: 'Avg Session', value: '3m 24s', icon: BarChart3, trend: '+15%' }
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">{stat.label}</h3>
                <Icon size={20} className="text-green-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-green-600 mt-2">{stat.trend}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Traffic Sources</h3>
          <div className="space-y-3">
            {[
              { source: 'Organic Search', value: '45%', color: 'green' },
              { source: 'Direct', value: '25%', color: 'blue' },
              { source: 'Social Media', value: '20%', color: 'purple' },
              { source: 'Referral', value: '10%', color: 'orange' }
            ].map((item, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{item.source}</span>
                  <span className="font-semibold">{item.value}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className={`bg-${item.color}-500 h-2 rounded-full`} style={{ width: item.value }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Pages</h3>
          <div className="space-y-3">
            {[
              { page: '/products/mangoes', views: 8945, percent: 18.5 },
              { page: '/about', views: 6234, percent: 12.9 },
              { page: '/blog/organic-farming', views: 4567, percent: 9.4 },
              { page: '/contact', views: 3892, percent: 8.1 }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{item.page}</p>
                  <p className="text-xs text-gray-500">{item.views.toLocaleString()} views</p>
                </div>
                <span className="text-sm font-semibold text-gray-900">{item.percent}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
