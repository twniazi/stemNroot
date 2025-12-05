import { ExternalLink } from 'lucide-react';

export default function SEOModule() {
  const keywords = [
    { keyword: 'organic mangoes pakistan', rank: 3, volume: 1200, difficulty: 45 },
    { keyword: 'fresh farm vegetables', rank: 5, volume: 890, difficulty: 38 },
    { keyword: 'stem n root farm', rank: 1, volume: 450, difficulty: 25 },
    { keyword: 'sustainable farming', rank: 8, volume: 2100, difficulty: 62 }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">SEO Management</h2>
        <p className="text-gray-600 mt-1">Track keywords and optimize search rankings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Tracked Keywords', value: keywords.length, color: 'blue' },
          { label: 'Avg Rank', value: '4.3', color: 'green' },
          { label: 'Top 10 Keywords', value: '12', color: 'purple' },
          { label: 'Backlinks', value: '245', color: 'orange' }
        ].map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-600 mb-2">{stat.label}</h3>
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Keyword Rankings</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Keyword</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Search Volume</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Difficulty</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {keywords.map((kw, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-4 text-sm font-medium text-gray-900">{kw.keyword}</td>
                  <td className="px-4 py-4 text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      kw.rank <= 3 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      #{kw.rank}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900">{kw.volume.toLocaleString()}/mo</td>
                  <td className="px-4 py-4 text-sm text-gray-900">{kw.difficulty}/100</td>
                  <td className="px-4 py-4 text-sm">
                    <button className="text-blue-600 hover:text-blue-900"><ExternalLink size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
