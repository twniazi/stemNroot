import { useState } from 'react';
import { X, Palette, ExternalLink, Image, FileText } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface NewContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function NewContentModal({ isOpen, onClose, onSuccess }: NewContentModalProps) {
  const [title, setTitle] = useState('');
  const [contentType, setContentType] = useState('blog');
  const [platform, setPlatform] = useState('Website');
  const [scheduledDate, setScheduledDate] = useState('');
  const [bodyText, setBodyText] = useState('');
  const [canvaDesignUrl, setCanvaDesignUrl] = useState('');
  const [canvaApiKey, setCanvaApiKey] = useState('');
  const [useCanva, setUseCanva] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const contentData: any = {
        title,
        content_type: contentType,
        platform,
        status: 'draft',
        scheduled_date: scheduledDate,
        body_text: bodyText
      };

      if (useCanva) {
        contentData.canva_design_url = canvaDesignUrl;
        contentData.canva_api_key = canvaApiKey;
        contentData.canva_integration_status = 'connected';
      }

      const { error: insertError } = await supabase
        .from('content_calendar')
        .insert(contentData);

      if (insertError) throw insertError;

      onSuccess();
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create content');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setContentType('blog');
    setPlatform('Website');
    setScheduledDate('');
    setBodyText('');
    setCanvaDesignUrl('');
    setCanvaApiKey('');
    setUseCanva(false);
    setError('');
    onClose();
  };

  const openCanvaDesigner = () => {
    const canvaUrl = 'https://www.canva.com/design/new';
    window.open(canvaUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Add New Content</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
              placeholder="e.g., How to Grow Organic Vegetables"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content Type
              </label>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              >
                <option value="blog">Blog Post</option>
                <option value="tweet">Social Media</option>
                <option value="instagram">Instagram</option>
                <option value="facebook">Facebook</option>
                <option value="youtube">Video</option>
                <option value="email">Email Newsletter</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Platform
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              >
                <option value="Website">Website</option>
                <option value="Facebook">Facebook</option>
                <option value="Instagram">Instagram</option>
                <option value="Twitter">Twitter</option>
                <option value="YouTube">YouTube</option>
                <option value="Email">Email</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content Description
            </label>
            <textarea
              value={bodyText}
              onChange={(e) => setBodyText(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              rows={4}
              placeholder="Brief description or notes about this content..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Scheduled Date
            </label>
            <input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          {/* Canva Integration Section */}
          <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <Palette size={20} className="text-purple-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-purple-900 mb-1">Canva Integration</h3>
                  <p className="text-sm text-purple-700 mb-3">
                    Connect your content calendar with Canva designs. Create stunning graphics and link them to your scheduled content.
                  </p>
                  <button
                    type="button"
                    onClick={openCanvaDesigner}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                  >
                    <Palette size={16} />
                    Open Canva Designer
                    <ExternalLink size={14} />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="useCanva"
                checked={useCanva}
                onChange={(e) => setUseCanva(e.target.checked)}
                className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
              />
              <label htmlFor="useCanva" className="ml-2 text-sm font-medium text-gray-700">
                Link Canva Design to this Content
              </label>
            </div>

            {useCanva && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Canva Design URL
                  </label>
                  <input
                    type="url"
                    value={canvaDesignUrl}
                    onChange={(e) => setCanvaDesignUrl(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="https://www.canva.com/design/..."
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Copy the URL from your Canva design and paste it here. This creates a direct link between your content and design.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Canva API Key (Optional)
                  </label>
                  <input
                    type="password"
                    value={canvaApiKey}
                    onChange={(e) => setCanvaApiKey(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter your Canva API key for advanced integration"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    <a
                      href="https://www.canva.com/developers/docs/apps/authentication/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-700"
                    >
                      How to get your Canva API key
                    </a>
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                  <div className="flex items-start gap-2">
                    <FileText size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-blue-900 font-medium">Pro Tip:</p>
                      <p className="text-xs text-blue-700 mt-1">
                        With the Canva link, you can quickly access your design when it's time to publish. The API key enables automatic export and sync features.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || (useCanva && !canvaDesignUrl)}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Content'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
