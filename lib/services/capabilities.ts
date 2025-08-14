import { hasEntityPermission } from '@/lib/services/rbac'
import type { EntityType, Permission } from '@/lib/types/rbac.type'

export interface CapabilityInput {
  userId: string
  entityType: EntityType | string
  entityId: string
}

export async function getCapabilities({ userId, entityType, entityId }: CapabilityInput) {
  const checks: Permission[] = [
    'ASSIGN_EVENT_ROLES',
    'EDIT_EVENT_LOGISTICS',
    'MANAGE_MEMBERS',
    'MANAGE_ASSETS',
    'PUBLISH_MEDIA',
  ]

  const results = await Promise.all(
    checks.map(async permission => ({ permission, allowed: await hasEntityPermission({ userId, entityType, entityId, permission }) }))
  )

  const map = Object.fromEntries(results.map(r => [r.permission, r.allowed])) as Record<Permission, boolean>

  return {
    canAssignRoles: !!map.ASSIGN_EVENT_ROLES,
    canEditLogistics: !!map.EDIT_EVENT_LOGISTICS,
    canManageMembers: !!map.MANAGE_MEMBERS,
    canManageAssets: !!map.MANAGE_ASSETS,
    canPublishMedia: !!map.PUBLISH_MEDIA,
  }
}


