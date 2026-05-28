import React from 'react';
import { usePermissions } from '../../hooks/usePermissions';
import { Tooltip } from 'antd';

interface ProtectedActionProps {
    resource: string;
    action: string;
    children: React.ReactNode;
    fallback?: React.ReactNode;
    showTooltip?: boolean;
}

export const ProtectedAction: React.FC<ProtectedActionProps> = ({
    resource,
    action,
    children,
    fallback,
    showTooltip = true,
}) => {
    const { hasPermission } = usePermissions();

    if (!hasPermission(resource, action)) {
        if (fallback) {
            return <>{fallback}</>;
        }

        if (showTooltip) {
            return (
                <Tooltip title="You don't have permission for this action">
                    <span style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                        {children}
                    </span>
                </Tooltip>
            );
        }

        return null;
    }

    return <>{children}</>;
};

interface ProtectedRouteProps {
    route: string;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    route,
    children,
    fallback
}) => {
    const { canAccessRoute } = usePermissions();

    if (!canAccessRoute(route)) {
        return fallback ? <>{fallback}</> : (
            <div style={{ padding: 24, textAlign: 'center' }}>
                <h2>Access Denied</h2>
                <p>You don't have permission to access this page.</p>
            </div>
        );
    }

    return <>{children}</>;
};
