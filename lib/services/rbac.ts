import { createClient } from '@/lib/supabase/server'

export interface HasEntityPermissionArgs {
  userId: string
  entityType: string
  entityId: string
  permission: string
}

export async function hasEntityPermission({
  userId,
  entityType,
  entityId,
  permission
}: HasEntityPermissionArgs): Promise<boolean> {
  if (!userId || !entityType || !entityId || !permission) return false

  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase.rpc('has_entity_permission', {
      p_user_id: userId,
      p_entity_type: entityType,
      p_entity_id: entityId,
      p_permission_name: permission
    })

    if (error) {
      console.error('[RBAC] Permission check error:', error)
      return false
    }
    
    return Boolean(data)
  } catch (error) {
    console.error('[RBAC] Permission check failed:', error)
    return false
  }
}


