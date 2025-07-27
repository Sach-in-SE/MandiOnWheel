import React, { useState, useEffect } from 'react'
import { useAuth, Product, Order } from '../contexts/AuthContext'
import { Package, ShoppingBag, LogOut, Plus, Trash2, Upload, Image as ImageIcon } from 'lucide-react'

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
    price: '',
    stock: '',
    image: null as File | null
  })

  useEffect(() => {
    fetchProducts()
    fetchOrders()
  }, [])

  const fetchProducts = async () => {
    try {
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
            product_image: product?.image_url || '',
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setMessage('Image size should be less than 5MB')
        return
      }
      if (!file.type.startsWith('image/')) {
        setMessage('Please select a valid image file')
        return
      }
      setProductForm(prev => ({ ...prev, image: file }))
    }
  }

  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const addProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!productForm.name || !productForm.price || !productForm.stock) {
      setMessage('Please fill in all required fields')
      return
    }

    if (!productForm.image) {
      setMessage('Please upload a product image')
      return
    }

    try {
      // Convert image to base64 for storage
      const imageBase64 = await convertImageToBase64(productForm.image)
      
      const newProduct = {
        id: Date.now().toString(),
        name: productForm.name,
        price: parseFloat(productForm.price),
        stock: parseInt(productForm.stock),
        image_url: imageBase64,
        supplier_id: user?.id || '',
        supplier_name: user?.name || '',
        supplier_phone: user?.phone || '',
        created_at: new Date().toISOString()
      }
      
      const allProducts = JSON.parse(localStorage.getItem('mandi_products') || '[]')
      allProducts.push(newProduct)
      localStorage.setItem('mandi_products', JSON.stringify(allProducts))

      setMessage('Product added successfully!')
      setProductForm({ name: '', price: '', stock: '', image: null })
      setShowAddProduct(false)
      fetchProducts()
    } catch (error) {
      setMessage('Failed to add product. Please try again.')
    }
  }

  const deleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const allProducts = JSON.parse(localStorage.getItem('mandi_products') || '[]')
      const updatedProducts = allProducts.filter((product: Product) => product.id !== productId)
      localStorage.setItem('mandi_products', JSON.stringify(updatedProducts))

      setMessage('Product deleted successfully!')
      fetchProducts()
    } catch (error) {
      setMessage('Failed to delete product. Please try again.')
    }
  }

  const updateOrderStatus = async (orderId: string, status: 'Out for Delivery' | 'Delivered') => {
    try {
      const allOrders = JSON.parse(localStorage.getItem('mandi_orders') || '[]')
      const orderIndex = allOrders.findIndex((order: Order) => order.id === orderId)
      
      if (orderIndex !== -1) {
        allOrders[orderIndex].status = status
        localStorage.setItem('mandi_orders', JSON.stringify(allOrders))
      }

      setMessage(`Order marked as ${status.toLowerCase()}!`)
      fetchOrders()
    } catch (error) {
      setMessage('Failed to update order status. Please try again.')
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
                <form onSubmit={addProduct} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        Price per unit (₹) *
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
                        Stock Available (units) *
                      </label>
                      <input
                        type="number"
                        value={productForm.stock}
                        onChange={(e) => setProductForm(prev => ({ ...prev, stock: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="e.g., 100"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Image *
                      </label>
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="image-upload"
                          required
                        />
                        <label
                          htmlFor="image-upload"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer flex items-center space-x-2 hover:bg-gray-50 transition-colors"
                        >
                          <Upload size={20} className="text-gray-400" />
                          <span className="text-gray-600">
                            {productForm.image ? productForm.image.name : 'Choose image file'}
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {productForm.image && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                      <img
                        src={URL.createObjectURL(productForm.image)}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-lg border"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                  >
                    Add Product
                  </button>
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
                    
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <div className="text-2xl font-bold text-green-600">₹{product.price}/unit</div>
                        <div className="text-sm text-gray-600">Stock: {product.stock} units</div>
                      </div>
                      <button
                        onClick={() => deleteProduct(product.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
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
                          <p className="text-gray-600">Vendor: {order.vendor_name}</p>
                          <p className="text-sm text-gray-500">Phone: {order.vendor_phone}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'Out for Delivery' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {order.status}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                        <div>
                          <span className="text-gray-600">Quantity:</span>
                          <div className="font-semibold">{order.quantity} units</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Total Amount:</span>
                          <div className="font-semibold text-green-600">₹{order.total_amount}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Delivery Date:</span>
                          <div className="font-semibold">{new Date(order.delivery_date).toLocaleDateString()}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Order Date:</span>
                          <div className="font-semibold">{new Date(order.created_at).toLocaleDateString()}</div>
                        </div>
                      </div>

                      {order.status === 'Pending' && (
                        <div className="flex space-x-3">
                          <button
                            onClick={() => updateOrderStatus(order.id, 'Out for Delivery')}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Mark Out for Delivery
                          </button>
                          <button
                            onClick={() => updateOrderStatus(order.id, 'Delivered')}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Mark as Delivered
                          </button>
                        </div>
                      )}

                      {order.status === 'Out for Delivery' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'Delivered')}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Mark as Delivered
                        </button>
                      )}
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

export default SupplierDashboard