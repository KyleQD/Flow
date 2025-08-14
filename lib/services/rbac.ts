import { supabase } from '@/lib/supabase/client'

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

  const { data, error } = await supabase.rpc('has_entity_permission', {
    p_user_id: userId,
    p_entity_type: entityType,
    p_entity_id: entityId,
    p_permission_name: permission
  })

  if (error) return false
  return Boolean(data)
}


