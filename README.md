# SRIBEESonline Admin Dashboard

Modern admin dashboard for SRIBEESonline e-commerce platform built with React, TypeScript, and Ant Design.

## 🚀 Features

- ✅ **Authentication**: Secure login with JWT tokens
- ✅ **Dashboard**: Overview with key metrics and charts
- ✅ **Product Management**: View, add, edit, delete products
- ✅ **Order Management**: View and manage customer orders
- ✅ **Customer Management**: View customer details and history
- ✅ **Branch Management**: Multi-branch inventory and operations
- ✅ **RBAC**: Role-based access control for admins
- ✅ **Responsive Design**: Works on desktop, tablet, and mobile
- ✅ **Modern UI**: Built with Ant Design components

## 🛠️ Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite 7** - Build tool
- **Ant Design** - UI components
- **React Router** - Routing
- **TanStack Query** - Data fetching
- **Zustand** - State management
- **Axios** - HTTP client
- **Recharts** - Charts and graphs

## 📦 Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔐 Demo Credentials

```
Email: superadmin@sribeesonline.lk
Password: Admin@123
```

## 📁 Project Structure

```
admin/
├── src/
│   ├── api/              # API clients
│   ├── components/       # Reusable components
│   │   ├── layout/      # Layout components
│   │   ├── common/      # Common components
│   │   └── charts/      # Chart components
│   ├── pages/           # Page components
│   │   ├── Dashboard/
│   │   ├── Products/
│   │   ├── Orders/
│   │   ├── Customers/
│   │   └── Auth/
│   ├── hooks/           # Custom hooks
│   ├── store/           # Zustand stores
│   ├── types/           # TypeScript types
│   ├── utils/           # Utility functions
│   └── styles/          # Global styles
├── .env                 # Environment variables
└── package.json
```

## 🌐 Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_APP_NAME=SRIBEESonline Admin
```

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎨 Features Overview

### Dashboard
- Total revenue, orders, customers, products
- Recent orders table
- Sales charts (coming soon)

### Products
- Product list with search and filters
- Add/Edit/Delete products
- Stock management
- Category management

### Orders
- Order list with status filters
- Order details view
- Status updates
- Invoice generation

### Customers
- Customer list
- Customer details
- Order history
- Account management

## 🔗 API Integration

The admin dashboard connects to the SRIBEESonline backend API:

- Base URL: `http://localhost:3000/api/v1`
- Authentication: JWT Bearer tokens
- Endpoints: `/auth/login`, `/products`, `/orders`, `/customers`

## 📄 License

MIT

## 👥 Team

Built with ❤️ by the SRIBEESonline Team

---

**Version**: 1.0.0  
**Last Updated**: January 18, 2026
