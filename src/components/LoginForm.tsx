import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Phone, Lock, User, Briefcase } from 'lucide-react'

const LoginForm: React.FC = () => {
  const { login, register, resetPin } = useAuth()
  const [mode, setMode] = useState<'login' | 'register' | 'reset'>('login')
  const [phone, setPhone] = useState('')
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<'vendor' | 'supplier'>('vendor')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    if (phone.length !== 10) {
      setMessage('Please enter a valid 10-digit phone number')
      setLoading(false)
      return
    }

    if (pin.length !== 4) {
      setMessage('PIN must be 4 digits')
      setLoading(false)
      return
    }

    let result: { success: boolean; message: string }

    if (mode === 'login') {
      result = await login(phone, pin)
    } else if (mode === 'register') {
      if (!name.trim()) {
        setMessage('Please enter your name')
        setLoading(false)
        return
      }
      result = await register(phone, pin, role, name.trim())
    } else {
      if (pin !== confirmPin) {
        setMessage('PINs do not match')
        setLoading(false)
        return
      }
      result = await resetPin(phone, pin)
    }

    setMessage(result.message)
    setLoading(false)

    if (result.success && mode === 'reset') {
      setMode('login')
      setPin('')
      setConfirmPin('')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-green-600 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Briefcase size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">MandiOnWheels</h1>
          <p className="text-gray-600 mt-2">Fresh supplies for street food vendors</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="Enter 10-digit phone number"
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {mode === 'register' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  I am a
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setRole('vendor')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      role === 'vendor'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className="font-semibold">Vendor</div>
                      <div className="text-sm text-gray-600">Buy supplies</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('supplier')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      role === 'supplier'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className="font-semibold">Supplier</div>
                      <div className="text-sm text-gray-600">Sell supplies</div>
                    </div>
                  </button>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {mode === 'reset' ? 'New PIN' : 'PIN'}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="Enter 4-digit PIN"
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {mode === 'reset' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New PIN
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="Confirm 4-digit PIN"
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          )}

          {message && (
            <div className={`p-3 rounded-lg text-sm ${
              message.includes('successful') 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Please wait...' : 
             mode === 'login' ? 'Login' : 
             mode === 'register' ? 'Register' : 'Reset PIN'}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          {mode === 'login' && (
            <>
              <button
                onClick={() => setMode('register')}
                className="text-green-600 hover:text-green-700 font-medium"
              >
                New user? Register here
              </button>
              <br />
              <button
                onClick={() => setMode('reset')}
                className="text-orange-600 hover:text-orange-700 font-medium"
              >
                Forgot PIN? Reset here
              </button>
            </>
          )}
          {(mode === 'register' || mode === 'reset') && (
            <button
              onClick={() => setMode('login')}
              className="text-green-600 hover:text-green-700 font-medium"
            >
              Back to Login
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default LoginForm