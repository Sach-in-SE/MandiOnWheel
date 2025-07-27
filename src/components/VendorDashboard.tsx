import React, { useState, useEffect } from 'react'
import { useAuth, Product, Order } from '../contexts/AuthContext'
import { ShoppingCart, Package, LogOut, RefreshCw, Plus, Minus } from 'lucide-react'

const VendorDashboard: React.FC = () => {
  const { user, logout } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [orderQuantities, setOrderQuantities] = useState<{ [key: string]: number }>({})

  useEffect(() => {
    fetchProducts()
    fetchOrders()
  }, [])

  const fetchProducts = async () => {
    try {
      // Get products from localStorage
      const allProducts = JSON.parse(localStorage.getItem('mandi_products') || '[]')
      const users = JSON.parse(localStorage.getItem('mandi_users') || '[]')
      
      const availableProducts = allProducts
        .filter((product: Product) => product.quantity > 0)
        .map((product: Product) => {
          const supplier = users.find((u: any) => u.id === product.supplier_id)
          return {
            ...product,
            supplier_name: supplier?.name || 'Unknown Supplier'
          }
        })
        .sort((a: Product, b: Product) => a.price - b.price)

      setProducts(availableProducts)
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
      
      const userOrders = allOrders
        .filter((order: Order) => order.vendor_id === user?.id)
        .map((order: Order) => {
          const product = products.find((p: Product) => p.id === order.product_id)
          const supplier = users.find((u: any) => u.id === order.supplier_id)
          return {
            ...order,
            product_name: product?.name || 'Unknown Product',
            supplier_name: supplier?.name || 'Unknown Supplier'
          }
        })
        .sort((a: Order, b: Order) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

      setOrders(userOrders)
    } catch (error) {
      setMessage('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = (productId: string, change: number) => {
    setOrderQuantities(prev => ({
      ...prev,
      [productId]: Math.max(0, (prev[productId] || 1) + change)
    }))
  }

  const placeOrder = async (product: Product) => {
    const quantity = orderQuantities[product.id] || 1
    
    if (quantity <= 0) {
      setMessage('Please select a valid quantity')
      return
    }

    if (quantity > product.quantity) {
      setMessage('Not enough stock available')
      return
    }

    try {
      const totalAmount = product.price * quantity

      // Create new order
      const newOrder = {
        id: Date.now().toString(),
        product_id: product.id,
        vendor_id: user?.id,
        supplier_id: product.supplier_id,
        quantity,
        total_amount: totalAmount,
        status: 'pending' as const,
        created_at: new Date().toISOString(),
        product_name: product.name,
        vendor_name: user?.name || '',
        supplier_name: product.supplier_name
      }
      
      // Save order to localStorage
      const allOrders = JSON.parse(localStorage.getItem('mandi_orders') || '[]')
      allOrders.push(newOrder)
      localStorage.setItem('mandi_orders', JSON.stringify(allOrders))
      
      // Update product quantity
      const allProducts = JSON.parse(localStorage.getItem('mandi_products') || '[]')
      const productIndex = allProducts.findIndex((p: Product) => p.id === product.id)
      if (productIndex !== -1) {
        allProducts[productIndex].quantity -= quantity
        localStorage.setItem('mandi_products', JSON.stringify(allProducts))
      }

      setMessage(`Order placed successfully! Total: ₹${totalAmount}`)
      setOrderQuantities(prev => ({ ...prev, [product.id]: 1 }))
      fetchProducts()
      fetchOrders()
    } catch (error) {
      setMessage('Failed to place order. Please try again.')
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
              <p className="text-gray-600">Vendor Dashboard</p>
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
            <ShoppingCart size={20} />
            <span>Browse Products</span>
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-colors ${
              activeTab === 'orders'
                ? 'bg-green-600 text-white'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Package size={20} />
            <span>My Orders ({orders.length})</span>
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
                    <div className="text-sm text-gray-600">
                      by {product.supplier_name}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-gray-700">Quantity (kg):</span>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => updateQuantity(product.id, -1)}
                        className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-12 text-center font-semibold">
                        {orderQuantities[product.id] || 1}
                      </span>
                      <button
                        onClick={() => updateQuantity(product.id, 1)}
                        className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600 mb-4">
                    Total: ₹{product.price * (orderQuantities[product.id] || 1)}
                  </div>

                  <button
                    onClick={() => placeOrder(product)}
                    disabled={product.quantity === 0}
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {product.quantity === 0 ? 'Out of Stock' : 'Place Order'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center">
                <Package size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No orders yet</h3>
                <p className="text-gray-500">Start browsing products to place your first order</p>
              </div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="bg-white rounded-xl shadow-sm border p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{order.product_name}</h3>
                      <p className="text-gray-600">Supplier: {order.supplier_name}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
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
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default VendorDashboard