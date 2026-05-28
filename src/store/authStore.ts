/**
 * Authentication Store using Zustand
 * Manages user authentication state, token, and branch context
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AdminRole, ROLE_PERMISSIONS } from '../types/admin.types';
import type { Resource, Action } from '../types/admin.types';

// User interface
interface User {
    admin_id: string;
    email: string;
    full_name: string;
    role: AdminRole;
    branch_id?: string;
    branch_name?: string;
    is_active?: boolean;
    avatar_url?: string;
}

// Auth state interface
interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    
    // Actions
    login: (user: User, token: string) => void;
    logout: () => void;
    updateUser: (userData: Partial<User>) => void;
    setLoading: (loading: boolean) => void;
    
    // Permission checks
    hasPermission: (resource: Resource, action: Action) => boolean;
    isSuperAdmin: () => boolean;
    isBranchManager: () => boolean;
    isStaff: () => boolean;
    canAccessBranch: (branchId: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,

            login: (user, token) => {
                localStorage.setItem('admin_token', token);
                localStorage.setItem('admin_user', JSON.stringify(user));
                set({ user, token, isAuthenticated: true, isLoading: false });
            },

            logout: () => {
                localStorage.removeItem('admin_token');
                localStorage.removeItem('admin_user');
                localStorage.removeItem('active_branch');
                set({ user: null, token: null, isAuthenticated: false, isLoading: false });
            },

            updateUser: (userData) => {
                const currentUser = get().user;
                if (currentUser) {
                    const updatedUser = { ...currentUser, ...userData };
                    localStorage.setItem('admin_user', JSON.stringify(updatedUser));
                    set({ user: updatedUser });
                }
            },

            setLoading: (loading) => {
                set({ isLoading: loading });
            },

            hasPermission: (resource: Resource, action: Action) => {
                const user = get().user;
                if (!user) return false;

                const permissions = ROLE_PERMISSIONS[user.role] || [];
                
                return permissions.some((perm) => {
                    // Check for wildcard permissions
                    if (perm.resource === '*' && perm.action === '*') return true;
                    if (perm.resource === '*' && perm.action === action) return true;
                    if (perm.resource === resource && perm.action === '*') return true;
                    
                    // Exact match
                    return perm.resource === resource && perm.action === action;
                });
            },

            isSuperAdmin: () => {
                const user = get().user;
                return user?.role === AdminRole.SUPER_ADMIN;
            },

            isBranchManager: () => {
                const user = get().user;
                return user?.role === AdminRole.BRANCH_MANAGER;
            },

            isStaff: () => {
                const user = get().user;
                return user?.role === AdminRole.STAFF;
            },

            canAccessBranch: (branchId: string) => {
                const user = get().user;
                if (!user) return false;
                
                // Super admin can access all branches
                if (user.role === AdminRole.SUPER_ADMIN) return true;
                
                // Other roles can only access their assigned branch
                return user.branch_id === branchId;
            },
        }),
        {
            name: 'admin-auth-storage',
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);

// Selectors for common use cases
export const selectUser = (state: AuthState) => state.user;
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated;
export const selectUserRole = (state: AuthState) => state.user?.role;
export const selectUserBranch = (state: AuthState) => state.user?.branch_id;
