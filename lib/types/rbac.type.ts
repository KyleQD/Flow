// Canonical RBAC types mirroring `.cursor/rules/role rules` and seeded permissions

export type EntityType =
  | 'Individual'
  | 'Artist'
  | 'Venue'
  | 'Organizer'
  | 'PerformanceAgency'
  | 'StaffingAgency'
  | 'RentalCompany'
  | 'ProductionCompany'
  | 'Promoter'
  | 'PublicLocation'
  | 'PrivateLocation'
  | 'VirtualLocation'
  | 'Event'
  | 'EquipmentAsset'
  | 'EventPackage'

export type Permission =
  | 'CREATE_PROFILE'
  | 'EDIT_PROFILE'
  | 'JOIN_ENTITY'
  | 'MANAGE_MEMBERS'
  | 'BOOK_EVENTS'
  | 'ASSIGN_EVENT_ROLES'
  | 'EDIT_EVENT_LOGISTICS'
  | 'MANAGE_ASSETS'
  | 'PUBLISH_MEDIA'
  | 'MANAGE_TICKETING'
  | 'MANAGE_PERMITS'

export interface EntityScope {
  entityType: EntityType
  entityId: string
}


