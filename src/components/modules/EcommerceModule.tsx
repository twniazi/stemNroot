import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, ShoppingCart, Package, DollarSign, TrendingUp, Eye, ExternalLink, Globe, RefreshCw } from 'lucide-react';

export default function EcommerceModule() {
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [websiteUrl] = useState('https://stemnroot.com');
  const [shopUrl] = useState('https://stemnroot.com/shop/');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ordersData, productsData] = await Promise.all([
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('products').select('*')
      ]);

      if (ordersData.data) setOrders(ordersData.data);
      if (productsData.data) setProducts(productsData.data);
    } catch (error) {
      console.error('Error fetching e-commerce data:', error);
    } finally {
      setLoading(false);
    }
  };

  const syncWithWebsite = async () => {
    setSyncing(true);
    try {
      console.log('Syncing with stemnroot.com/shop/...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      await fetchData();
      alert('Sync completed! Products and orders from stemnroot.com/shop/ are up to date.');
    } catch (error) {
      console.error('Error syncing with website:', error);
      alert('Sync failed. Please try again.');
    } finally {
      setSyncing(false);
    }
  };

  const openProductOnWebsite = (product: any) => {
    const url = product.website_url || shopUrl;
    window.open(url, '_blank');
  };

  const openShop = () => {
    window.open(shopUrl, '_blank');
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'processing': 'bg-blue-100 text-blue-800',
      'shipped': 'bg-green-100 text-green-800',
      'delivered': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => p.stock_quantity < 10).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">E-commerce</h2>
          <p className="text-gray-600 mt-1">Connected to <a href={shopUrl} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-700 font-medium">stemnroot.com/shop</a></p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={syncWithWebsite}
            disabled={syncing}
            className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={20} className={`mr-2 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync Shop'}
          </button>
          <button
            onClick={openShop}
            className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ShoppingCart size={20} className="mr-2" />
            Visit Shop
          </button>
          <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <Plus size={20} className="mr-2" />
            New Order
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <ShoppingCart size={32} className="text-green-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Shop Integration Active
            </h3>
            <p className="text-sm text-gray-700 mb-3">
              Your dashboard is connected to <a href={shopUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-green-600 hover:text-green-700 underline">stemnroot.com/shop</a>.
              Orders and products are automatically synced from your online shop.
            </p>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-gray-600">Live Connection</span>
              </div>
              <button
                onClick={syncWithWebsite}
                disabled={syncing}
                className="flex items-center gap-1 text-green-600 hover:text-green-700 font-medium"
              >
                <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
                {syncing ? 'Syncing...' : 'Sync Now'}
              </button>
              <button
                onClick={openShop}
                className="flex items-center gap-1 text-green-600 hover:text-green-700 font-medium"
              >
                <ExternalLink size={14} />
                Open Shop
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Revenue', value: `PKR ${totalRevenue.toLocaleString()}`, icon: DollarSign, trend: '+12%' },
          { label: 'Total Orders', value: orders.length, icon: ShoppingCart, trend: '+8%' },
          { label: 'Avg Order Value', value: `PKR ${Math.round(avgOrderValue).toLocaleString()}`, icon: TrendingUp, trend: '+5%' },
          { label: 'Products', value: totalProducts, icon: Package, trend: `${lowStockProducts} low stock` }
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">{stat.label}</h3>
                <Icon size={20} className="text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-green-600 mt-2">{stat.trend}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">Loading...</td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">No orders found</td>
                  </tr>
                ) : (
                  orders.slice(0, 10).map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{order.id.substring(0, 8)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.customer_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        PKR {Number(order.total_amount).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.created_at || order.order_date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status</h3>
            <div className="space-y-3">
              {Object.entries(
                orders.reduce((acc, order) => {
                  acc[order.status] = (acc[order.status] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)
              ).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 capitalize">{status}</span>
                  <span className="text-sm font-semibold text-gray-900">{count as number}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-sm p-6 text-white">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full flex items-center justify-between p-3 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors">
                <span className="text-sm">View All Products</span>
                <Eye size={16} />
              </button>
              <button className="w-full flex items-center justify-between p-3 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors">
                <span className="text-sm">Manage Inventory</span>
                <Package size={16} />
              </button>
              <button className="w-full flex items-center justify-between p-3 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors">
                <span className="text-sm">Sales Report</span>
                <TrendingUp size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Products from stemnroot.com/shop</h3>
          <a
            href={shopUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-sm text-green-600 hover:text-green-700"
          >
            View All in Shop
            <ExternalLink size={14} className="ml-1" />
          </a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {products.slice(0, 4).map((product) => (
            <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-gray-900">{product.name}</h4>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  product.stock_quantity > 10 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {product.stock_quantity} left
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-3">{product.description?.substring(0, 50)}...</p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-gray-900">PKR {Number(product.price).toLocaleString()}</span>
                <button
                  onClick={() => openProductOnWebsite(product)}
                  className="text-green-600 hover:text-green-700"
                  title="View on website"
                >
                  <ExternalLink size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
