import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Facebook, Instagram, Twitter, Youtube, Plus, Video } from 'lucide-react';
import NewPostModal from '../modals/NewPostModal';

export default function SocialMediaModule() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data } = await supabase
        .from('social_media_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (data) setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const platforms = [
    { name: 'Facebook', icon: Facebook, followers: '3.2K', engagement: '4.5%', color: 'blue' },
    { name: 'Instagram', icon: Instagram, followers: '5.1K', engagement: '6.2%', color: 'pink' },
    { name: 'Twitter', icon: Twitter, followers: '1.8K', engagement: '3.1%', color: 'sky' },
    { name: 'TikTok', icon: Video, followers: '12.5K', engagement: '8.7%', color: 'slate' },
    { name: 'YouTube', icon: Youtube, followers: '850', engagement: '5.8%', color: 'red' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Social Media Marketing</h2>
          <p className="text-gray-600 mt-1">Manage your social media presence</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus size={20} className="mr-2" />
          New Post
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {platforms.map((platform) => {
          const Icon = platform.icon;
          return (
            <div key={platform.name} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <Icon size={24} className={`text-${platform.color}-500`} />
                <span className="text-xs font-medium text-gray-500">Connected</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{platform.name}</h3>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Followers</span>
                  <span className="font-semibold">{platform.followers}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Engagement</span>
                  <span className="font-semibold">{platform.engagement}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Posts</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {loading ? (
            <div className="p-6 text-center text-gray-500">Loading...</div>
          ) : posts.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No posts found</div>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {post.platform}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        post.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {post.status}
                      </span>
                    </div>
                    <p className="text-gray-900 mb-2">{post.post_text?.substring(0, 150)}...</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Reach: {post.reach || 0}</span>
                      <span>Likes: {post.likes || 0}</span>
                      <span>Comments: {post.comments || 0}</span>
                      <span>Shares: {post.shares || 0}</span>
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    <p className="text-sm text-gray-500">
                      {post.published_time ? new Date(post.published_time).toLocaleDateString() : 'Scheduled'}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <NewPostModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={fetchPosts}
      />
    </div>
  );
}
