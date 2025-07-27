import React, { useState, useEffect } from 'react'
import { useAuth, Product, Order } from '../contexts/AuthContext'
import { ShoppingCart, Package, LogOut, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react'

const VendorDashboard: React.FC = () => {
  const { user, logout, cart, addToCart, removeFromCart, updateCartQuantity, clearCart, getCartTotal } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [activeTab, setActiveTab] = useState<'products' | 'cart' | 'orders'>('products')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [buyNowQuantities, setBuyNowQuantities] = useState<{ [key: string]: number }>({})

  useEffect(() => {
    fetchProducts()
    fetchOrders()
  }, [])

  const fetchProducts = async () => {
    try {
      const allProducts = JSON.parse(localStorage.getItem('mandi_products') || '[]')
      const users = JSON.parse(localStorage.getItem('mandi_users') || '[]')
      
      const availableProducts = allProducts
        .filter((product: Product) => product.stock > 0)
        .map((product: Product) => {
          const supplier = users.find((u: any) => u.id === product.supplier_id)
          return {
            ...product,
            supplier_name: supplier?.name || 'Unknown Supplier',
            supplier_phone: supplier?.phone || ''
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
            product_image: product?.image_url || '',
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

  const updateBuyNowQuantity = (productId: string, change: number) => {
    setBuyNowQuantities(prev => ({
      ...prev,
      [productId]: Math.max(1, (prev[productId] || 1) + change)
    }))
  }

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1)
    setMessage(`${product.name} added to cart!`)
    setTimeout(() => setMessage(''), 3000)
  }

  const handleBuyNow = async (product: Product) => {
    const quantity = buyNowQuantities[product.id] || 1
    
    if (quantity > product.stock) {
      setMessage('Not enough stock available')
      return
    }

    await placeOrder([{ product, quantity }])
  }

  const handleCartCheckout = async () => {
    if (cart.length === 0) {
      setMessage('Your cart is empty')
      return
    }

    // Check stock availability
    for (const item of cart) {
      const currentProduct = products.find(p => p.id === item.product.id)
      if (!currentProduct || item.quantity > currentProduct.stock) {
        setMessage(`Not enough stock for ${item.product.name}`)
        return
      }
    }

    await placeOrder(cart)
    clearCart()
  }

  const placeOrder = async (items: { product: Product; quantity: number }[]) => {
    try {
      const allOrders = JSON.parse(localStorage.getItem('mandi_orders') || '[]')
      const allProducts = JSON.parse(localStorage.getItem('mandi_products') || '[]')
      
      const now = new Date()
      const deliveryTime = new Date(now.getTime() + (2.5 * 60 * 60 * 1000)) // 2.5 hours from now
      
      for (const item of items) {
        const totalAmount = item.product.price * item.quantity

        const newOrder = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          product_id: item.product.id,
          vendor_id: user?.id,
          vendor_phone: user?.phone,
          supplier_id: item.product.supplier_id,
          supplier_phone: item.product.supplier_phone,
          quantity: item.quantity,
          total_amount: totalAmount,
          status: 'Pending' as const,
        order_time: now.toISOString(),
        estimated_delivery: deliveryTime.toISOString(),
          created_at: new Date().toISOString(),
          product_name: item.product.name,
          product_image: item.product.image_url,
          vendor_name: user?.name || '',
          supplier_name: item.product.supplier_name
        }
        
        allOrders.push(newOrder)
        
        // Update product stock
        const productIndex = allProducts.findIndex((p: Product) => p.id === item.product.id)
        if (productIndex !== -1) {
          allProducts[productIndex].stock -= item.quantity
        }
      }
      
      localStorage.setItem('mandi_orders', JSON.stringify(allOrders))
      localStorage.setItem('mandi_products', JSON.stringify(allProducts))

      const totalAmount = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
      setMessage(`Order placed successfully! Total: ₹${totalAmount}`)
      
      setBuyNowQuantities({})
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
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
            <ShoppingBag size={20} />
            <span>Browse Products</span>
          </button>
          <button
            onClick={() => setActiveTab('cart')}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-colors ${
              activeTab === 'cart'
                ? 'bg-green-600 text-white'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <ShoppingCart size={20} />
            <span>Cart ({cart.length})</span>
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
            message.includes('successful') || message.includes('added')
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
                  
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <div className="text-2xl font-bold text-green-600">₹{product.price}/kg</div>
                      <div className="text-sm text-gray-600">Stock: {product.stock} kg</div>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div>by {product.supplier_name}</div>
                      <div className="text-xs text-blue-600">📞 {product.supplier_phone}</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock === 0}
                      className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add to Cart
                    </button>

                    <div className="border-t pt-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Buy Now:</span>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateBuyNowQuantity(product.id, -1)}
                            className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="w-12 text-center font-semibold">
                            {buyNowQuantities[product.id] || 1}
                          </span>
                          <button
                            onClick={() => updateBuyNowQuantity(product.id, 1)}
                            className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="text-sm text-gray-600 mb-2">
                        Total: ₹{product.price * (buyNowQuantities[product.id] || 1)} ({(buyNowQuantities[product.id] || 1)} kg)
                      </div>

                      <button
                        onClick={() => handleBuyNow(product)}
                        disabled={product.stock === 0}
                        className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {product.stock === 0 ? 'Out of Stock' : 'Buy Now'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'cart' && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Shopping Cart</h2>
            
            {cart.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Your cart is empty</h3>
                <p className="text-gray-500">Add some products to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <img
                      src={item.product.image_url}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{item.product.name}</h3>
                      <p className="text-gray-600">₹{item.product.price}/kg</p>
                      <p className="text-sm text-gray-500">by {item.product.supplier_name}</p>
                      <p className="text-xs text-blue-600">📞 {item.product.supplier_phone}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-12 text-center font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-600">₹{item.product.price * item.quantity} ({item.quantity} kg)</div>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-red-600 hover:text-red-700 mt-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xl font-semibold text-gray-800">Total: ₹{getCartTotal()}</span>
                    <button
                      onClick={clearCart}
                      className="text-red-600 hover:text-red-700 font-medium"
                    >
                      Clear Cart
                    </button>
                  </div>
                  <button
                    onClick={handleCartCheckout}
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                  >
                    Place Order
                  </button>
                </div>
              </div>
            )}
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
                  <div className="flex items-start space-x-4">
                    <img
                      src={order.product_image}
                      alt={order.product_name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">{order.product_name}</h3>
                          <p className="text-gray-600">Supplier: {order.supplier_name}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'Out for Delivery' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {order.status}
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
                          <span className="text-gray-600">Delivery By:</span>
                          <div className="font-semibold">{new Date(order.estimated_delivery).toLocaleString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true,
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Ordered At:</span>
                          <div className="font-semibold">{new Date(order.order_time).toLocaleString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true,
                            day: 'numeric',
                            month: 'short'
                          })}</div>
                        </div>
                      </div>
                      
                      <div className="mt-2 text-sm text-gray-600">
                        <span className="font-medium">Supplier:</span> {order.supplier_name}
                        <span className="ml-4 text-blue-600">📞 {order.supplier_phone}</span>
                      </div>
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