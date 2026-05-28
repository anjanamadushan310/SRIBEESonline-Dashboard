/**
 * PermissionGuard Component
 * Guards UI elements based on permissions
 */

import React from 'react';
import { usePermissions } from '../../hooks/usePermissions';
import type { Resource, Action } from '../../types/admin.types';

interface PermissionGuardProps {
    children: React.ReactNode;
    resource: Resource;
    action: Action;
    fallback?: React.ReactNode;
}

/**
 * Renders children only if user has the required permission
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
    children,
    resource,
    action,
    fallback = null,
}) => {
    const { can } = usePermissions();

    if (!can(resource, action)) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
};

interface CanCreateProps {
    children: React.ReactNode;
    resource: Resource;
    fallback?: React.ReactNode;
}

export const CanCreate: React.FC<CanCreateProps> = ({ children, resource, fallback }) => {
    return (
        <PermissionGuard resource={resource} action="create" fallback={fallback}>
            {children}
        </PermissionGuard>
    );
};

export const CanRead: React.FC<CanCreateProps> = ({ children, resource, fallback }) => {
    return (
        <PermissionGuard resource={resource} action="read" fallback={fallback}>
            {children}
        </PermissionGuard>
    );
};

export const CanUpdate: React.FC<CanCreateProps> = ({ children, resource, fallback }) => {
    return (
        <PermissionGuard resource={resource} action="update" fallback={fallback}>
            {children}
        </PermissionGuard>
    );
};

export const CanDelete: React.FC<CanCreateProps> = ({ children, resource, fallback }) => {
    return (
        <PermissionGuard resource={resource} action="delete" fallback={fallback}>
            {children}
        </PermissionGuard>
    );
};

export default PermissionGuard;
