import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Settings, Upload, Save, Palette, Image, Type, Link, Shield } from 'lucide-react';

interface AppSettings {
  appName: string;
  appLogo: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  tagline: string;
  contactEmail: string;
  companyUrl: string;
}

export default function AdminSettingsModule() {
  const [settings, setSettings] = useState<AppSettings>({
    appName: 'STEM N ROOT',
    appLogo: '',
    primaryColor: '#16a34a',
    secondaryColor: '#10b981',
    accentColor: '#059669',
    tagline: 'Digital Marketing Dashboard',
    contactEmail: '',
    companyUrl: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings({
          appName: data.app_name || 'STEM N ROOT',
          appLogo: data.app_logo || '',
          primaryColor: data.primary_color || '#16a34a',
          secondaryColor: data.secondary_color || '#10b981',
          accentColor: data.accent_color || '#059669',
          tagline: data.tagline || 'Digital Marketing Dashboard',
          contactEmail: data.contact_email || '',
          companyUrl: data.company_url || ''
        });
        setLogoPreview(data.app_logo || '');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('app_settings')
        .upsert({
          id: 1,
          app_name: settings.appName,
          app_logo: settings.appLogo,
          primary_color: settings.primaryColor,
          secondary_color: settings.secondaryColor,
          accent_color: settings.accentColor,
          tagline: settings.tagline,
          contact_email: settings.contactEmail,
          company_url: settings.companyUrl,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      alert('Settings saved successfully! Refresh the page to see changes.');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUrlChange = (url: string) => {
    setSettings({ ...settings, appLogo: url });
    setLogoPreview(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Admin Settings</h2>
          <p className="text-gray-600 mt-1">Customize your application appearance and branding</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          <Save size={20} />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Branding Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Type size={24} className="text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Branding</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Application Name
              </label>
              <input
                type="text"
                value={settings.appName}
                onChange={(e) => setSettings({ ...settings, appName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="STEM N ROOT"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tagline
              </label>
              <input
                type="text"
                value={settings.tagline}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Digital Marketing Dashboard"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={settings.appLogo}
                  onChange={(e) => handleLogoUrlChange(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="https://example.com/logo.png"
                />
              </div>
              {logoPreview && (
                <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-2">Logo Preview:</p>
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="h-12 object-contain"
                    onError={() => setLogoPreview('')}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Theme Colors */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Palette size={24} className="text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Theme Colors</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={settings.primaryColor}
                  onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                  className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.primaryColor}
                  onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Secondary Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={settings.secondaryColor}
                  onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                  className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.secondaryColor}
                  onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Accent Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={settings.accentColor}
                  onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                  className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.accentColor}
                  onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-3">Color Preview:</p>
              <div className="flex gap-2">
                <div
                  className="flex-1 h-16 rounded-lg"
                  style={{ backgroundColor: settings.primaryColor }}
                />
                <div
                  className="flex-1 h-16 rounded-lg"
                  style={{ backgroundColor: settings.secondaryColor }}
                />
                <div
                  className="flex-1 h-16 rounded-lg"
                  style={{ backgroundColor: settings.accentColor }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Company Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Link size={24} className="text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Company Information</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Email
              </label>
              <input
                type="email"
                value={settings.contactEmail}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="contact@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Website
              </label>
              <input
                type="url"
                value={settings.companyUrl}
                onChange={(e) => setSettings({ ...settings, companyUrl: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="https://www.example.com"
              />
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield size={24} className="text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Important Notes</h3>
          </div>

          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2"></div>
              <p>Changes will take effect after saving and refreshing the page</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2"></div>
              <p>Logo URL must be a valid image URL (PNG, JPG, SVG)</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2"></div>
              <p>Theme colors use hexadecimal format (#RRGGBB)</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2"></div>
              <p>Only admin users can access and modify these settings</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
