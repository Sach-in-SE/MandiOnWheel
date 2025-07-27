import React, { createContext, useContext, useState, useEffect } from 'react'

export type User = {
  id: string
  phone: string
  role: 'vendor' | 'supplier'
  name: string
  created_at: string
}

export type Product = {
  id: string
  name: string
  price: number
  stock: number
  image_url: string
  supplier_id: string
  supplier_name: string
  supplier_phone: string
  created_at: string
}

export type CartItem = {
  product: Product
  quantity: number
}

export type Order = {
  id: string
  product_id: string
  vendor_id: string
  vendor_phone: string
  supplier_id: string
  supplier_phone: string
  quantity: number
  total_amount: number
  status: 'Pending' | 'Out for Delivery' | 'Delivered'
  order_time: string
  estimated_delivery: string
  created_at: string
  product_name: string
  product_image: string
  vendor_name: string
  supplier_name: string
}

interface AuthContextType {
  user: User | null
  login: (phone: string, pin: string) => Promise<{ success: boolean; message: string }>
  register: (phone: string, pin: string, confirmPin: string, role: 'vendor' | 'supplier', name: string) => Promise<{ success: boolean; message: string }>
  logout: () => void
  loading: boolean
  cart: CartItem[]
  addToCart: (product: Product, quantity: number) => void
  removeFromCart: (productId: string) => void
  updateCartQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getCartTotal: () => number
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const hashPin = async (pin: string, phone: string): Promise<string> => {
  const encoder = new TextEncoder()
  const data = encoder.encode(pin + phone)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState<CartItem[]>([])

  useEffect(() => {
    const storedUser = localStorage.getItem('mandi_user')
    if (storedUser) {
      const userData = JSON.parse(storedUser)
      setUser(userData)
      // Load cart for this user
      const storedCart = localStorage.getItem(`mandi_cart_${userData.id}`)
      if (storedCart) {
        setCart(JSON.parse(storedCart))
      }
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    // Save cart to localStorage whenever it changes
    if (user) {
      localStorage.setItem(`mandi_cart_${user.id}`, JSON.stringify(cart))
    }
  }, [cart, user])

  const login = async (phone: string, pin: string): Promise<{ success: boolean; message: string }> => {
    try {
      const existingUsers = JSON.parse(localStorage.getItem('mandi_users') || '[]')
      const hashedPin = await hashPin(pin, phone)
      
      const user = existingUsers.find((u: any) => u.phone === phone && u.pin_hash === hashedPin)

      if (!user) {
        return { success: false, message: 'Invalid phone number or PIN' }
      }

      const userData: User = {
        id: user.id,
        phone: user.phone,
        role: user.role,
        name: user.name,
        created_at: user.created_at
      }

      setUser(userData)
      localStorage.setItem('mandi_user', JSON.stringify(userData))
      
      // Load cart for this user
      const storedCart = localStorage.getItem(`mandi_cart_${userData.id}`)
      if (storedCart) {
        setCart(JSON.parse(storedCart))
      }
      
      return { success: true, message: 'Login successful' }
    } catch (error) {
      return { success: false, message: 'Login failed. Please try again.' }
    }
  }

  const register = async (phone: string, pin: string, confirmPin: string, role: 'vendor' | 'supplier', name: string): Promise<{ success: boolean; message: string }> => {
    try {
      if (pin !== confirmPin) {
        return { success: false, message: 'PINs do not match' }
      }

      const existingUsers = JSON.parse(localStorage.getItem('mandi_users') || '[]')
      
      const existingUser = existingUsers.find((u: any) => u.phone === phone)

      if (existingUser) {
        return { success: false, message: 'Phone number already registered' }
      }

      const hashedPin = await hashPin(pin, phone)
      
      const newUser = {
        id: Date.now().toString(),
        phone,
        pin_hash: hashedPin,
        role,
        name,
        created_at: new Date().toISOString()
      }
      
      existingUsers.push(newUser)
      localStorage.setItem('mandi_users', JSON.stringify(existingUsers))

      const userData: User = {
        id: newUser.id,
        phone: newUser.phone,
        role: newUser.role,
        name: newUser.name,
        created_at: newUser.created_at
      }

      setUser(userData)
      localStorage.setItem('mandi_user', JSON.stringify(userData))
      return { success: true, message: 'Registration successful' }
    } catch (error) {
      return { success: false, message: 'Registration failed. Please try again.' }
    }
  }

  const logout = () => {
    if (user) {
      localStorage.removeItem(`mandi_cart_${user.id}`)
    }
    setUser(null)
    setCart([])
    localStorage.removeItem('mandi_user')
  }

  const addToCart = (product: Product, quantity: number) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id)
      if (existingItem) {
        return prevCart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock) }
            : item
        )
      } else {
        return [...prevCart, { product, quantity: Math.min(quantity, product.stock) }]
      }
    })
  }

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId))
  }

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }
    
    setCart(prevCart =>
      prevCart.map(item =>
        item.product.id === productId
          ? { ...item, quantity: Math.min(quantity, item.product.stock) }
          : item
      )
    )
  }

  const clearCart = () => {
    setCart([])
  }

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0)
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      logout, 
      loading,
      cart,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      getCartTotal
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}