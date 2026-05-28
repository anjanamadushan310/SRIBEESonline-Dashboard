/**
 * UI Store using Zustand
 * Manages global UI state: sidebar, theme, notifications
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';

interface Notification {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message?: string;
    duration?: number;
    timestamp: number;
}

interface UIState {
    // Sidebar
    sidebarCollapsed: boolean;
    sidebarMobileOpen: boolean;
    
    // Theme
    theme: Theme;
    
    // Notifications
    notifications: Notification[];
    
    // Loading states
    globalLoading: boolean;
    loadingMessage?: string;
    
    // Actions
    toggleSidebar: () => void;
    setSidebarCollapsed: (collapsed: boolean) => void;
    toggleMobileSidebar: () => void;
    setMobileSidebarOpen: (open: boolean) => void;
    setTheme: (theme: Theme) => void;
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
    removeNotification: (id: string) => void;
    clearNotifications: () => void;
    setGlobalLoading: (loading: boolean, message?: string) => void;
}

export const useUIStore = create<UIState>()(
    persist(
        (set, get) => ({
            // Initial state
            sidebarCollapsed: false,
            sidebarMobileOpen: false,
            theme: 'light',
            notifications: [],
            globalLoading: false,
            loadingMessage: undefined,

            // Sidebar actions
            toggleSidebar: () => {
                set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }));
            },

            setSidebarCollapsed: (collapsed) => {
                set({ sidebarCollapsed: collapsed });
            },

            toggleMobileSidebar: () => {
                set((state) => ({ sidebarMobileOpen: !state.sidebarMobileOpen }));
            },

            setMobileSidebarOpen: (open) => {
                set({ sidebarMobileOpen: open });
            },

            // Theme actions
            setTheme: (theme) => {
                set({ theme });
                // Apply theme to document
                if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                } else if (theme === 'light') {
                    document.documentElement.classList.remove('dark');
                } else {
                    // System preference
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    document.documentElement.classList.toggle('dark', prefersDark);
                }
            },

            // Notification actions
            addNotification: (notification) => {
                const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                const newNotification: Notification = {
                    ...notification,
                    id,
                    timestamp: Date.now(),
                    duration: notification.duration ?? 5000,
                };

                set((state) => ({
                    notifications: [...state.notifications, newNotification],
                }));

                // Auto-remove after duration
                if (newNotification.duration && newNotification.duration > 0) {
                    setTimeout(() => {
                        get().removeNotification(id);
                    }, newNotification.duration);
                }
            },

            removeNotification: (id) => {
                set((state) => ({
                    notifications: state.notifications.filter((n) => n.id !== id),
                }));
            },

            clearNotifications: () => {
                set({ notifications: [] });
            },

            // Loading actions
            setGlobalLoading: (loading, message) => {
                set({ globalLoading: loading, loadingMessage: message });
            },
        }),
        {
            name: 'admin-ui-storage',
            partialize: (state) => ({
                sidebarCollapsed: state.sidebarCollapsed,
                theme: state.theme,
            }),
        }
    )
);

// Selectors
export const selectSidebarCollapsed = (state: UIState) => state.sidebarCollapsed;
export const selectTheme = (state: UIState) => state.theme;
export const selectNotifications = (state: UIState) => state.notifications;
export const selectGlobalLoading = (state: UIState) => state.globalLoading;
