// =============================================================================
// ADMIN SYSTEM TYPES
// Comprehensive TypeScript types for admin functionality
// =============================================================================

// =============================================================================
// COMMON TYPES
// =============================================================================

export type Status = 'active' | 'inactive' | 'pending' | 'completed' | 'cancelled'
export type Currency = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD'
export type EmploymentType = 'full_time' | 'part_time' | 'contractor' | 'volunteer'
export type EquipmentCondition = 'excellent' | 'good' | 'fair' | 'poor' | 'damaged'
export type TransportationType = 'bus' | 'van' | 'truck' | 'plane' | 'train' | 'other'
export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed'

// =============================================================================
// STAFF MANAGEMENT
// =============================================================================

export interface StaffProfile {
  id: string
  user_id?: string
  employee_id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  position: string
  department: string
  hire_date: string
  employment_type: EmploymentType
  salary?: number
  hourly_rate?: number
  status: 'active' | 'inactive' | 'on_tour' | 'terminated'
  availability: 'available' | 'busy' | 'vacation' | 'sick_leave'
  skills: string[]
  certifications: string[]
  emergency_contact?: {
    name?: string
    phone?: string
    relationship?: string
  }
  performance_rating: number
  tours_completed: number
  current_assignment?: string
  location?: string
  avatar_url?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface StaffSchedule {
  id: string
  staff_id: string
  event_id?: string
  tour_id?: string
  shift_start: string
  shift_end: string
  role: string
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled'
  notes?: string
  created_at: string
  updated_at: string
}

// =============================================================================
// TICKETING SYSTEM
// =============================================================================

export interface TicketType {
  id: string
  event_id: string
  name: string
  description?: string
  price: number
  quantity_available: number
  quantity_sold: number
  max_per_customer?: number
  sale_start?: string
  sale_end?: string
  is_active: boolean
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface TicketSale {
  id: string
  ticket_type_id: string
  event_id: string
  customer_email: string
  customer_name: string
  customer_phone?: string
  quantity: number
  total_amount: number
  fees: number
  payment_status: PaymentStatus
  payment_method?: string
  transaction_id?: string
  order_number: string
  purchase_date: string
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

// =============================================================================
// LOGISTICS MANAGEMENT
// =============================================================================

export interface Transportation {
  id: string
  tour_id?: string
  event_id?: string
  type: TransportationType
  provider?: string
  vehicle_details?: Record<string, any>
  departure_location: string
  arrival_location: string
  departure_time: string
  arrival_time: string
  capacity?: number
  assigned_staff: string[]
  cost?: number
  status: 'planned' | 'booked' | 'in_transit' | 'completed' | 'cancelled'
  driver_info?: Record<string, any>
  notes?: string
  created_at: string
  updated_at: string
}

export interface Equipment {
  id: string
  name: string
  category: string
  description?: string
  serial_number?: string
  purchase_date?: string
  purchase_price?: number
  current_value?: number
  condition: EquipmentCondition
  location?: string
  assigned_to?: string
  maintenance_schedule?: Record<string, any>
  last_maintenance?: string
  next_maintenance?: string
  warranty_expiry?: string
  is_available: boolean
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface EquipmentAssignment {
  id: string
  equipment_id: string
  event_id?: string
  tour_id?: string
  assigned_date: string
  return_date?: string
  status: 'assigned' | 'in_use' | 'returned' | 'damaged'
  condition_out?: string
  condition_in?: string
  notes?: string
  created_at: string
  updated_at: string
}

// =============================================================================
// FINANCIAL MANAGEMENT
// =============================================================================

export interface BudgetCategory {
  id: string
  name: string
  description?: string
  parent_category_id?: string
  is_active: boolean
  created_at: string
}

export interface Budget {
  id: string
  tour_id?: string
  event_id?: string
  category_id: string
  name: string
  budgeted_amount: number
  actual_amount: number
  currency: Currency
  status: 'active' | 'completed' | 'cancelled'
  period_start?: string
  period_end?: string
  created_by: string
  approved_by?: string
  approved_at?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface Expense {
  id: string
  budget_id?: string
  category_id: string
  tour_id?: string
  event_id?: string
  description: string
  amount: number
  currency: Currency
  expense_date: string
  vendor?: string
  payment_method?: string
  receipt_url?: string
  status: 'pending' | 'approved' | 'paid' | 'rejected'
  submitted_by: string
  approved_by?: string
  approved_at?: string
  paid_at?: string
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface Revenue {
  id: string
  event_id?: string
  tour_id?: string
  source: string
  description: string
  amount: number
  currency: Currency
  revenue_date: string
  payment_received: boolean
  payment_date?: string
  fees: number
  net_amount: number
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

// =============================================================================
// ANALYTICS & REPORTING
// =============================================================================

export interface AnalyticsMetric {
  id: string
  metric_type: string
  metric_name: string
  value: number
  dimensions?: Record<string, any>
  timestamp: string
  metadata?: Record<string, any>
}

export interface DashboardConfiguration {
  id: string
  user_id: string
  dashboard_name: string
  layout: Record<string, any>
  filters?: Record<string, any>
  is_default: boolean
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface AnalyticsData {
  kpis: {
    total_tours: number
    active_tours: number
    total_events: number
    upcoming_events: number
    total_revenue: number
    total_net_revenue: number
    total_expenses: number
    net_profit: number
    profit_margin: number
    total_staff: number
    active_staff: number
    tickets_sold: number
    ticket_revenue: number
  }
  trends: {
    daily_revenue: Record<string, number>
    daily_expenses: Record<string, number>
  }
  breakdowns: {
    revenue_by_source: Record<string, number>
    staff_by_department: Record<string, number>
  }
  period: string
  date_range: {
    start: string
    end: string
  }
}

// =============================================================================
// SYSTEM SETTINGS & CONFIGURATION
// =============================================================================

export interface SystemSetting {
  id: string
  category: string
  setting_key: string
  setting_value: any
  description?: string
  is_encrypted: boolean
  last_modified_by?: string
  created_at: string
  updated_at: string
}

export interface Integration {
  id: string
  name: string
  type: string
  status: 'active' | 'inactive' | 'error'
  configuration: Record<string, any>
  credentials?: Record<string, any> | '[CONFIGURED]'
  webhook_url?: string
  last_sync?: string
  sync_status: 'never' | 'success' | 'error'
  error_message?: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface AdminAuditLog {
  id: string
  user_id?: string
  action: string
  resource_type: string
  resource_id?: string
  old_values?: Record<string, any>
  new_values?: Record<string, any>
  ip_address?: string
  user_agent?: string
  session_id?: string
  timestamp: string
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  uptime?: number
  components: {
    database: 'healthy' | 'unhealthy'
    events_table: 'healthy' | 'unhealthy'
    tours_table: 'healthy' | 'unhealthy'
    staff_table: 'healthy' | 'unhealthy'
    integrations: 'healthy' | 'unhealthy'
  }
  metrics?: {
    memory_usage: {
      used: number
      total: number
      percentage: number
    }
  }
  error?: string
}

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

export interface AdminApiResponse<T = any> {
  success?: boolean
  error?: string
  details?: any[]
  data?: T
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  limit: number
  offset: number
}

// =============================================================================
// REQUEST TYPES
// =============================================================================

export interface CreateStaffRequest {
  first_name: string
  last_name: string
  email: string
  phone?: string
  position: string
  department: string
  hire_date: string
  employment_type: EmploymentType
  salary?: number
  hourly_rate?: number
  skills: string[]
  certifications: string[]
  emergency_contact?: {
    name?: string
    phone?: string
    relationship?: string
  }
  location?: string
  notes?: string
}

export interface CreateTicketTypeRequest {
  event_id: string
  name: string
  description?: string
  price: number
  quantity_available: number
  max_per_customer?: number
  sale_start?: string
  sale_end?: string
  metadata?: Record<string, any>
}

export interface CreateTransportationRequest {
  tour_id?: string
  event_id?: string
  type: TransportationType
  provider?: string
  vehicle_details?: Record<string, any>
  departure_location: string
  arrival_location: string
  departure_time: string
  arrival_time: string
  capacity?: number
  assigned_staff: string[]
  cost?: number
  driver_info?: Record<string, any>
  notes?: string
}

export interface CreateBudgetRequest {
  tour_id?: string
  event_id?: string
  category_id: string
  name: string
  budgeted_amount: number
  currency: Currency
  period_start?: string
  period_end?: string
  notes?: string
}

export interface CreateExpenseRequest {
  budget_id?: string
  category_id: string
  tour_id?: string
  event_id?: string
  description: string
  amount: number
  currency: Currency
  expense_date: string
  vendor?: string
  payment_method?: string
  receipt_url?: string
  metadata?: Record<string, any>
}

// =============================================================================
// FILTER TYPES
// =============================================================================

export interface StaffFilters {
  department?: string
  status?: string
  availability?: string
  search?: string
}

export interface TicketingFilters {
  event_id?: string
  status?: PaymentStatus
  type?: 'ticket_types' | 'sales' | 'analytics'
}

export interface LogisticsFilters {
  event_id?: string
  tour_id?: string
  status?: string
  category?: string
  availability?: 'available' | 'assigned'
  type?: 'transportation' | 'equipment' | 'assignments' | 'analytics'
}

export interface FinancialFilters {
  event_id?: string
  tour_id?: string
  category_id?: string
  status?: string
  period?: 'week' | 'month' | 'quarter' | 'year'
  type?: 'budgets' | 'expenses' | 'revenue' | 'analytics' | 'categories'
}

export interface AnalyticsFilters {
  type?: 'overview' | 'tours' | 'events' | 'financial' | 'staff' | 'custom' | 'dashboards'
  period?: 'week' | 'month' | 'quarter' | 'year'
  tour_id?: string
  event_id?: string
  metric_type?: string
  start_date?: string
  end_date?: string
}

export interface SystemFilters {
  type?: 'settings' | 'integrations' | 'audit' | 'health' | 'categories'
  category?: string
  setting_key?: string
  resource_type?: string
  action?: string
  start_date?: string
  end_date?: string
}

// =============================================================================
// EXTENDED TYPES WITH RELATIONS
// =============================================================================

export interface StaffProfileWithRelations extends StaffProfile {
  schedules?: StaffSchedule[]
  assignments?: EquipmentAssignment[]
}

export interface TicketTypeWithEvent extends TicketType {
  event?: {
    id: string
    title: string
    date: string
    location: string
  }
}

export interface TicketSaleWithDetails extends TicketSale {
  ticket_type?: TicketType
  event?: {
    id: string
    title: string
    date: string
    location: string
  }
}

export interface EquipmentWithAssignee extends Equipment {
  assigned_staff?: {
    id: string
    first_name: string
    last_name: string
    position: string
  }
}

export interface BudgetWithCategory extends Budget {
  category?: BudgetCategory
}

export interface ExpenseWithDetails extends Expense {
  category?: BudgetCategory
  budget?: {
    id: string
    name: string
  }
} 