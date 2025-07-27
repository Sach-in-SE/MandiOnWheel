import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Phone, Lock, User, Briefcase } from 'lucide-react'

const LoginForm: React.FC = () => {
  const { login, register } = useAuth()
  const [step, setStep] = useState<'phone' | 'existing-pin' | 'new-user-details' | 'new-user-pin'>('phone')
  const [phone, setPhone] = useState('')
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<'vendor' | 'supplier'>('vendor')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const checkPhoneExists = () => {
    const existingUsers = JSON.parse(localStorage.getItem('mandi_users') || '[]')
    return existingUsers.some((u: any) => u.phone === phone)
  }

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (phone.length !== 10) {
      setMessage('Please enter a valid 10-digit phone number')
      return
    }

    const phoneExists = checkPhoneExists()
    if (phoneExists) {
      setStep('existing-pin')
    } else {
      setStep('new-user-details')
    }
    setMessage('')
  }

  const handleExistingUserLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (pin.length !== 4) {
      setMessage('PIN must be 4 digits')
      return
    }

    setLoading(true)
    const result = await login(phone, pin)
    setMessage(result.message)
    setLoading(false)

    if (!result.success) {
      setPin('')
    }
  }

  const handleNewUserDetails = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setMessage('Please enter your name')
      return
    }
    setStep('new-user-pin')
    setMessage('')
  }

  const handleNewUserRegistration = async (e: React.FormEvent) => {
    e.preventDefault()
    if (pin.length !== 4) {
      setMessage('PIN must be 4 digits')
      return
    }
    if (confirmPin.length !== 4) {
      setMessage('Please confirm your PIN')
      return
    }

    setLoading(true)
    const result = await register(phone, pin, confirmPin, role, name.trim())
    setMessage(result.message)
    setLoading(false)

    if (!result.success) {
      setPin('')
      setConfirmPin('')
    }
  }

  const resetForm = () => {
    setStep('phone')
    setPhone('')
    setPin('')
    setConfirmPin('')
    setName('')
    setRole('vendor')
    setMessage('')
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

        {step === 'phone' && (
          <form onSubmit={handlePhoneSubmit} className="space-y-6">
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

            {message && (
              <div className="p-3 rounded-lg text-sm bg-red-100 text-red-700">
                {message}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Continue
            </button>
          </form>
        )}

        {step === 'existing-pin' && (
          <form onSubmit={handleExistingUserLogin} className="space-y-6">
            <div className="text-center mb-4">
              <p className="text-gray-600">Welcome back! Enter your PIN to login</p>
              <p className="text-sm text-gray-500 mt-1">Phone: {phone}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter your PIN
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
              {loading ? 'Logging in...' : 'Login'}
            </button>

            <button
              type="button"
              onClick={resetForm}
              className="w-full text-gray-600 hover:text-gray-800 font-medium"
            >
              Use different phone number
            </button>
          </form>
        )}

        {step === 'new-user-details' && (
          <form onSubmit={handleNewUserDetails} className="space-y-6">
            <div className="text-center mb-4">
              <p className="text-gray-600">New user! Let's set up your account</p>
              <p className="text-sm text-gray-500 mt-1">Phone: {phone}</p>
            </div>

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

            {message && (
              <div className="p-3 rounded-lg text-sm bg-red-100 text-red-700">
                {message}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Continue
            </button>

            <button
              type="button"
              onClick={resetForm}
              className="w-full text-gray-600 hover:text-gray-800 font-medium"
            >
              Use different phone number
            </button>
          </form>
        )}

        {step === 'new-user-pin' && (
          <form onSubmit={handleNewUserRegistration} className="space-y-6">
            <div className="text-center mb-4">
              <p className="text-gray-600">Create your 4-digit PIN</p>
              <p className="text-sm text-gray-500 mt-1">Name: {name} | Role: {role}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Create PIN
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm PIN
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
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>

            <button
              type="button"
              onClick={() => setStep('new-user-details')}
              className="w-full text-gray-600 hover:text-gray-800 font-medium"
            >
              Back to details
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default LoginForm