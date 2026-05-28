/**
 * Notification Store using Zustand
 * Manages low stock alerts and system notifications
 */

import { create } from 'zustand';
import type { LowStockAlert } from '../types/branch.types';

interface SystemAlert {
    id: string;
    type: 'low_stock' | 'order' | 'transfer' | 'system';
    title: string;
    message: string;
    severity: 'info' | 'warning' | 'critical';
    timestamp: number;
    read: boolean;
    data?: Record<string, unknown>;
    link?: string;
}

interface NotificationState {
    // Low stock alerts
    lowStockAlerts: LowStockAlert[];
    lowStockLoading: boolean;
    lowStockLastUpdated: number | null;
    
    // System alerts (bell icon notifications)
    systemAlerts: SystemAlert[];
    unreadCount: number;
    
    // Actions
    setLowStockAlerts: (alerts: LowStockAlert[]) => void;
    setLowStockLoading: (loading: boolean) => void;
    addSystemAlert: (alert: Omit<SystemAlert, 'id' | 'timestamp' | 'read'>) => void;
    markAlertAsRead: (alertId: string) => void;
    markAllAlertsAsRead: () => void;
    removeAlert: (alertId: string) => void;
    clearAllAlerts: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
    // Initial state
    lowStockAlerts: [],
    lowStockLoading: false,
    lowStockLastUpdated: null,
    systemAlerts: [],
    unreadCount: 0,

    // Low stock actions
    setLowStockAlerts: (alerts) => {
        set({
            lowStockAlerts: alerts,
            lowStockLastUpdated: Date.now(),
        });

        // Create system alerts for critical low stock items
        const criticalAlerts = alerts.filter((a) => a.severity === 'critical');
        criticalAlerts.forEach((alert) => {
            // Check if alert already exists
            const exists = get().systemAlerts.some(
                (sa) => sa.type === 'low_stock' && sa.data?.inventory_id === alert.inventory_id
            );
            
            if (!exists) {
                get().addSystemAlert({
                    type: 'low_stock',
                    title: 'Critical Stock Level',
                    message: `${alert.product_name} at ${alert.branch_name} has only ${alert.current_stock} items left`,
                    severity: 'critical',
                    data: { inventory_id: alert.inventory_id, branch_id: alert.branch_id },
                    link: `/inventory?branch=${alert.branch_id}&highlight=${alert.inventory_id}`,
                });
            }
        });
    },

    setLowStockLoading: (loading) => {
        set({ lowStockLoading: loading });
    },

    // System alert actions
    addSystemAlert: (alert) => {
        const id = `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newAlert: SystemAlert = {
            ...alert,
            id,
            timestamp: Date.now(),
            read: false,
        };

        set((state) => ({
            systemAlerts: [newAlert, ...state.systemAlerts].slice(0, 50), // Keep max 50 alerts
            unreadCount: state.unreadCount + 1,
        }));
    },

    markAlertAsRead: (alertId) => {
        set((state) => {
            const alert = state.systemAlerts.find((a) => a.id === alertId);
            const wasUnread = alert && !alert.read;
            
            return {
                systemAlerts: state.systemAlerts.map((a) =>
                    a.id === alertId ? { ...a, read: true } : a
                ),
                unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
            };
        });
    },

    markAllAlertsAsRead: () => {
        set((state) => ({
            systemAlerts: state.systemAlerts.map((a) => ({ ...a, read: true })),
            unreadCount: 0,
        }));
    },

    removeAlert: (alertId) => {
        set((state) => {
            const alert = state.systemAlerts.find((a) => a.id === alertId);
            const wasUnread = alert && !alert.read;
            
            return {
                systemAlerts: state.systemAlerts.filter((a) => a.id !== alertId),
                unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
            };
        });
    },

    clearAllAlerts: () => {
        set({
            systemAlerts: [],
            unreadCount: 0,
        });
    },
}));

// Selectors
export const selectLowStockAlerts = (state: NotificationState) => state.lowStockAlerts;
export const selectCriticalLowStock = (state: NotificationState) =>
    state.lowStockAlerts.filter((a) => a.severity === 'critical');
export const selectSystemAlerts = (state: NotificationState) => state.systemAlerts;
export const selectUnreadCount = (state: NotificationState) => state.unreadCount;
