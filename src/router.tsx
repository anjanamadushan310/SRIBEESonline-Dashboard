/**
 * FreshCart Admin Dashboard Router
 * Role-based routing with protected routes and branch isolation
 */

import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { AdminRole } from './types/admin.types';
import { Spin } from 'antd';

// Layout
import AdminLayout from './components/layout/AdminLayout';

// Auth Pages (eager load)
import Login from './pages/Auth/Login';

// Lazy load pages for better performance
const Dashboard = lazy(() => import('./pages/Dashboard/index.page'));
const AdminDashboard = lazy(() => import('./pages/Dashboard/AdminDashboard'));
const ManagerDashboard = lazy(() => import('./pages/Dashboard/ManagerDashboard'));
const StaffDashboard = lazy(() => import('./pages/Dashboard/StaffDashboard'));

// Products
const ProductList = lazy(() => import('./pages/Products/ProductList'));
const ProductForm = lazy(() => import('./pages/Products/ProductForm'));

// Orders
const OrderList = lazy(() => import('./pages/Orders/OrderList'));
const OrderDetail = lazy(() => import('./pages/Orders/OrderDetail'));

// Inventory
const BranchInventory = lazy(() => import('./pages/Inventory/BranchInventory'));
const StockTransfers = lazy(() => import('./pages/Inventory/StockTransfers'));
const LowStockReport = lazy(() => import('./pages/Inventory/LowStockReport'));

// Analytics
const Analytics = lazy(() => import('./pages/Analytics/Analytics'));
const WatchlistAnalytics = lazy(() => import('./pages/Analytics/WatchlistAnalytics'));
const BranchAnalytics = lazy(() => import('./pages/Analytics/BranchAnalytics'));

// Users & Branches (Super Admin only)
const AdminUserList = lazy(() => import('./pages/Users/AdminUserList'));
const AdminUserForm = lazy(() => import('./pages/Users/AdminUserForm'));
const BranchList = lazy(() => import('./pages/Branches/BranchList'));

// Customers
const CustomerList = lazy(() => import('./pages/Customers/CustomerList'));

// Settings
const Settings = lazy(() => import('./pages/Settings'));
const AppSettings = lazy(() => import('./pages/Settings/AppSettings'));

// Loading Spinner Component
const PageLoader: React.FC = () => (
    <Spin size="large" tip="Loading..." fullscreen />
);

// Protected Route Component - handles hydration from localStorage
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const storeIsAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const [isHydrated, setIsHydrated] = React.useState(() => {
        // Check immediately if already hydrated
        return useAuthStore.persist?.hasHydrated?.() ?? true;
    });

    React.useEffect(() => {
        // If not hydrated yet, wait for it
        if (!isHydrated && useAuthStore.persist?.onFinishHydration) {
            const unsubscribe = useAuthStore.persist.onFinishHydration(() => {
                setIsHydrated(true);
            });
            return unsubscribe;
        }
    }, [isHydrated]);

    // Show loading while hydrating
    if (!isHydrated) {
        return <PageLoader />;
    }

    // Also check localStorage directly as a fallback
    const hasStoredAuth = localStorage.getItem('admin-auth-storage');
    const isAuthenticated = storeIsAuthenticated || (hasStoredAuth && JSON.parse(hasStoredAuth)?.state?.isAuthenticated);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};

// Role-based Route Component
interface RoleRouteProps {
    children: React.ReactNode;
    allowedRoles: AdminRole[];
    fallbackPath?: string;
}

const RoleRoute: React.FC<RoleRouteProps> = ({ 
    children, 
    allowedRoles, 
    fallbackPath = '/' 
}) => {
    const user = useAuthStore((state) => state.user);

    if (!user || !allowedRoles.includes(user.role)) {
        return <Navigate to={fallbackPath} replace />;
    }

    return <>{children}</>;
};

// Dashboard Router - Routes to appropriate dashboard based on role
const DashboardRouter: React.FC = () => {
    const user = useAuthStore((state) => state.user);

    if (!user) return <Navigate to="/login" replace />;

    switch (user.role) {
        case AdminRole.SUPER_ADMIN:
            return <AdminDashboard />;
        case AdminRole.BRANCH_MANAGER:
            return <ManagerDashboard />;
        case AdminRole.STAFF:
            return <StaffDashboard />;
        case AdminRole.SUPPORT:
            return <StaffDashboard />;
        case AdminRole.INVENTORY:
            return <ManagerDashboard />;
        default:
            return <Dashboard />;
    }
};

const AppRouter: React.FC = () => {
    return (
        <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<Login />} />

                    {/* Protected Routes */}
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <AdminLayout />
                            </ProtectedRoute>
                        }
                    >
                        {/* Dashboard - Role-based */}
                        <Route index element={<DashboardRouter />} />

                        {/* Products - Read access for all, edit for specific roles */}
                        <Route path="products" element={<ProductList />} />
                        <Route 
                            path="products/new" 
                            element={
                                <RoleRoute allowedRoles={[AdminRole.SUPER_ADMIN, AdminRole.INVENTORY]}>
                                    <ProductForm />
                                </RoleRoute>
                            } 
                        />
                        <Route path="products/:id/edit" element={<ProductForm />} />

                        {/* Orders */}
                        <Route path="orders" element={<OrderList />} />
                        <Route path="orders/:id" element={<OrderDetail />} />

                        {/* Inventory - Manager and above */}
                        <Route 
                            path="inventory" 
                            element={
                                <RoleRoute allowedRoles={[AdminRole.SUPER_ADMIN, AdminRole.BRANCH_MANAGER, AdminRole.INVENTORY]}>
                                    <BranchInventory />
                                </RoleRoute>
                            } 
                        />
                        <Route 
                            path="inventory/transfers" 
                            element={
                                <RoleRoute allowedRoles={[AdminRole.SUPER_ADMIN, AdminRole.BRANCH_MANAGER, AdminRole.INVENTORY]}>
                                    <StockTransfers />
                                </RoleRoute>
                            } 
                        />
                        <Route 
                            path="inventory/low-stock" 
                            element={
                                <RoleRoute allowedRoles={[AdminRole.SUPER_ADMIN, AdminRole.BRANCH_MANAGER, AdminRole.INVENTORY]}>
                                    <LowStockReport />
                                </RoleRoute>
                            } 
                        />

                        {/* Analytics - Manager and above */}
                        <Route 
                            path="analytics" 
                            element={
                                <RoleRoute allowedRoles={[AdminRole.SUPER_ADMIN, AdminRole.BRANCH_MANAGER, AdminRole.INVENTORY]}>
                                    <Analytics />
                                </RoleRoute>
                            } 
                        />
                        <Route 
                            path="analytics/watchlist" 
                            element={
                                <RoleRoute allowedRoles={[AdminRole.SUPER_ADMIN, AdminRole.BRANCH_MANAGER]}>
                                    <WatchlistAnalytics />
                                </RoleRoute>
                            } 
                        />
                        <Route 
                            path="analytics/branch/:branchId?" 
                            element={
                                <RoleRoute allowedRoles={[AdminRole.SUPER_ADMIN, AdminRole.BRANCH_MANAGER]}>
                                    <BranchAnalytics />
                                </RoleRoute>
                            } 
                        />

                        {/* Customers */}
                        <Route path="customers" element={<CustomerList />} />

                        {/* Users - Super Admin only */}
                        <Route 
                            path="users" 
                            element={
                                <RoleRoute allowedRoles={[AdminRole.SUPER_ADMIN]}>
                                    <AdminUserList />
                                </RoleRoute>
                            } 
                        />
                        <Route 
                            path="users/new" 
                            element={
                                <RoleRoute allowedRoles={[AdminRole.SUPER_ADMIN]}>
                                    <AdminUserForm />
                                </RoleRoute>
                            } 
                        />
                        <Route 
                            path="users/:id/edit" 
                            element={
                                <RoleRoute allowedRoles={[AdminRole.SUPER_ADMIN]}>
                                    <AdminUserForm />
                                </RoleRoute>
                            } 
                        />

                        {/* Branches - Super Admin only */}
                        <Route 
                            path="branches" 
                            element={
                                <RoleRoute allowedRoles={[AdminRole.SUPER_ADMIN]}>
                                    <BranchList />
                                </RoleRoute>
                            } 
                        />

                        {/* Settings */}
                        <Route path="settings" element={<Settings />} />
                        
                        {/* App Settings - Super Admin only (Splash Video, etc.) */}
                        <Route 
                            path="settings/app" 
                            element={
                                <RoleRoute allowedRoles={[AdminRole.SUPER_ADMIN]}>
                                    <AppSettings />
                                </RoleRoute>
                            } 
                        />
                    </Route>

                    {/* Fallback - Redirect to dashboard */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Suspense>
        </BrowserRouter>
    );
};

export default AppRouter;
