/**
 * usePermissions Hook
 * Provides permission checking utilities with React integration
 */

import { useMemo } from 'react';
import { useAuthStore } from '../store/authStore';
import type { Resource, Action } from '../types/admin.types';
import { AdminRole, ROLE_PERMISSIONS } from '../types/admin.types';

// Permission utility functions
function checkPermission(role: AdminRole, resource: Resource | string, action: Action | string): boolean {
    const permissions = ROLE_PERMISSIONS[role] || [];
    
    return permissions.some((perm) => {
        if (perm.resource === '*' && perm.action === '*') return true;
        if (perm.resource === '*' && perm.action === action) return true;
        if (perm.resource === resource && perm.action === '*') return true;
        return perm.resource === resource && perm.action === action;
    });
}

function checkAnyPermission(role: AdminRole, resource: Resource | string): boolean {
    return (
        checkPermission(role, resource, 'create') ||
        checkPermission(role, resource, 'read') ||
        checkPermission(role, resource, 'update') ||
        checkPermission(role, resource, 'delete')
    );
}

export type DashboardType = 'admin' | 'manager' | 'staff' | 'support' | 'inventory';

function getDashboardType(role: AdminRole): DashboardType {
    switch (role) {
        case AdminRole.SUPER_ADMIN: return 'admin';
        case AdminRole.BRANCH_MANAGER: return 'manager';
        case AdminRole.STAFF: return 'staff';
        case AdminRole.SUPPORT: return 'support';
        case AdminRole.INVENTORY: return 'inventory';
        default: return 'staff';
    }
}

export const usePermissions = () => {
    const user = useAuthStore((state) => state.user);

    return useMemo(() => {
        const role = user?.role;
        const branchId = user?.branch_id;

        if (!role) {
            return {
                // Basic checks
                hasPermission: () => false,
                can: () => false,
                canAny: () => false,
                canCreate: () => false,
                canRead: () => false,
                canUpdate: () => false,
                canDelete: () => false,
                canAccessRoute: () => false,
                
                // Role checks
                role: undefined,
                isSuperAdmin: false,
                isBranchManager: false,
                isStaff: false,
                isSupport: false,
                isInventory: false,
                
                // Branch
                branchId: undefined,
                requiresBranchIsolation: true,
                canAccessAllBranches: false,
                canAccessBranch: () => false,
                
                // Dashboard
                dashboardType: 'staff' as DashboardType,
                
                // Specific permissions
                canManageUsers: false,
                canManageBranches: false,
                canApproveTransfers: false,
                canCreateTransfers: false,
                canViewAnalytics: false,
                canViewGlobalAnalytics: false,
                canViewWatchlistAnalytics: false,
                canEditProducts: false,
                canUpdateInventory: false,
            };
        }

        const hasPermission = (resource: string, action: string): boolean => {
            return checkPermission(role, resource as Resource, action as Action);
        };

        const can = (resource: Resource, action: Action) => checkPermission(role, resource, action);
        const canAny = (resource: Resource) => checkAnyPermission(role, resource);
        const canCreate = (resource: string) => hasPermission(resource, 'create');
        const canRead = (resource: string) => hasPermission(resource, 'read');
        const canUpdate = (resource: string) => hasPermission(resource, 'update');
        const canDelete = (resource: string) => hasPermission(resource, 'delete');

        const routePermissions: Record<string, { resource: string; action: string }> = {
            '/': { resource: 'dashboard', action: 'read' },
            '/products': { resource: 'products', action: 'read' },
            '/products/new': { resource: 'products', action: 'create' },
            '/orders': { resource: 'orders', action: 'read' },
            '/customers': { resource: 'customers', action: 'read' },
            '/inventory': { resource: 'inventory', action: 'read' },
            '/analytics': { resource: 'analytics', action: 'read' },
            '/watchlist': { resource: 'watchlist', action: 'read' },
            '/users': { resource: 'users', action: 'read' },
            '/branches': { resource: 'branches', action: 'read' },
            '/settings': { resource: 'settings', action: 'read' },
            '/transfers': { resource: 'transfers', action: 'read' },
        };

        const canAccessRoute = (route: string): boolean => {
            const permission = routePermissions[route];
            if (!permission) return true;
            return hasPermission(permission.resource, permission.action);
        };

        // Role checks
        const isSuperAdmin = role === AdminRole.SUPER_ADMIN;
        const isBranchManager = role === AdminRole.BRANCH_MANAGER;
        const isStaff = role === AdminRole.STAFF;
        const isSupport = role === AdminRole.SUPPORT;
        const isInventory = role === AdminRole.INVENTORY;

        // Branch access
        const requiresBranchIsolation = role === AdminRole.BRANCH_MANAGER || role === AdminRole.STAFF;
        const canAccessAllBranches = role === AdminRole.SUPER_ADMIN || role === AdminRole.SUPPORT || role === AdminRole.INVENTORY;
        const canAccessBranch = (targetBranchId: string) => {
            if (canAccessAllBranches) return true;
            return branchId === targetBranchId;
        };

        // Specific permissions
        const canManageUsers = isSuperAdmin;
        const canManageBranches = isSuperAdmin;
        const canApproveTransfers = role === AdminRole.SUPER_ADMIN || role === AdminRole.INVENTORY;
        const canCreateTransfers = role === AdminRole.SUPER_ADMIN || role === AdminRole.BRANCH_MANAGER || role === AdminRole.INVENTORY;
        const canViewAnalytics = role === AdminRole.SUPER_ADMIN || role === AdminRole.BRANCH_MANAGER || role === AdminRole.INVENTORY;
        const canViewGlobalAnalytics = isSuperAdmin;
        const canViewWatchlistAnalytics = role === AdminRole.SUPER_ADMIN || role === AdminRole.BRANCH_MANAGER;
        const canEditProducts = role === AdminRole.SUPER_ADMIN || role === AdminRole.INVENTORY;
        const canUpdateInventory = role === AdminRole.SUPER_ADMIN || role === AdminRole.BRANCH_MANAGER || role === AdminRole.INVENTORY;

        return {
            // Basic checks
            hasPermission,
            can,
            canAny,
            canCreate,
            canRead,
            canUpdate,
            canDelete,
            canAccessRoute,
            
            // Role checks
            role,
            isSuperAdmin,
            isBranchManager,
            isStaff,
            isSupport,
            isInventory,
            
            // Branch
            branchId,
            requiresBranchIsolation,
            canAccessAllBranches,
            canAccessBranch,
            
            // Dashboard
            dashboardType: getDashboardType(role),
            
            // Specific permissions
            canManageUsers,
            canManageBranches,
            canApproveTransfers,
            canCreateTransfers,
            canViewAnalytics,
            canViewGlobalAnalytics,
            canViewWatchlistAnalytics,
            canEditProducts,
            canUpdateInventory,
        };
    }, [user?.role, user?.branch_id]);
};

export default usePermissions;
