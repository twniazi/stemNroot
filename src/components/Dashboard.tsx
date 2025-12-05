import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
  Home, TrendingUp, FileText, Search, Share2, BarChart3,
  Mail, ShoppingCart, Users, Menu, X, LogOut,
  Globe, Target, DollarSign, Plug, Building2, Settings as SettingsIcon,
  Palette, ChevronLeft, ChevronRight
} from 'lucide-react';
import ExecutiveDashboard from './modules/ExecutiveDashboard';
import WebsiteModule from './modules/WebsiteModule';
import SEOModule from './modules/SEOModule';
import SocialMediaModule from './modules/SocialMediaModule';
import AnalyticsModule from './modules/AnalyticsModule';
import EmailMarketingModule from './modules/EmailMarketingModule';
import CampaignsModule from './modules/CampaignsModule';
import LeadsModule from './modules/LeadsModule';
import ContentCalendarModule from './modules/ContentCalendarModule';
import EcommerceModule from './modules/EcommerceModule';
import ReportsModule from './modules/ReportsModule';
import IntegrationsModule from './modules/IntegrationsModule';
import BusinessModule from './modules/BusinessModule';
import OnlineAdsModule from './modules/OnlineAdsModule';
import AdminSettingsModule from './modules/AdminSettingsModule';

const modules = [
  { id: 'dashboard', name: 'Executive Dashboard', icon: Home },
  { id: 'website', name: 'Website', icon: Globe },
  { id: 'seo', name: 'SEO', icon: Search },
  { id: 'social', name: 'Social Media', icon: Share2 },
  { id: 'analytics', name: 'Analytics', icon: TrendingUp },
  { id: 'campaigns', name: 'Campaigns', icon: Target },
  { id: 'email', name: 'Email Marketing', icon: Mail },
  { id: 'leads', name: 'Leads', icon: Users },
  { id: 'content', name: 'Content Calendar', icon: FileText },
  { id: 'ecommerce', name: 'E-commerce', icon: ShoppingCart },
  { id: 'ads', name: 'Online Ads', icon: DollarSign },
  { id: 'business', name: 'Business Tools', icon: Building2 },
  { id: 'integrations', name: 'Integrations', icon: Plug },
  { id: 'reports', name: 'Reports', icon: BarChart3 },
  { id: 'settings', name: 'Admin Settings', icon: SettingsIcon },
];

const themePresets = [
  { name: 'Green', primary: '#16a34a', secondary: '#10b981' },
  { name: 'Blue', primary: '#2563eb', secondary: '#3b82f6' },
  { name: 'Purple', primary: '#9333ea', secondary: '#a855f7' },
  { name: 'Red', primary: '#dc2626', secondary: '#ef4444' },
  { name: 'Orange', primary: '#ea580c', secondary: '#f97316' },
  { name: 'Teal', primary: '#0d9488', secondary: '#14b8a6' },
];

export default function Dashboard() {
  const [activeModule, setActiveModule] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [currentTheme, setCurrentTheme] = useState({ primary: '#16a34a', secondary: '#10b981' });
  const [appSettings, setAppSettings] = useState({
    appName: 'STEM N ROOT',
    appLogo: '',
    tagline: 'Digital Marketing Dashboard'
  });
  const { signOut, user, userRole } = useAuth();

  useEffect(() => {
    loadAppSettings();
  }, []);

  const loadAppSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setAppSettings({
          appName: data.app_name || 'STEM N ROOT',
          appLogo: data.app_logo || '',
          tagline: data.tagline || 'Digital Marketing Dashboard'
        });
        setCurrentTheme({
          primary: data.primary_color || '#16a34a',
          secondary: data.secondary_color || '#10b981'
        });
        applyTheme(data.primary_color || '#16a34a', data.secondary_color || '#10b981');
      }
    } catch (error) {
      console.error('Error loading app settings:', error);
    }
  };

  const applyTheme = (primary: string, secondary: string) => {
    document.documentElement.style.setProperty('--color-primary', primary);
    document.documentElement.style.setProperty('--color-secondary', secondary);
  };

  const handleThemeChange = async (preset: typeof themePresets[0]) => {
    setCurrentTheme({ primary: preset.primary, secondary: preset.secondary });
    applyTheme(preset.primary, preset.secondary);

    try {
      await supabase
        .from('app_settings')
        .update({
          primary_color: preset.primary,
          secondary_color: preset.secondary,
          updated_at: new Date().toISOString()
        })
        .eq('id', 1);
    } catch (error) {
      console.error('Error saving theme:', error);
    }

    setShowThemePicker(false);
  };

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <ExecutiveDashboard />;
      case 'website':
        return <WebsiteModule />;
      case 'seo':
        return <SEOModule />;
      case 'social':
        return <SocialMediaModule />;
      case 'analytics':
        return <AnalyticsModule />;
      case 'campaigns':
        return <CampaignsModule />;
      case 'email':
        return <EmailMarketingModule />;
      case 'leads':
        return <LeadsModule />;
      case 'content':
        return <ContentCalendarModule />;
      case 'ecommerce':
        return <EcommerceModule />;
      case 'ads':
        return <OnlineAdsModule />;
      case 'reports':
        return <ReportsModule />;
      case 'integrations':
        return <IntegrationsModule />;
      case 'business':
        return <BusinessModule />;
      case 'settings':
        return <AdminSettingsModule />;
      default:
        return <ExecutiveDashboard />;
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <div className="flex items-center ml-2 lg:ml-0">
                {appSettings.appLogo ? (
                  <img src={appSettings.appLogo} alt={appSettings.appName} className="h-8 w-auto" />
                ) : (
                  <div className="h-8 w-8 bg-green-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {appSettings.appName.split(' ').map(w => w[0]).join('').substring(0, 2)}
                    </span>
                  </div>
                )}
                <div className="ml-3">
                  <h1 className="text-lg font-bold text-gray-900">{appSettings.appName}</h1>
                  <p className="text-xs text-gray-500 hidden sm:block">{appSettings.tagline}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Theme Picker */}
              <div className="relative">
                <button
                  onClick={() => setShowThemePicker(!showThemePicker)}
                  className="p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Change Theme"
                >
                  <Palette size={20} />
                </button>

                {showThemePicker && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-3 border-b border-gray-200">
                      <p className="text-sm font-semibold text-gray-900">Select Theme</p>
                    </div>
                    <div className="p-2 space-y-1">
                      {themePresets.map((preset) => (
                        <button
                          key={preset.name}
                          onClick={() => handleThemeChange(preset)}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <span className="text-sm font-medium text-gray-700">{preset.name}</span>
                          <div className="flex gap-1">
                            <div
                              className="w-6 h-6 rounded border border-gray-200"
                              style={{ backgroundColor: preset.primary }}
                            />
                            <div
                              className="w-6 h-6 rounded border border-gray-200"
                              style={{ backgroundColor: preset.secondary }}
                            />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                <p className="text-xs text-gray-500 capitalize">{userRole}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut size={16} className="mr-2" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar Navigation */}
        <aside
          className={`${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 ${
            sidebarCollapsed ? 'w-16' : 'w-64'
          } bg-white border-r border-gray-200 transition-all duration-300 ease-in-out overflow-y-auto`}
        >
          {/* Sidebar Toggle Button */}
          <div className="hidden lg:flex justify-end p-2 border-b border-gray-200">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
          </div>

          <nav className="px-3 py-4 space-y-1">
            {modules.map((module) => {
              const Icon = module.icon;
              const isActive = activeModule === module.id;
              return (
                <button
                  key={module.id}
                  onClick={() => {
                    setActiveModule(module.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center ${
                    sidebarCollapsed ? 'justify-center px-2' : 'px-3'
                  } py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-green-50 text-green-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  title={sidebarCollapsed ? module.name : ''}
                >
                  <Icon size={20} className={sidebarCollapsed ? '' : 'mr-3'} />
                  {!sidebarCollapsed && <span>{module.name}</span>}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {renderModule()}
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
