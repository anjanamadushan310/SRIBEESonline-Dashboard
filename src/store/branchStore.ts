/**
 * Branch Store using Zustand
 * Manages active branch context for Super Admin branch switching
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Branch } from '../types/branch.types';

interface BranchState {
    // Active branch for filtering (Super Admin only)
    activeBranch: string | null;
    activeBranchData: Branch | null;
    
    // All available branches
    branches: Branch[];
    branchesLoading: boolean;
    
    // Actions
    setActiveBranch: (branchId: string | null, branchData?: Branch) => void;
    clearActiveBranch: () => void;
    setBranches: (branches: Branch[]) => void;
    setBranchesLoading: (loading: boolean) => void;
    getBranchById: (branchId: string) => Branch | undefined;
}

export const useBranchStore = create<BranchState>()(
    persist(
        (set, get) => ({
            activeBranch: null,
            activeBranchData: null,
            branches: [],
            branchesLoading: false,

            setActiveBranch: (branchId, branchData) => {
                if (branchId) {
                    localStorage.setItem('active_branch', branchId);
                } else {
                    localStorage.removeItem('active_branch');
                }
                
                // Find branch data if not provided
                const branch = branchData || get().branches.find((b) => b.branch_id === branchId);
                
                set({
                    activeBranch: branchId,
                    activeBranchData: branch || null,
                });
            },

            clearActiveBranch: () => {
                localStorage.removeItem('active_branch');
                set({
                    activeBranch: null,
                    activeBranchData: null,
                });
            },

            setBranches: (branches) => {
                set({ branches });
            },

            setBranchesLoading: (loading) => {
                set({ branchesLoading: loading });
            },

            getBranchById: (branchId) => {
                return get().branches.find((b) => b.branch_id === branchId);
            },
        }),
        {
            name: 'admin-branch-storage',
            partialize: (state) => ({
                activeBranch: state.activeBranch,
            }),
        }
    )
);

// Selectors
export const selectActiveBranch = (state: BranchState) => state.activeBranch;
export const selectActiveBranchData = (state: BranchState) => state.activeBranchData;
export const selectBranches = (state: BranchState) => state.branches;
export const selectBranchesLoading = (state: BranchState) => state.branchesLoading;
