/**
 * RoleGuard Component
 * Protects routes based on user role and permissions
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { usePermissions } from '../../hooks/usePermissions';
import { AdminRole } from '../../types/admin.types';
import type { Resource, Action } from '../../types/admin.types';

interface RoleGuardProps {
    children: React.ReactNode;
    // Required roles (user must have one of these)
    allowedRoles?: AdminRole[];
    // Required permission
    requiredPermission?: {
        resource: Resource;
        action: Action;
    };
    // Fallback component when access denied
    fallback?: React.ReactNode;
    // Redirect path when access denied
    redirectTo?: string;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
    children,
    allowedRoles,
    requiredPermission,
    fallback,
    redirectTo = '/',
}) => {
    const { user, isAuthenticated } = useAuthStore();
    const { can } = usePermissions();
    const location = useLocation();

    // Not authenticated - redirect to login
    if (!isAuthenticated || !user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check role restriction
    if (allowedRoles && allowedRoles.length > 0) {
        if (!allowedRoles.includes(user.role)) {
            if (fallback) {
                return <>{fallback}</>;
            }
            return <Navigate to={redirectTo} replace />;
        }
    }

    // Check permission restriction
    if (requiredPermission) {
        const hasAccess = can(requiredPermission.resource, requiredPermission.action);
        if (!hasAccess) {
            if (fallback) {
                return <>{fallback}</>;
            }
            return <Navigate to={redirectTo} replace />;
        }
    }

    return <>{children}</>;
};

/**
 * SuperAdminOnly Guard
 * Only allows super admin access
 */
export const SuperAdminOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
    children,
    fallback,
}) => {
    return (
        <RoleGuard allowedRoles={[AdminRole.SUPER_ADMIN]} fallback={fallback}>
            {children}
        </RoleGuard>
    );
};

/**
 * BranchStaffGuard
 * Allows branch manager and staff
 */
export const BranchStaffGuard: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
    children,
    fallback,
}) => {
    return (
        <RoleGuard
            allowedRoles={[AdminRole.SUPER_ADMIN, AdminRole.BRANCH_MANAGER, AdminRole.CUSTOMER_SUPPORT]}
            fallback={fallback}
        >
            {children}
        </RoleGuard>
    );
};

/**
 * InventoryGuard
 * Allows users who can manage inventory
 */
export const InventoryGuard: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
    children,
    fallback,
}) => {
    return (
        <RoleGuard
            allowedRoles={[AdminRole.SUPER_ADMIN, AdminRole.BRANCH_MANAGER, AdminRole.INVENTORY_MANAGER]}
            fallback={fallback}
        >
            {children}
        </RoleGuard>
    );
};

export default RoleGuard;
