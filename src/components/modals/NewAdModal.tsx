import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { X, Image, Video, Layers, Type, Upload } from 'lucide-react';

interface NewAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function NewAdModal({ isOpen, onClose, onSuccess }: NewAdModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'image' as 'image' | 'video' | 'carousel' | 'text',
    platform: 'Facebook',
    format: '1200x628',
    headline: '',
    description: '',
    cta_text: 'Learn More',
    image_url: '',
    video_url: '',
    status: 'draft'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const platforms = ['Facebook', 'Instagram', 'Google Ads', 'YouTube', 'LinkedIn', 'Twitter', 'TikTok'];

  const formats: Record<string, string[]> = {
    Facebook: ['1200x628', '1080x1080', '1200x1500', '1080x1920'],
    Instagram: ['1080x1080', '1080x1920', '1080x566'],
    'Google Ads': ['1200x628', '300x250', '728x90', '160x600'],
    YouTube: ['1920x1080', '1280x720'],
    LinkedIn: ['1200x627', '1080x1080'],
    Twitter: ['1200x675', '1080x1080'],
    TikTok: ['1080x1920', '1080x1350']
  };

  const ctaOptions = [
    'Learn More', 'Shop Now', 'Sign Up', 'Download', 'Get Started',
    'Subscribe', 'Contact Us', 'Watch Now', 'Book Now', 'Apply Now'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('You must be logged in to create ads');
        return;
      }

      if (!formData.name.trim()) {
        setError('Ad name is required');
        return;
      }

      if (!formData.headline.trim()) {
        setError('Headline is required');
        return;
      }

      if (!formData.description.trim()) {
        setError('Description is required');
        return;
      }

      const { error: insertError } = await supabase
        .from('ad_creatives')
        .insert([{
          user_id: user.id,
          name: formData.name,
          type: formData.type,
          platform: formData.platform,
          format: formData.format,
          headline: formData.headline,
          description: formData.description,
          cta_text: formData.cta_text,
          image_url: formData.image_url || null,
          video_url: formData.video_url || null,
          status: formData.status
        }]);

      if (insertError) throw insertError;

      setFormData({
        name: '',
        type: 'image',
        platform: 'Facebook',
        format: '1200x628',
        headline: '',
        description: '',
        cta_text: 'Learn More',
        image_url: '',
        video_url: '',
        status: 'draft'
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create ad');
    } finally {
      setLoading(false);
    }
  };

  const handleTypeChange = (type: 'image' | 'video' | 'carousel' | 'text') => {
    setFormData({ ...formData, type });
    if (type === 'text') {
      setFormData(prev => ({ ...prev, image_url: '', video_url: '' }));
    }
  };

  const handlePlatformChange = (platform: string) => {
    setFormData({
      ...formData,
      platform,
      format: formats[platform][0]
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Create New Ad</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Ad Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ad Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="e.g., Summer Sale Campaign - Image 1"
              required
            />
          </div>

          {/* Ad Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ad Type *
            </label>
            <div className="grid grid-cols-4 gap-3">
              {[
                { value: 'image', label: 'Image', icon: Image },
                { value: 'video', label: 'Video', icon: Video },
                { value: 'carousel', label: 'Carousel', icon: Layers },
                { value: 'text', label: 'Text', icon: Type }
              ].map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleTypeChange(type.value as any)}
                    className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-colors ${
                      formData.type === type.value
                        ? 'border-green-600 bg-green-50 text-green-700'
                        : 'border-gray-300 text-gray-600 hover:border-gray-400'
                    }`}
                  >
                    <Icon size={24} />
                    <span className="text-sm font-medium">{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Platform */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Platform *
            </label>
            <select
              value={formData.platform}
              onChange={(e) => handlePlatformChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            >
              {platforms.map((platform) => (
                <option key={platform} value={platform}>
                  {platform}
                </option>
              ))}
            </select>
          </div>

          {/* Format */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Format (Dimensions) *
            </label>
            <select
              value={formData.format}
              onChange={(e) => setFormData({ ...formData, format: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            >
              {formats[formData.platform].map((format) => (
                <option key={format} value={format}>
                  {format}
                </option>
              ))}
            </select>
          </div>

          {/* Headline */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Headline *
            </label>
            <input
              type="text"
              value={formData.headline}
              onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="e.g., Get 50% Off All Products"
              maxLength={100}
              required
            />
            <p className="text-xs text-gray-500 mt-1">{formData.headline.length}/100 characters</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="e.g., Limited time offer on all our premium products..."
              rows={3}
              maxLength={300}
              required
            />
            <p className="text-xs text-gray-500 mt-1">{formData.description.length}/300 characters</p>
          </div>

          {/* CTA Button */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Call to Action *
            </label>
            <select
              value={formData.cta_text}
              onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            >
              {ctaOptions.map((cta) => (
                <option key={cta} value={cta}>
                  {cta}
                </option>
              ))}
            </select>
          </div>

          {/* Media URLs */}
          {formData.type !== 'text' && (
            <>
              {(formData.type === 'image' || formData.type === 'carousel') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="https://example.com/image.jpg"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter a public image URL or use stock photos from Pexels
                  </p>
                </div>
              )}

              {formData.type === 'video' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Video URL
                  </label>
                  <input
                    type="url"
                    value={formData.video_url}
                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="https://example.com/video.mp4"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter a public video URL
                  </p>
                </div>
              )}
            </>
          )}

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
            </select>
          </div>

          {/* Preview */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Ad Preview</h3>
            <div className="bg-white border border-gray-300 rounded-lg p-4">
              {formData.image_url && (
                <img
                  src={formData.image_url}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg mb-3"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">{formData.headline || 'Your headline here'}</h4>
                <p className="text-sm text-gray-600">{formData.description || 'Your description here'}</p>
                <button
                  type="button"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium"
                >
                  {formData.cta_text}
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Ad'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
