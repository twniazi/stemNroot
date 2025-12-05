import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
  Building2, FileText, Package, LogIn, ExternalLink,
  TrendingUp, DollarSign, ShoppingCart, AlertCircle,
  Eye, EyeOff, Check, X, Users, Settings, BarChart3,
  Bell, Calendar, CreditCard, Truck, MapPin, Box
} from 'lucide-react';

interface BusinessAccount {
  id: string;
  service: string;
  username: string;
  password?: string;
  isConnected: boolean;
  lastLogin?: string;
}

export default function BusinessModule() {
  const [accounts, setAccounts] = useState<BusinessAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [activeView, setActiveView] = useState<'dashboard' | 'accounts'>('dashboard');

  useEffect(() => {
    fetchBusinessAccounts();
  }, []);

  const fetchBusinessAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('business_accounts')
        .select('*');

      if (error) throw error;

      const accountsData: BusinessAccount[] = [
        {
          id: 'splendid-account',
          service: 'Splendid Account',
          username: data?.find(a => a.service === 'splendid-account')?.username || '',
          isConnected: data?.find(a => a.service === 'splendid-account')?.is_connected || false,
          lastLogin: data?.find(a => a.service === 'splendid-account')?.last_login,
        },
        {
          id: 'shipkardo',
          service: 'ShipKardo',
          username: data?.find(a => a.service === 'shipkardo')?.username || '',
          isConnected: data?.find(a => a.service === 'shipkardo')?.is_connected || false,
          lastLogin: data?.find(a => a.service === 'shipkardo')?.last_login,
        },
      ];

      setAccounts(accountsData);
    } catch (error) {
      console.error('Error fetching business accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const openLoginModal = (serviceId: string) => {
    const account = accounts.find(a => a.id === serviceId);
    setSelectedService(serviceId);
    setUsername(account?.username || '');
    setPassword('');
    setShowPassword(false);
    setShowLoginModal(true);
  };

  const handleLogin = async () => {
    if (!selectedService || !username || !password) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const { error } = await supabase
        .from('business_accounts')
        .upsert({
          service: selectedService,
          username: username,
          password_encrypted: password,
          is_connected: true,
          last_login: new Date().toISOString(),
        }, { onConflict: 'service' });

      if (error) throw error;

      alert(`Successfully logged in to ${accounts.find(a => a.id === selectedService)?.service}!`);
      setShowLoginModal(false);
      fetchBusinessAccounts();
    } catch (error) {
      console.error('Error saving login:', error);
      alert('Failed to save login credentials. Please try again.');
    }
  };

  const handleLogout = async (serviceId: string) => {
    try {
      const { error } = await supabase
        .from('business_accounts')
        .update({ is_connected: false })
        .eq('service', serviceId);

      if (error) throw error;

      alert('Successfully logged out!');
      fetchBusinessAccounts();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const openExternalApp = (url: string, serviceName: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const splendidAccount = accounts.find(a => a.id === 'splendid-account');
  const shipkardo = accounts.find(a => a.id === 'shipkardo');

  const splendidTools = [
    { name: 'Dashboard', icon: BarChart3, color: 'green' },
    { name: 'Invoices', icon: FileText, color: 'blue' },
    { name: 'Expenses', icon: CreditCard, color: 'orange' },
    { name: 'Customers', icon: Users, color: 'purple' },
    { name: 'Reports', icon: TrendingUp, color: 'teal' },
    { name: 'Settings', icon: Settings, color: 'gray' },
  ];

  const shipkardoTools = [
    { name: 'Shipments', icon: Package, color: 'blue' },
    { name: 'Tracking', icon: MapPin, color: 'red' },
    { name: 'Orders', icon: ShoppingCart, color: 'green' },
    { name: 'Delivery', icon: Truck, color: 'orange' },
    { name: 'Warehouse', icon: Box, color: 'purple' },
    { name: 'Alerts', icon: Bell, color: 'yellow' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Business Tools</h2>
          <p className="text-gray-600 mt-1">Manage your accounting and logistics platforms</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveView('dashboard')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeView === 'dashboard'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveView('accounts')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeView === 'accounts'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Accounts
          </button>
        </div>
      </div>

      {activeView === 'dashboard' ? (
        <>
          {/* Analytics Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Total Revenue</h3>
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign size={20} className="text-green-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">PKR 2.4M</p>
              <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                <TrendingUp size={14} />
                +18% vs last month
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Active Shipments</h3>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Truck size={20} className="text-blue-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">42</p>
              <p className="text-sm text-gray-500 mt-1">12 in transit</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Total Invoices</h3>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FileText size={20} className="text-purple-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">156</p>
              <p className="text-sm text-gray-500 mt-1">23 pending</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Total Orders</h3>
                <div className="p-2 bg-orange-100 rounded-lg">
                  <ShoppingCart size={20} className="text-orange-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">328</p>
              <p className="text-sm text-gray-500 mt-1">This month</p>
            </div>
          </div>

          {/* Splendid Account Dashboard */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white rounded-lg shadow-sm">
                    <FileText size={24} className="text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Splendid Account Analytics</h3>
                    <p className="text-sm text-gray-600">Financial overview and insights</p>
                  </div>
                </div>
                {splendidAccount?.isConnected ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                    <Check size={14} className="mr-1" />
                    Connected
                  </span>
                ) : (
                  <button
                    onClick={() => openLoginModal('splendid-account')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    Connect
                  </button>
                )}
              </div>
            </div>

            <div className="p-6">
              {splendidAccount?.isConnected ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign size={18} className="text-green-600" />
                        <span className="text-sm text-gray-600">Monthly Revenue</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">PKR 2.4M</p>
                      <div className="mt-2 flex items-center gap-1 text-sm text-green-600">
                        <TrendingUp size={14} />
                        <span>+18% from last month</span>
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText size={18} className="text-blue-600" />
                        <span className="text-sm text-gray-600">Invoices Issued</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">156</p>
                      <div className="mt-2 text-sm text-gray-500">
                        23 pending payment
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Users size={18} className="text-purple-600" />
                        <span className="text-sm text-gray-600">Active Customers</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">89</p>
                      <div className="mt-2 text-sm text-gray-500">
                        12 new this month
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Recent Financial Activity</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-50 rounded">
                            <DollarSign size={16} className="text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Payment Received</p>
                            <p className="text-xs text-gray-500">Invoice #1234 - Acme Corp</p>
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-green-600">+PKR 125,000</span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-50 rounded">
                            <FileText size={16} className="text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Invoice Created</p>
                            <p className="text-xs text-gray-500">Invoice #1235 - Tech Solutions</p>
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">PKR 85,000</span>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-orange-50 rounded">
                            <CreditCard size={16} className="text-orange-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Expense Recorded</p>
                            <p className="text-xs text-gray-500">Office Supplies</p>
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-red-600">-PKR 12,500</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <AlertCircle size={48} className="mx-auto text-gray-400 mb-3" />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Connect Splendid Account</h4>
                  <p className="text-gray-600 mb-4">Login to view your financial analytics and insights</p>
                  <button
                    onClick={() => openLoginModal('splendid-account')}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Connect Now
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ShipKardo Dashboard */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-blue-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white rounded-lg shadow-sm">
                    <Truck size={24} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">ShipKardo Analytics</h3>
                    <p className="text-sm text-gray-600">Logistics and shipping overview</p>
                  </div>
                </div>
                {shipkardo?.isConnected ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                    <Check size={14} className="mr-1" />
                    Connected
                  </span>
                ) : (
                  <button
                    onClick={() => openLoginModal('shipkardo')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Connect
                  </button>
                )}
              </div>
            </div>

            <div className="p-6">
              {shipkardo?.isConnected ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Package size={18} className="text-blue-600" />
                        <span className="text-sm text-gray-600">Active Shipments</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">42</p>
                      <div className="mt-2 text-sm text-blue-600">
                        12 in transit
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Check size={18} className="text-green-600" />
                        <span className="text-sm text-gray-600">Delivered Today</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">18</p>
                      <div className="mt-2 text-sm text-gray-500">
                        95% on-time rate
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin size={18} className="text-red-600" />
                        <span className="text-sm text-gray-600">Cities Covered</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">24</p>
                      <div className="mt-2 text-sm text-gray-500">
                        Across Pakistan
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Recent Shipment Activity</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-50 rounded">
                            <Check size={16} className="text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Delivered</p>
                            <p className="text-xs text-gray-500">Tracking #SK-2024-001234 - Karachi</p>
                          </div>
                        </div>
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">Completed</span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-50 rounded">
                            <Truck size={16} className="text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">In Transit</p>
                            <p className="text-xs text-gray-500">Tracking #SK-2024-001235 - Lahore</p>
                          </div>
                        </div>
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">Active</span>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-yellow-50 rounded">
                            <Package size={16} className="text-yellow-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Picked Up</p>
                            <p className="text-xs text-gray-500">Tracking #SK-2024-001236 - Islamabad</p>
                          </div>
                        </div>
                        <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full">Processing</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <AlertCircle size={48} className="mx-auto text-gray-400 mb-3" />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Connect ShipKardo</h4>
                  <p className="text-gray-600 mb-4">Login to view your shipment analytics and tracking</p>
                  <button
                    onClick={() => openLoginModal('shipkardo')}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Connect Now
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Accounts View */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <Building2 size={32} className="text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Integrated Business Management
                </h3>
                <p className="text-sm text-gray-700 mb-3">
                  Access your accounting and logistics platforms directly from your dashboard.
                  Login once and manage all your business operations in one place.
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Check size={14} className="text-green-600" />
                    <span className="text-gray-600">Secure credential storage</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check size={14} className="text-green-600" />
                    <span className="text-gray-600">Quick access to tools</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Splendid Account Card */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 border-b border-green-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <FileText size={28} className="text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Splendid Account</h3>
                  <p className="text-sm text-gray-600">Accounting & Financial Management</p>
                </div>
              </div>
              {splendidAccount?.isConnected && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                  <Check size={12} className="mr-1" />
                  Connected
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign size={16} className="text-green-600" />
                  <p className="text-xs text-gray-600">Revenue</p>
                </div>
                <p className="text-lg font-bold text-gray-900">PKR 2.4M</p>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <FileText size={16} className="text-blue-600" />
                  <p className="text-xs text-gray-600">Invoices</p>
                </div>
                <p className="text-lg font-bold text-gray-900">156</p>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp size={16} className="text-orange-600" />
                  <p className="text-xs text-gray-600">Growth</p>
                </div>
                <p className="text-lg font-bold text-gray-900">+18%</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white">
            <p className="text-sm text-gray-600 mb-4">
              Manage your financial records, invoices, expenses, and accounting reports.
            </p>

            {splendidAccount?.isConnected ? (
              <div className="space-y-4">
                {splendidAccount.lastLogin && (
                  <p className="text-xs text-gray-500">
                    Last login: {new Date(splendidAccount.lastLogin).toLocaleString()}
                  </p>
                )}

                <div className="grid grid-cols-3 gap-3 mb-4">
                  {splendidTools.map((tool) => {
                    const Icon = tool.icon;
                    return (
                      <button
                        key={tool.name}
                        onClick={() => openExternalApp('https://app.splendidaccounts.com/', 'Splendid Account')}
                        className="flex flex-col items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all group"
                      >
                        <div className={`p-2 rounded-lg bg-${tool.color}-50 group-hover:bg-${tool.color}-100 transition-colors`}>
                          <Icon size={20} className={`text-${tool.color}-600`} />
                        </div>
                        <span className="text-xs font-medium text-gray-700">{tool.name}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openExternalApp('https://app.splendidaccounts.com/', 'Splendid Account')}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    <ExternalLink size={16} />
                    Open Splendid Account
                  </button>
                  <button
                    onClick={() => handleLogout('splendid-account')}
                    className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => openLoginModal('splendid-account')}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                <LogIn size={16} />
                Login to Splendid Account
              </button>
            )}
          </div>
        </div>

        {/* ShipKardo Card */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 border-b border-blue-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <Package size={28} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">ShipKardo</h3>
                  <p className="text-sm text-gray-600">Logistics & Shipping Management</p>
                </div>
              </div>
              {shipkardo?.isConnected && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                  <Check size={12} className="mr-1" />
                  Connected
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <Package size={16} className="text-blue-600" />
                  <p className="text-xs text-gray-600">Shipments</p>
                </div>
                <p className="text-lg font-bold text-gray-900">342</p>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <ShoppingCart size={16} className="text-green-600" />
                  <p className="text-xs text-gray-600">Delivered</p>
                </div>
                <p className="text-lg font-bold text-gray-900">298</p>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp size={16} className="text-orange-600" />
                  <p className="text-xs text-gray-600">Transit</p>
                </div>
                <p className="text-lg font-bold text-gray-900">44</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white">
            <p className="text-sm text-gray-600 mb-4">
              Track shipments, manage deliveries, and optimize your logistics operations.
            </p>

            {shipkardo?.isConnected ? (
              <div className="space-y-4">
                {shipkardo.lastLogin && (
                  <p className="text-xs text-gray-500">
                    Last login: {new Date(shipkardo.lastLogin).toLocaleString()}
                  </p>
                )}

                <div className="grid grid-cols-3 gap-3 mb-4">
                  {shipkardoTools.map((tool) => {
                    const Icon = tool.icon;
                    return (
                      <button
                        key={tool.name}
                        onClick={() => openExternalApp('https://app.shipkardo.pk/', 'ShipKardo')}
                        className="flex flex-col items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all group"
                      >
                        <div className={`p-2 rounded-lg bg-${tool.color}-50 group-hover:bg-${tool.color}-100 transition-colors`}>
                          <Icon size={20} className={`text-${tool.color}-600`} />
                        </div>
                        <span className="text-xs font-medium text-gray-700">{tool.name}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openExternalApp('https://app.shipkardo.pk/', 'ShipKardo')}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    <ExternalLink size={16} />
                    Open ShipKardo
                  </button>
                  <button
                    onClick={() => handleLogout('shipkardo')}
                    className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => openLoginModal('shipkardo')}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <LogIn size={16} />
                Login to ShipKardo
              </button>
            )}
          </div>
          </div>
        </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => splendidAccount?.isConnected && openExternalApp('https://app.splendidaccounts.com/', 'Splendid Account')}
            disabled={!splendidAccount?.isConnected}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileText size={24} className="text-green-600 mb-2" />
            <p className="font-medium text-gray-900">Create Invoice</p>
            <p className="text-sm text-gray-600 mt-1">Generate new invoice in Splendid</p>
          </button>
          <button
            onClick={() => shipkardo?.isConnected && openExternalApp('https://app.shipkardo.pk/', 'ShipKardo')}
            disabled={!shipkardo?.isConnected}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Package size={24} className="text-blue-600 mb-2" />
            <p className="font-medium text-gray-900">Book Shipment</p>
            <p className="text-sm text-gray-600 mt-1">Create new shipment in ShipKardo</p>
          </button>
          <button
            onClick={() => {
              if (splendidAccount?.isConnected && shipkardo?.isConnected) {
                openExternalApp('https://app.splendidaccounts.com/', 'Splendid Account');
                setTimeout(() => openExternalApp('https://app.shipkardo.pk/', 'ShipKardo'), 500);
              } else if (splendidAccount?.isConnected) {
                openExternalApp('https://app.splendidaccounts.com/', 'Splendid Account');
              } else if (shipkardo?.isConnected) {
                openExternalApp('https://app.shipkardo.pk/', 'ShipKardo');
              }
            }}
            disabled={!splendidAccount?.isConnected && !shipkardo?.isConnected}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <TrendingUp size={24} className="text-orange-600 mb-2" />
            <p className="font-medium text-gray-900">View Reports</p>
            <p className="text-sm text-gray-600 mt-1">Access financial & logistics reports</p>
          </button>
            </div>
          </div>
        </>
      )}

      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <LogIn size={24} className="text-gray-700" />
                <h3 className="text-xl font-bold text-gray-900">
                  Login to {accounts.find(a => a.id === selectedService)?.service}
                </h3>
              </div>
              <p className="text-sm text-gray-600">
                Enter your credentials to connect your account
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username / Email
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username or email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-gray-700">
                  <p className="font-medium text-gray-900 mb-1">Secure Storage</p>
                  <p>Your credentials are encrypted and stored securely. We never share your login information.</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowLoginModal(false)}
                className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogin}
                disabled={!username.trim() || !password.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
