# MandiOnWheels 🥬

A role-based vegetable ordering platform connecting Indian street food vendors with local suppliers.

## 🌟 Features

### 🔐 Authentication
- Phone-based login with custom 4-digit PIN
- No OTP required - users create their own secure PIN
- Role-based access (Vendor/Supplier)

### 👥 User Roles

#### 🛒 Vendors (Buyers)
- Browse available products with images and pricing
- Add products to cart or buy instantly
- Track order status and delivery times
- Contact suppliers directly via phone

#### 📦 Suppliers (Sellers)
- Add products with image upload
- Manage inventory and pricing
- View and manage incoming orders
- Update order status (Pending → Out for Delivery → Delivered)

### 🎯 Key Features
- **Mobile-first design** optimized for smartphones
- **Real-time inventory management** with stock tracking
- **Delivery time estimation** (2-3 hours from order)
- **Secure data storage** with encrypted PINs
- **Image upload support** for product listings
- **Complete order lifecycle** management

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd mandi-on-wheels
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory, ready for deployment.

## 🏗️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **Build Tool**: Vite
- **Storage**: LocalStorage (production-ready for demo)

## 📱 Usage

### For Vendors:
1. Register with phone number and create a PIN
2. Select "Vendor" role during registration
3. Browse products, add to cart, or buy instantly
4. Track your orders and contact suppliers

### For Suppliers:
1. Register with phone number and create a PIN
2. Select "Supplier" role during registration
3. Add products with images and pricing
4. Manage incoming orders and update delivery status

## 🔒 Security Features

- PIN-based authentication with SHA-256 hashing
- Role-based access control
- Input validation and sanitization
- Error boundary for graceful error handling
- Secure local storage implementation

## 🌐 Deployment

This project is optimized for deployment on:
- Netlify (recommended)
- Vercel
- Any static hosting service

The build includes:
- Optimized bundle splitting
- PWA manifest
- SEO meta tags
- Security headers
- SPA routing configuration

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Built with ❤️ for Indian street food vendors and suppliers.