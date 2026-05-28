/**
 * Permission Utilities
 * Helper functions for RBAC permission checks
 */

import { AdminRole, ROLE_PERMISSIONS } from '../types/admin.types';
import type { Resource, Action, Permission } from '../types/admin.types';

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: AdminRole, resource: Resource, action: Action): boolean {
    const permissions = ROLE_PERMISSIONS[role] || [];
    
    return permissions.some((perm: Permission) => {
        // Wildcard permissions
        if (perm.resource === '*' && perm.action === '*') return true;
        if (perm.resource === '*' && perm.action === action) return true;
        if (perm.resource === resource && perm.action === '*') return true;
        
        // Exact match
        return perm.resource === resource && perm.action === action;
    });
}

/**
 * Check if a role has any permission for a resource
 */
export function hasAnyPermission(role: AdminRole, resource: Resource): boolean {
    return (
        hasPermission(role, resource, 'create') ||
        hasPermission(role, resource, 'read') ||
        hasPermission(role, resource, 'update') ||
        hasPermission(role, resource, 'delete')
    );
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: AdminRole): Permission[] {
    return ROLE_PERMISSIONS[role] || [];
}

/**
 * Check if role is super admin
 */
export function isSuperAdmin(role: AdminRole): boolean {
    return role === AdminRole.SUPER_ADMIN;
}

/**
 * Check if role requires branch isolation
 */
export function requiresBranchIsolation(role: AdminRole): boolean {
    return (
        role === AdminRole.BRANCH_MANAGER ||
        role === AdminRole.STAFF
    );
}

/**
 * Check if role can access all branches
 */
export function canAccessAllBranches(role: AdminRole): boolean {
    return (
        role === AdminRole.SUPER_ADMIN ||
        role === AdminRole.SUPPORT ||
        role === AdminRole.INVENTORY
    );
}

/**
 * Check if user can access a specific branch
 */
export function canAccessBranch(userRole: AdminRole, userBranchId: string | undefined, targetBranchId: string): boolean {
    // Super admin, support, and inventory can access all branches
    if (canAccessAllBranches(userRole)) {
        return true;
    }
    
    // Branch-specific roles can only access their branch
    return userBranchId === targetBranchId;
}

/**
 * Filter items by branch access
 */
export function filterByBranchAccess<T extends { branch_id: string }>(
    items: T[],
    userRole: AdminRole,
    userBranchId: string | undefined
): T[] {
    if (canAccessAllBranches(userRole)) {
        return items;
    }
    
    if (!userBranchId) {
        return [];
    }
    
    return items.filter((item) => item.branch_id === userBranchId);
}

/**
 * Get dashboard type based on role
 */
export type DashboardType = 'admin' | 'manager' | 'staff' | 'support' | 'inventory';

export function getDashboardType(role: AdminRole): DashboardType {
    switch (role) {
        case AdminRole.SUPER_ADMIN:
            return 'admin';
        case AdminRole.BRANCH_MANAGER:
            return 'manager';
        case AdminRole.STAFF:
            return 'staff';
        case AdminRole.SUPPORT:
            return 'support';
        case AdminRole.INVENTORY:
            return 'inventory';
        default:
            return 'staff';
    }
}

/**
 * Check if role can manage users
 */
export function canManageUsers(role: AdminRole): boolean {
    return role === AdminRole.SUPER_ADMIN;
}

/**
 * Check if role can manage branches
 */
export function canManageBranches(role: AdminRole): boolean {
    return role === AdminRole.SUPER_ADMIN;
}

/**
 * Check if role can approve stock transfers
 */
export function canApproveTransfers(role: AdminRole): boolean {
    return role === AdminRole.SUPER_ADMIN || role === AdminRole.INVENTORY;
}

/**
 * Check if role can create stock transfers
 */
export function canCreateTransfers(role: AdminRole): boolean {
    return role === AdminRole.SUPER_ADMIN || role === AdminRole.BRANCH_MANAGER || role === AdminRole.INVENTORY;
}

/**
 * Check if role can view analytics
 */
export function canViewAnalytics(role: AdminRole): boolean {
    return (
        role === AdminRole.SUPER_ADMIN ||
        role === AdminRole.BRANCH_MANAGER ||
        role === AdminRole.INVENTORY
    );
}

/**
 * Check if role can view global analytics (all branches)
 */
export function canViewGlobalAnalytics(role: AdminRole): boolean {
    return role === AdminRole.SUPER_ADMIN;
}

/**
 * Check if role can view watchlist analytics
 */
export function canViewWatchlistAnalytics(role: AdminRole): boolean {
    return role === AdminRole.SUPER_ADMIN || role === AdminRole.BRANCH_MANAGER;
}

/**
 * Check if role can edit products
 */
export function canEditProducts(role: AdminRole): boolean {
    return role === AdminRole.SUPER_ADMIN || role === AdminRole.INVENTORY;
}

/**
 * Check if role can update branch inventory
 */
export function canUpdateInventory(role: AdminRole): boolean {
    return role === AdminRole.SUPER_ADMIN || role === AdminRole.BRANCH_MANAGER || role === AdminRole.INVENTORY;
}
