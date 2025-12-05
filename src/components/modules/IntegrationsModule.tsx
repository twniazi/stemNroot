import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
  Check, X, Settings, RefreshCw, ExternalLink, AlertCircle,
  Mail, ShoppingCart, Calendar, Users, FileText, DollarSign,
  MessageSquare, Share2, BarChart, Database, Zap, Globe
} from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: any;
  color: string;
  isConnected: boolean;
  apiKey?: string;
  lastSync?: string;
}

export default function IntegrationsModule() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState('');

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      const { data, error } = await supabase
        .from('integrations')
        .select('*');

      if (error) throw error;

      const integrationsMap = new Map(data?.map(i => [i.service, i]) || []);

      const allIntegrations: Integration[] = [
        {
          id: 'mailchimp',
          name: 'Mailchimp',
          category: 'Email Marketing',
          description: 'Sync email campaigns, subscribers, and analytics',
          icon: Mail,
          color: 'yellow',
          isConnected: integrationsMap.get('mailchimp')?.is_active || false,
          apiKey: integrationsMap.get('mailchimp')?.credentials?.apiKey,
          lastSync: integrationsMap.get('mailchimp')?.last_sync,
        },
        {
          id: 'woocommerce',
          name: 'WooCommerce',
          category: 'E-commerce',
          description: 'Sync products, orders, and customer data from your shop',
          icon: ShoppingCart,
          color: 'purple',
          isConnected: integrationsMap.get('woocommerce')?.is_active || false,
          apiKey: integrationsMap.get('woocommerce')?.credentials?.apiKey,
          lastSync: integrationsMap.get('woocommerce')?.last_sync,
        },
        {
          id: 'stripe',
          name: 'Stripe',
          category: 'Payments',
          description: 'Track payments, subscriptions, and revenue',
          icon: DollarSign,
          color: 'blue',
          isConnected: integrationsMap.get('stripe')?.is_active || false,
          apiKey: integrationsMap.get('stripe')?.credentials?.apiKey,
          lastSync: integrationsMap.get('stripe')?.last_sync,
        },
        {
          id: 'google-analytics',
          name: 'Google Analytics',
          category: 'Analytics',
          description: 'Import website traffic and user behavior data',
          icon: BarChart,
          color: 'orange',
          isConnected: integrationsMap.get('google-analytics')?.is_active || false,
          apiKey: integrationsMap.get('google-analytics')?.credentials?.apiKey,
          lastSync: integrationsMap.get('google-analytics')?.last_sync,
        },
        {
          id: 'facebook',
          name: 'Facebook Business',
          category: 'Social Media',
          description: 'Manage pages, ads, and track social engagement',
          icon: Share2,
          color: 'blue',
          isConnected: integrationsMap.get('facebook')?.is_active || false,
          apiKey: integrationsMap.get('facebook')?.credentials?.apiKey,
          lastSync: integrationsMap.get('facebook')?.last_sync,
        },
        {
          id: 'instagram',
          name: 'Instagram Business',
          category: 'Social Media',
          description: 'Post content and track engagement metrics',
          icon: Share2,
          color: 'pink',
          isConnected: integrationsMap.get('instagram')?.is_active || false,
          apiKey: integrationsMap.get('instagram')?.credentials?.apiKey,
          lastSync: integrationsMap.get('instagram')?.last_sync,
        },
        {
          id: 'google-ads',
          name: 'Google Ads',
          category: 'Advertising',
          description: 'Monitor ad performance and campaign metrics',
          icon: Globe,
          color: 'green',
          isConnected: integrationsMap.get('google-ads')?.is_active || false,
          apiKey: integrationsMap.get('google-ads')?.credentials?.apiKey,
          lastSync: integrationsMap.get('google-ads')?.last_sync,
        },
        {
          id: 'hubspot',
          name: 'HubSpot',
          category: 'CRM',
          description: 'Sync contacts, deals, and marketing automation',
          icon: Users,
          color: 'orange',
          isConnected: integrationsMap.get('hubspot')?.is_active || false,
          apiKey: integrationsMap.get('hubspot')?.credentials?.apiKey,
          lastSync: integrationsMap.get('hubspot')?.last_sync,
        },
        {
          id: 'salesforce',
          name: 'Salesforce',
          category: 'CRM',
          description: 'Integrate customer data and sales pipeline',
          icon: Users,
          color: 'blue',
          isConnected: integrationsMap.get('salesforce')?.is_active || false,
          apiKey: integrationsMap.get('salesforce')?.credentials?.apiKey,
          lastSync: integrationsMap.get('salesforce')?.last_sync,
        },
        {
          id: 'slack',
          name: 'Slack',
          category: 'Communication',
          description: 'Get notifications and updates in your workspace',
          icon: MessageSquare,
          color: 'purple',
          isConnected: integrationsMap.get('slack')?.is_active || false,
          apiKey: integrationsMap.get('slack')?.credentials?.apiKey,
          lastSync: integrationsMap.get('slack')?.last_sync,
        },
        {
          id: 'zapier',
          name: 'Zapier',
          category: 'Automation',
          description: 'Connect with 5000+ apps through automated workflows',
          icon: Zap,
          color: 'orange',
          isConnected: integrationsMap.get('zapier')?.is_active || false,
          apiKey: integrationsMap.get('zapier')?.credentials?.apiKey,
          lastSync: integrationsMap.get('zapier')?.last_sync,
        },
        {
          id: 'wordpress',
          name: 'WordPress',
          category: 'Website',
          description: 'Manage blog posts and website content',
          icon: Globe,
          color: 'blue',
          isConnected: integrationsMap.get('wordpress')?.is_active || false,
          apiKey: integrationsMap.get('wordpress')?.credentials?.apiKey,
          lastSync: integrationsMap.get('wordpress')?.last_sync,
        },
        {
          id: 'splendid-account',
          name: 'Splendid Account',
          category: 'Accounting',
          description: 'Sync financial data, invoices, and accounting records',
          icon: FileText,
          color: 'green',
          isConnected: integrationsMap.get('splendid-account')?.is_active || false,
          apiKey: integrationsMap.get('splendid-account')?.credentials?.apiKey,
          lastSync: integrationsMap.get('splendid-account')?.last_sync,
        },
        {
          id: 'shipkardo',
          name: 'ShipKardo',
          category: 'Logistics',
          description: 'Manage shipments, track orders, and sync delivery status',
          icon: ShoppingCart,
          color: 'blue',
          isConnected: integrationsMap.get('shipkardo')?.is_active || false,
          apiKey: integrationsMap.get('shipkardo')?.credentials?.apiKey,
          lastSync: integrationsMap.get('shipkardo')?.last_sync,
        },
      ];

      setIntegrations(allIntegrations);
    } catch (error) {
      console.error('Error fetching integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const openConfigModal = (integration: Integration) => {
    setSelectedIntegration(integration);
    setApiKeyInput(integration.apiKey || '');
    setShowConfigModal(true);
  };

  const saveIntegration = async () => {
    if (!selectedIntegration) return;

    try {
      const { error } = await supabase
        .from('integrations')
        .upsert({
          service: selectedIntegration.id,
          credentials: { apiKey: apiKeyInput },
          is_active: true,
          last_sync: new Date().toISOString(),
        }, { onConflict: 'service' });

      if (error) throw error;

      alert(`${selectedIntegration.name} connected successfully!`);
      setShowConfigModal(false);
      fetchIntegrations();
    } catch (error) {
      console.error('Error saving integration:', error);
      alert('Failed to save integration. Please try again.');
    }
  };

  const disconnectIntegration = async (integrationId: string) => {
    try {
      const { error } = await supabase
        .from('integrations')
        .update({ is_active: false })
        .eq('service', integrationId);

      if (error) throw error;

      alert('Integration disconnected successfully!');
      fetchIntegrations();
    } catch (error) {
      console.error('Error disconnecting integration:', error);
    }
  };

  const syncIntegration = async (integration: Integration) => {
    alert(`Syncing ${integration.name}... This will fetch the latest data.`);
    try {
      const { error } = await supabase
        .from('integrations')
        .update({ last_sync: new Date().toISOString() })
        .eq('service', integration.id);

      if (error) throw error;

      fetchIntegrations();
    } catch (error) {
      console.error('Error syncing integration:', error);
    }
  };

  const colorClasses: Record<string, any> = {
    yellow: { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-200' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' },
    green: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
    pink: { bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-200' },
  };

  const categories = Array.from(new Set(integrations.map(i => i.category)));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Business Integrations</h2>
          <p className="text-gray-600 mt-1">Connect your favorite tools and automate your workflow</p>
        </div>
        <button
          onClick={fetchIntegrations}
          className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw size={20} className="mr-2" />
          Refresh
        </button>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <Zap size={32} className="text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Streamline Your Marketing Stack
            </h3>
            <p className="text-sm text-gray-700 mb-3">
              Connect all your business tools in one place. Sync data automatically, eliminate manual work,
              and get a complete view of your marketing performance across all platforms.
            </p>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Check size={14} className="text-green-600" />
                <span className="text-gray-600">{integrations.filter(i => i.isConnected).length} Active Integrations</span>
              </div>
              <div className="flex items-center gap-2">
                <Database size={14} className="text-blue-600" />
                <span className="text-gray-600">Secure Data Sync</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading integrations...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {categories.map(category => (
            <div key={category}>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{category}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {integrations
                  .filter(i => i.category === category)
                  .map(integration => {
                    const Icon = integration.icon;
                    const colors = colorClasses[integration.color];
                    return (
                      <div
                        key={integration.id}
                        className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                      >
                        <div className={`${colors.bg} p-4 border-b ${colors.border}`}>
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="bg-white p-2 rounded-lg shadow-sm">
                                <Icon size={24} className={colors.text} />
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900">{integration.name}</h4>
                                {integration.isConnected && (
                                  <span className="inline-flex items-center text-xs text-green-600">
                                    <Check size={12} className="mr-1" />
                                    Connected
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">{integration.description}</p>
                        </div>

                        <div className="p-4 bg-white">
                          {integration.isConnected ? (
                            <div className="space-y-3">
                              {integration.lastSync && (
                                <p className="text-xs text-gray-500">
                                  Last synced: {new Date(integration.lastSync).toLocaleString()}
                                </p>
                              )}
                              <div className="flex gap-2">
                                <button
                                  onClick={() => syncIntegration(integration)}
                                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                                >
                                  <RefreshCw size={14} />
                                  Sync
                                </button>
                                <button
                                  onClick={() => openConfigModal(integration)}
                                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                                >
                                  <Settings size={14} />
                                  Settings
                                </button>
                                <button
                                  onClick={() => disconnectIntegration(integration.id)}
                                  className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => openConfigModal(integration)}
                              className={`w-full flex items-center justify-center gap-2 px-4 py-2 ${colors.bg} ${colors.text} rounded-lg hover:opacity-80 transition-colors font-medium text-sm`}
                            >
                              Connect {integration.name}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      )}

      {showConfigModal && selectedIntegration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                {(() => {
                  const Icon = selectedIntegration.icon;
                  return <Icon size={24} className="text-gray-700" />;
                })()}
                <h3 className="text-xl font-bold text-gray-900">
                  Configure {selectedIntegration.name}
                </h3>
              </div>
              <p className="text-sm text-gray-600">{selectedIntegration.description}</p>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-gray-700">
                  <p className="font-medium text-gray-900 mb-1">API Key Required</p>
                  <p>You'll need to get your API key from {selectedIntegration.name}'s dashboard. Visit their documentation for instructions.</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Key / Access Token
                </label>
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder={`Enter your ${selectedIntegration.name} API key`}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <a
                href="#"
                className="flex items-center text-sm text-blue-600 hover:text-blue-700"
              >
                <ExternalLink size={14} className="mr-1" />
                How to get API key for {selectedIntegration.name}
              </a>
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowConfigModal(false)}
                className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveIntegration}
                disabled={!apiKeyInput.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Connect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
