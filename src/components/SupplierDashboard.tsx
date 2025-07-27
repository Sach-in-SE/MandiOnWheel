import React, { useState, useEffect } from 'react'
import { useAuth, Product, Order } from '../contexts/AuthContext'
import { Package, ShoppingBag, LogOut, RefreshCw, Plus, Edit, Trash2 } from 'lucide-react'

const SupplierDashboard: React.FC = () => {
  const { user, logout } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products')
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
    image_url: ''
  })

  useEffect(() => {
    fetchProducts()
    fetchOrders()
  }, [])

  const fetchProducts = async () => {
    try {
      // Get products from localStorage
      const allProducts = JSON.parse(localStorage.getItem('mandi_products') || '[]')
      const userProducts = allProducts
        .filter((product: Product) => product.supplier_id === user?.id)
        .sort((a: Product, b: Product) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      
      setProducts(userProducts)
    } catch (error) {
      setMessage('Failed to load products')
    }
  }

  const fetchOrders = async () => {
    try {
      // Get orders from localStorage
      const allOrders = JSON.parse(localStorage.getItem('mandi_orders') || '[]')
      const products = JSON.parse(localStorage.getItem('mandi_products') || '[]')
      const users = JSON.parse(localStorage.getItem('mandi_users') || '[]')
      
      const supplierOrders = allOrders
        .filter((order: Order) => order.supplier_id === user?.id)
        .map((order: Order) => {
          const product = products.find((p: Product) => p.id === order.product_id)
          const vendor = users.find((u: any) => u.id === order.vendor_id)
          return {
            ...order,
            product_name: product?.name || 'Unknown Product',
            vendor_name: vendor?.name || 'Unknown Vendor'
          }
        })
        .sort((a: Order, b: Order) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

      setOrders(supplierOrders)
    } catch (error) {
      setMessage('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const addProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!productForm.name || !productForm.price || !productForm.quantity) {
      setMessage('Please fill in all required fields')
      return
    }

    try {
      // Create new product
      const newProduct = {
        id: Date.now().toString(),
        name: productForm.name,
        description: productForm.description,
        price: parseFloat(productForm.price),
        quantity: parseInt(productForm.quantity),
        image_url: productForm.image_url || 'https://images.pexels.com/photos/264537/pexels-photo-264537.jpeg',
        supplier_id: user?.id || '',
        supplier_name: user?.name || '',
        created_at: new Date().toISOString()
      }
      
      // Save to localStorage
      const allProducts = JSON.parse(localStorage.getItem('mandi_products') || '[]')
      allProducts.push(newProduct)
      localStorage.setItem('mandi_products', JSON.stringify(allProducts))

      setMessage('Product added successfully!')
      setProductForm({ name: '', description: '', price: '', quantity: '', image_url: '' })
      setShowAddProduct(false)
      fetchProducts()
    } catch (error) {
      setMessage('Failed to add product. Please try again.')
    }
  }

  const deleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      // Remove product from localStorage
      const allProducts = JSON.parse(localStorage.getItem('mandi_products') || '[]')
      const updatedProducts = allProducts.filter((product: Product) => product.id !== productId)
      localStorage.setItem('mandi_products', JSON.stringify(updatedProducts))

      setMessage('Product deleted successfully!')
      fetchProducts()
    } catch (error) {
      setMessage('Failed to delete product. Please try again.')
    }
  }

  const updateOrderStatus = async (orderId: string, status: 'confirmed' | 'delivered') => {
    try {
      // Update order status in localStorage
      const allOrders = JSON.parse(localStorage.getItem('mandi_orders') || '[]')
      const orderIndex = allOrders.findIndex((order: Order) => order.id === orderId)
      
      if (orderIndex !== -1) {
        allOrders[orderIndex].status = status
        localStorage.setItem('mandi_orders', JSON.stringify(allOrders))
      }

      setMessage(`Order ${status} successfully!`)
      fetchOrders()
    } catch (error) {
      setMessage('Failed to update order status. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto mb-4" size={48} />
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Welcome, {user?.name}</h1>
              <p className="text-gray-600">Supplier Dashboard</p>
            </div>
            <button
              onClick={logout}
              className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex space-x-1 mb-6 bg-white rounded-lg p-1 shadow-sm">
          <button
            onClick={() => setActiveTab('products')}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-colors ${
              activeTab === 'products'
                ? 'bg-green-600 text-white'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Package size={20} />
            <span>My Products ({products.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-colors ${
              activeTab === 'orders'
                ? 'bg-green-600 text-white'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <ShoppingBag size={20} />
            <span>Orders ({orders.length})</span>
          </button>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes('successful') 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {message}
          </div>
        )}

        {activeTab === 'products' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">My Products</h2>
              <button
                onClick={() => setShowAddProduct(!showAddProduct)}
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus size={20} />
                <span>{showAddProduct ? 'Cancel' : 'Add Product'}</span>
              </button>
            </div>

            {showAddProduct && (
              <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Product</h3>
                <form onSubmit={addProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      value={productForm.name}
                      onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="e.g., Fresh Tomatoes"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price per kg (₹) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={productForm.price}
                      onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="e.g., 50"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity Available (kg) *
                    </label>
                    <input
                      type="number"
                      value={productForm.quantity}
                      onChange={(e) => setProductForm(prev => ({ ...prev, quantity: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="e.g., 100"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image URL
                    </label>
                    <input
                      type="url"
                      value={productForm.image_url}
                      onChange={(e) => setProductForm(prev => ({ ...prev, image_url: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={productForm.description}
                      onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      rows={3}
                      placeholder="Describe your product..."
                    />
                  </div>

                  <div className="md:col-span-2">
                    <button
                      type="submit"
                      className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                    >
                      Add Product
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product.id} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-t-xl"
                  />
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{product.name}</h3>
                    <p className="text-gray-600 mb-3 text-sm">{product.description}</p>
                    
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <div className="text-2xl font-bold text-green-600">₹{product.price}/kg</div>
                        <div className="text-sm text-gray-600">Stock: {product.quantity} kg</div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => deleteProduct(product.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    <div className="text-sm text-gray-500">
                      Added {new Date(product.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {products.length === 0 && !showAddProduct && (
              <div className="bg-white rounded-xl p-8 text-center">
                <Package size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No products yet</h3>
                <p className="text-gray-500 mb-4">Start by adding your first product to sell</p>
                <button
                  onClick={() => setShowAddProduct(true)}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Add Your First Product
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center">
                <ShoppingBag size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No orders yet</h3>
                <p className="text-gray-500">Orders from vendors will appear here</p>
              </div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="bg-white rounded-xl shadow-sm border p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{order.product_name}</h3>
                      <p className="text-gray-600">Vendor: {order.vendor_name}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                    <div>
                      <span className="text-gray-600">Quantity:</span>
                      <div className="font-semibold">{order.quantity} kg</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Total Amount:</span>
                      <div className="font-semibold text-green-600">₹{order.total_amount}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Order Date:</span>
                      <div className="font-semibold">{new Date(order.created_at).toLocaleDateString()}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Order Time:</span>
                      <div className="font-semibold">{new Date(order.created_at).toLocaleTimeString()}</div>
                    </div>
                  </div>

                  {order.status === 'pending' && (
                    <div className="flex space-x-3">
                      <button
                        onClick={() => updateOrderStatus(order.id, 'confirmed')}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Confirm Order
                      </button>
                      <button
                        onClick={() => updateOrderStatus(order.id, 'delivered')}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Mark as Delivered
                      </button>
                    </div>
                  )}

                  {order.status === 'confirmed' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'delivered')}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Mark as Delivered
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default SupplierDashboard