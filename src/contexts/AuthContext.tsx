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
  description: string
  price: number
  quantity: number
  image_url: string
  supplier_id: string
  supplier_name: string
  created_at: string
}

export type Order = {
  id: string
  product_id: string
  vendor_id: string
  supplier_id: string
  quantity: number
  total_amount: number
  status: 'pending' | 'confirmed' | 'delivered'
  created_at: string
  product_name: string
  vendor_name: string
  supplier_name: string
}

interface AuthContextType {
  user: User | null
  login: (phone: string, pin: string) => Promise<{ success: boolean; message: string }>
  register: (phone: string, pin: string, role: 'vendor' | 'supplier', name: string) => Promise<{ success: boolean; message: string }>
  logout: () => void
  resetPin: (phone: string, newPin: string) => Promise<{ success: boolean; message: string }>
  loading: boolean
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

  useEffect(() => {
    const storedUser = localStorage.getItem('mandi_user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = async (phone: string, pin: string): Promise<{ success: boolean; message: string }> => {
    try {
      // Get users from localStorage
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
      return { success: true, message: 'Login successful' }
    } catch (error) {
      return { success: false, message: 'Login failed. Please try again.' }
    }
  }

  const register = async (phone: string, pin: string, role: 'vendor' | 'supplier', name: string): Promise<{ success: boolean; message: string }> => {
    try {
      // Get existing users from localStorage
      const existingUsers = JSON.parse(localStorage.getItem('mandi_users') || '[]')
      
      // Check if user already exists
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
      
      // Save to localStorage
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

  const resetPin = async (phone: string, newPin: string): Promise<{ success: boolean; message: string }> => {
    try {
      // Get users from localStorage
      const existingUsers = JSON.parse(localStorage.getItem('mandi_users') || '[]')
      const hashedPin = await hashPin(newPin, phone)
      
      const userIndex = existingUsers.findIndex((u: any) => u.phone === phone)

      if (userIndex === -1) {
        return { success: false, message: 'PIN reset failed. Please try again.' }
      }

      // Update PIN
      existingUsers[userIndex].pin_hash = hashedPin
      localStorage.setItem('mandi_users', JSON.stringify(existingUsers))

      return { success: true, message: 'PIN reset successful. Please login with your new PIN.' }
    } catch (error) {
      return { success: false, message: 'PIN reset failed. Please try again.' }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('mandi_user')
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, resetPin, loading }}>
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