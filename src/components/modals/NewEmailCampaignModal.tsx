import { useState } from 'react';
import { X, FileText, Image, Link, Mail } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface NewEmailCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const EMAIL_TEMPLATES = [
  {
    id: 'newsletter',
    name: 'Newsletter',
    preview: 'Modern newsletter layout with header, content sections, and footer',
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: #16a34a; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">{{COMPANY_NAME}}</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #111827;">{{SUBJECT}}</h2>
          <p style="color: #4b5563; line-height: 1.6;">{{CONTENT}}</p>
        </div>
        <div style="background: #e5e7eb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280;">
          <p>© {{YEAR}} {{COMPANY_NAME}}. All rights reserved.</p>
        </div>
      </div>
    `
  },
  {
    id: 'promotion',
    name: 'Promotional',
    preview: 'Eye-catching promo template with call-to-action button',
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background: #ffffff;">
        <div style="padding: 40px; text-align: center;">
          <h1 style="color: #16a34a; font-size: 32px; margin: 0 0 20px 0;">{{SUBJECT}}</h1>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">{{CONTENT}}</p>
          <a href="{{CTA_LINK}}" style="display: inline-block; background: #16a34a; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold;">{{CTA_TEXT}}</a>
        </div>
      </div>
    `
  },
  {
    id: 'simple',
    name: 'Simple Text',
    preview: 'Clean, minimal text-based template',
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; padding: 40px; background: #ffffff;">
        <h2 style="color: #111827; margin: 0 0 20px 0;">{{SUBJECT}}</h2>
        <div style="color: #4b5563; line-height: 1.8;">{{CONTENT}}</div>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #9ca3af; font-size: 12px;">{{COMPANY_NAME}}</p>
      </div>
    `
  },
  {
    id: 'announcement',
    name: 'Announcement',
    preview: 'Bold announcement template with large heading',
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); padding: 60px 40px; text-align: center;">
          <h1 style="color: white; font-size: 36px; margin: 0;">{{SUBJECT}}</h1>
        </div>
        <div style="padding: 40px; background: #ffffff;">
          <p style="color: #4b5563; font-size: 16px; line-height: 1.8;">{{CONTENT}}</p>
        </div>
      </div>
    `
  }
];

export default function NewEmailCampaignModal({ isOpen, onClose, onSuccess }: NewEmailCampaignModalProps) {
  const [subject, setSubject] = useState('');
  const [previewText, setPreviewText] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [mailchimpApiKey, setMailchimpApiKey] = useState('');
  const [mailchimpListId, setMailchimpListId] = useState('');
  const [useMailchimp, setUseMailchimp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'details' | 'template' | 'content' | 'integration'>('details');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let bodyHtml = emailBody;

      if (selectedTemplate) {
        const template = EMAIL_TEMPLATES.find(t => t.id === selectedTemplate);
        if (template) {
          bodyHtml = template.html
            .replace(/{{SUBJECT}}/g, subject)
            .replace(/{{CONTENT}}/g, emailBody)
            .replace(/{{COMPANY_NAME}}/g, 'Your Company')
            .replace(/{{YEAR}}/g, new Date().getFullYear().toString())
            .replace(/{{CTA_TEXT}}/g, 'Learn More')
            .replace(/{{CTA_LINK}}/g, '#');
        }
      }

      const campaignData: any = {
        name: subject,
        subject,
        preview_text: previewText,
        body_html: bodyHtml,
        status: scheduledTime ? 'scheduled' : 'draft',
        scheduled_time: scheduledTime || null
      };

      if (useMailchimp) {
        campaignData.mailchimp_api_key = mailchimpApiKey;
        campaignData.mailchimp_list_id = mailchimpListId;
      }

      const { error: insertError } = await supabase
        .from('email_campaigns')
        .insert(campaignData);

      if (insertError) throw insertError;

      onSuccess();
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create email campaign');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSubject('');
    setPreviewText('');
    setEmailBody('');
    setSelectedTemplate('');
    setScheduledTime('');
    setMailchimpApiKey('');
    setMailchimpListId('');
    setUseMailchimp(false);
    setStep('details');
    setError('');
    onClose();
  };

  const renderStepContent = () => {
    switch (step) {
      case 'details':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Name / Subject Line
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
                placeholder="e.g., Fresh Organic Produce Available Now"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preview Text
              </label>
              <input
                type="text"
                value={previewText}
                onChange={(e) => setPreviewText(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="This appears in inbox preview"
              />
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
                type="button"
                onClick={() => setStep('template')}
                disabled={!subject}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                Next: Choose Template
              </button>
            </div>
          </>
        );

      case 'template':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Choose Email Template
              </label>
              <div className="grid grid-cols-2 gap-3">
                {EMAIL_TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => setSelectedTemplate(template.id)}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      selectedTemplate === template.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <FileText size={20} className="text-green-600 flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-semibold text-gray-900">{template.name}</h3>
                        <p className="text-xs text-gray-500 mt-1">{template.preview}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setStep('details')}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep('content')}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Next: Add Content
              </button>
            </div>
          </>
        );

      case 'content':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Content
              </label>
              <textarea
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows={8}
                required
                placeholder="Enter your email content here. If you selected a template, this will be automatically formatted."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Schedule Time (Optional)
              </label>
              <input
                type="datetime-local"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500">Leave empty to save as draft</p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setStep('template')}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep('integration')}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Next: Integration
              </button>
            </div>
          </>
        );

      case 'integration':
        return (
          <>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <Mail size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">Mailchimp Integration</h3>
                  <p className="text-sm text-blue-700">
                    Connect with Mailchimp to send campaigns to your audience. You'll need your API key and List ID.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="useMailchimp"
                checked={useMailchimp}
                onChange={(e) => setUseMailchimp(e.target.checked)}
                className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
              />
              <label htmlFor="useMailchimp" className="ml-2 text-sm font-medium text-gray-700">
                Enable Mailchimp Integration
              </label>
            </div>

            {useMailchimp && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mailchimp API Key
                  </label>
                  <input
                    type="password"
                    value={mailchimpApiKey}
                    onChange={(e) => setMailchimpApiKey(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter your Mailchimp API key"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    <a href="https://mailchimp.com/help/about-api-keys/" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-700">
                      Where to find your API key
                    </a>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Audience/List ID
                  </label>
                  <input
                    type="text"
                    value={mailchimpListId}
                    onChange={(e) => setMailchimpListId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter your Mailchimp List ID"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    <a href="https://mailchimp.com/help/find-audience-id/" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-700">
                      How to find your List ID
                    </a>
                  </p>
                </div>
              </>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setStep('content')}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading || (useMailchimp && (!mailchimpApiKey || !mailchimpListId))}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Campaign'}
              </button>
            </div>
          </>
        );
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 'details':
        return 'Campaign Details';
      case 'template':
        return 'Choose Template';
      case 'content':
        return 'Email Content';
      case 'integration':
        return 'Integration Settings';
      default:
        return 'Create Email Campaign';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">{getStepTitle()}</h2>
            <div className="flex items-center gap-2 mt-2">
              {['details', 'template', 'content', 'integration'].map((s, index) => (
                <div key={s} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      step === s
                        ? 'bg-green-600 text-white'
                        : ['details', 'template', 'content', 'integration'].indexOf(step) > index
                        ? 'bg-green-100 text-green-600'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {index + 1}
                  </div>
                  {index < 3 && (
                    <div
                      className={`w-8 h-0.5 ${
                        ['details', 'template', 'content', 'integration'].indexOf(step) > index
                          ? 'bg-green-600'
                          : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
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

          {renderStepContent()}
        </form>
      </div>
    </div>
  );
}
