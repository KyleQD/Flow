import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authenticateApiRequest, checkAdminPermissions } from '@/lib/auth/api-auth'

// Validation schemas
const createBudgetSchema = z.object({
  tour_id: z.string().uuid('Invalid tour ID').optional(),
  event_id: z.string().uuid('Invalid event ID').optional(),
  category_id: z.string().uuid('Invalid category ID'),
  name: z.string().min(1, 'Budget name is required'),
  budgeted_amount: z.number().min(0, 'Budgeted amount must be non-negative'),
  currency: z.string().default('USD'),
  period_start: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid start date').optional(),
  period_end: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid end date').optional(),
  notes: z.string().optional()
})

const createExpenseSchema = z.object({
  budget_id: z.string().uuid('Invalid budget ID').optional(),
  category_id: z.string().uuid('Invalid category ID'),
  tour_id: z.string().uuid('Invalid tour ID').optional(),
  event_id: z.string().uuid('Invalid event ID').optional(),
  description: z.string().min(1, 'Description is required'),
  amount: z.number().min(0, 'Amount must be non-negative'),
  currency: z.string().default('USD'),
  expense_date: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid expense date'),
  vendor: z.string().optional(),
  payment_method: z.string().optional(),
  receipt_url: z.string().url('Invalid receipt URL').optional(),
  metadata: z.record(z.any()).optional()
})

const createRevenueSchema = z.object({
  event_id: z.string().uuid('Invalid event ID').optional(),
  tour_id: z.string().uuid('Invalid tour ID').optional(),
  source: z.string().min(1, 'Revenue source is required'),
  description: z.string().min(1, 'Description is required'),
  amount: z.number().min(0, 'Amount must be non-negative'),
  currency: z.string().default('USD'),
  revenue_date: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid revenue date'),
  payment_received: z.boolean().default(false),
  payment_date: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid payment date').optional(),
  fees: z.number().min(0).default(0),
  metadata: z.record(z.any()).optional()
})

export async function GET(request: NextRequest) {
  try {
    console.log('[Admin Finances API] GET request started')
    
    const authResult = await authenticateApiRequest(request)
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { user, supabase } = authResult

    // Check admin permissions
    const hasAdminAccess = await checkAdminPermissions(user)
    if (!hasAdminAccess) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'budgets' // 'budgets', 'expenses', 'revenue', 'analytics', 'categories'
    const event_id = searchParams.get('event_id')
    const tour_id = searchParams.get('tour_id')
    const category_id = searchParams.get('category_id')
    const status = searchParams.get('status')
    const period = searchParams.get('period') || 'month' // 'week', 'month', 'quarter', 'year'
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (type === 'categories') {
      // Fetch budget categories
      const { data: categories, error } = await supabase
        .from('budget_categories')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (error) {
        console.error('[Admin Finances API] Error fetching categories:', error)
        if (error.code === '42P01') {
          return NextResponse.json({ categories: [] })
        }
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
      }

      return NextResponse.json({ categories: categories || [] })

    } else if (type === 'budgets') {
      // Fetch budgets
      let query = supabase
        .from('budgets')
        .select(`
          *,
          budget_categories:category_id (
            id,
            name,
            description
          )
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (event_id) {
        query = query.eq('event_id', event_id)
      }
      if (tour_id) {
        query = query.eq('tour_id', tour_id)
      }
      if (category_id) {
        query = query.eq('category_id', category_id)
      }
      if (status && status !== 'all') {
        query = query.eq('status', status)
      }

      const { data: budgets, error } = await query

      if (error) {
        console.error('[Admin Finances API] Error fetching budgets:', error)
        if (error.code === '42P01') {
          return NextResponse.json({ budgets: [], total: 0 })
        }
        return NextResponse.json({ error: 'Failed to fetch budgets' }, { status: 500 })
      }

      // Get total count
      let countQuery = supabase
        .from('budgets')
        .select('*', { count: 'exact', head: true })

      if (event_id) countQuery = countQuery.eq('event_id', event_id)
      if (tour_id) countQuery = countQuery.eq('tour_id', tour_id)
      if (category_id) countQuery = countQuery.eq('category_id', category_id)
      if (status && status !== 'all') countQuery = countQuery.eq('status', status)

      const { count } = await countQuery

      return NextResponse.json({ 
        budgets: budgets || [], 
        total: count || 0,
        limit,
        offset 
      })

    } else if (type === 'expenses') {
      // Fetch expenses
      let query = supabase
        .from('expenses')
        .select(`
          *,
          budget_categories:category_id (
            id,
            name,
            description
          ),
          budgets:budget_id (
            id,
            name
          )
        `)
        .order('expense_date', { ascending: false })
        .range(offset, offset + limit - 1)

      if (event_id) {
        query = query.eq('event_id', event_id)
      }
      if (tour_id) {
        query = query.eq('tour_id', tour_id)
      }
      if (category_id) {
        query = query.eq('category_id', category_id)
      }
      if (status && status !== 'all') {
        query = query.eq('status', status)
      }

      const { data: expenses, error } = await query

      if (error) {
        console.error('[Admin Finances API] Error fetching expenses:', error)
        if (error.code === '42P01') {
          return NextResponse.json({ expenses: [], total: 0 })
        }
        return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 })
      }

      // Get total count
      let countQuery = supabase
        .from('expenses')
        .select('*', { count: 'exact', head: true })

      if (event_id) countQuery = countQuery.eq('event_id', event_id)
      if (tour_id) countQuery = countQuery.eq('tour_id', tour_id)
      if (category_id) countQuery = countQuery.eq('category_id', category_id)
      if (status && status !== 'all') countQuery = countQuery.eq('status', status)

      const { count } = await countQuery

      return NextResponse.json({ 
        expenses: expenses || [], 
        total: count || 0,
        limit,
        offset 
      })

    } else if (type === 'revenue') {
      // Fetch revenue
      let query = supabase
        .from('revenue')
        .select('*')
        .order('revenue_date', { ascending: false })
        .range(offset, offset + limit - 1)

      if (event_id) {
        query = query.eq('event_id', event_id)
      }
      if (tour_id) {
        query = query.eq('tour_id', tour_id)
      }

      const { data: revenue, error } = await query

      if (error) {
        console.error('[Admin Finances API] Error fetching revenue:', error)
        if (error.code === '42P01') {
          return NextResponse.json({ revenue: [], total: 0 })
        }
        return NextResponse.json({ error: 'Failed to fetch revenue' }, { status: 500 })
      }

      // Get total count
      let countQuery = supabase
        .from('revenue')
        .select('*', { count: 'exact', head: true })

      if (event_id) countQuery = countQuery.eq('event_id', event_id)
      if (tour_id) countQuery = countQuery.eq('tour_id', tour_id)

      const { count } = await countQuery

      return NextResponse.json({ 
        revenue: revenue || [], 
        total: count || 0,
        limit,
        offset 
      })

    } else if (type === 'analytics') {
      // Fetch financial analytics
      try {
        // Calculate date range based on period
        const now = new Date()
        let startDate = new Date()
        
        switch (period) {
          case 'week':
            startDate.setDate(now.getDate() - 7)
            break
          case 'month':
            startDate.setMonth(now.getMonth() - 1)
            break
          case 'quarter':
            startDate.setMonth(now.getMonth() - 3)
            break
          case 'year':
            startDate.setFullYear(now.getFullYear() - 1)
            break
          default:
            startDate.setMonth(now.getMonth() - 1)
        }

        // Revenue summary
        const { data: revenueData } = await supabase
          .from('revenue')
          .select('amount, net_amount, revenue_date, source')
          .gte('revenue_date', startDate.toISOString().split('T')[0])

        // Expenses summary
        const { data: expensesData } = await supabase
          .from('expenses')
          .select('amount, expense_date, category_id, budget_categories:category_id(name)')
          .eq('status', 'paid')
          .gte('expense_date', startDate.toISOString().split('T')[0])

        // Budget vs actual
        const { data: budgetData } = await supabase
          .from('budgets')
          .select('budgeted_amount, actual_amount, category_id, budget_categories:category_id(name)')
          .eq('status', 'active')

        // Calculate totals
        const totalRevenue = revenueData?.reduce((sum: number, item: any) => sum + parseFloat(item.amount), 0) || 0
        const totalNetRevenue = revenueData?.reduce((sum: number, item: any) => sum + parseFloat(item.net_amount), 0) || 0
        const totalExpenses = expensesData?.reduce((sum: number, item: any) => sum + parseFloat(item.amount), 0) || 0
        const netProfit = totalNetRevenue - totalExpenses

        // Revenue by source
        const revenueBySource = revenueData?.reduce((acc: Record<string, number>, item: any) => {
          acc[item.source] = (acc[item.source] || 0) + parseFloat(item.amount)
          return acc
        }, {}) || {}

        // Expenses by category
        const expensesByCategory = expensesData?.reduce((acc: Record<string, number>, item: any) => {
          const categoryName = item.budget_categories?.name || 'Uncategorized'
          acc[categoryName] = (acc[categoryName] || 0) + parseFloat(item.amount)
          return acc
        }, {}) || {}

        // Daily trends
        const dailyRevenue = revenueData?.reduce((acc: Record<string, number>, item: any) => {
          const date = item.revenue_date
          acc[date] = (acc[date] || 0) + parseFloat(item.amount)
          return acc
        }, {}) || {}

        const dailyExpenses = expensesData?.reduce((acc: Record<string, number>, item: any) => {
          const date = item.expense_date
          acc[date] = (acc[date] || 0) + parseFloat(item.amount)
          return acc
        }, {}) || {}

        // Budget performance
        const budgetPerformance = budgetData?.map((budget: any) => ({
          category: budget.budget_categories?.name || 'Unknown',
          budgeted: parseFloat(budget.budgeted_amount),
          actual: parseFloat(budget.actual_amount || 0),
          variance: parseFloat(budget.budgeted_amount) - parseFloat(budget.actual_amount || 0),
          variance_percent: budget.budgeted_amount > 0 
            ? ((parseFloat(budget.budgeted_amount) - parseFloat(budget.actual_amount || 0)) / parseFloat(budget.budgeted_amount)) * 100
            : 0
        })) || []

        return NextResponse.json({
          analytics: {
            summary: {
              total_revenue: totalRevenue,
              total_net_revenue: totalNetRevenue,
              total_expenses: totalExpenses,
              net_profit: netProfit,
              profit_margin: totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0
            },
            revenue_by_source: revenueBySource,
            expenses_by_category: expensesByCategory,
            daily_trends: {
              revenue: dailyRevenue,
              expenses: dailyExpenses
            },
            budget_performance: budgetPerformance,
            period: period
          }
        })

      } catch (error) {
        console.error('[Admin Finances API] Error fetching analytics:', error)
        return NextResponse.json({ 
          analytics: { 
            summary: {}, 
            revenue_by_source: {}, 
            expenses_by_category: {},
            daily_trends: { revenue: {}, expenses: {} },
            budget_performance: []
          } 
        })
      }

    } else {
      return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }

  } catch (error) {
    console.error('[Admin Finances API] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('[Admin Finances API] POST request started')
    
    const authResult = await authenticateApiRequest(request)
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { user, supabase } = authResult

    // Check admin permissions
    const hasAdminAccess = await checkAdminPermissions(user)
    if (!hasAdminAccess) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { action, ...data } = body

    if (action === 'create_budget') {
      const validatedData = createBudgetSchema.parse(data)

      // Validate that either event_id or tour_id is provided
      if (!validatedData.event_id && !validatedData.tour_id) {
        return NextResponse.json({ error: 'Either event_id or tour_id is required' }, { status: 400 })
      }

      // Validate period dates
      if (validatedData.period_start && validatedData.period_end) {
        const startDate = new Date(validatedData.period_start)
        const endDate = new Date(validatedData.period_end)
        
        if (endDate <= startDate) {
          return NextResponse.json({ error: 'Period end date must be after start date' }, { status: 400 })
        }
      }

      const { data: budget, error } = await supabase
        .from('budgets')
        .insert({
          ...validatedData,
          actual_amount: 0,
          status: 'active',
          created_by: user.id
        })
        .select('*')
        .single()

      if (error) {
        console.error('[Admin Finances API] Error creating budget:', error)
        if (error.code === '42P01') {
          return NextResponse.json({ error: 'Financial management system not set up. Please run database migrations.' }, { status: 500 })
        }
        return NextResponse.json({ error: 'Failed to create budget' }, { status: 500 })
      }

      console.log('[Admin Finances API] Successfully created budget:', budget.id)
      return NextResponse.json({ budget }, { status: 201 })

    } else if (action === 'create_expense') {
      const validatedData = createExpenseSchema.parse(data)

      const { data: expense, error } = await supabase
        .from('expenses')
        .insert({
          ...validatedData,
          status: 'pending',
          submitted_by: user.id
        })
        .select('*')
        .single()

      if (error) {
        console.error('[Admin Finances API] Error creating expense:', error)
        return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 })
      }

      // Update budget actual amount if budget_id is provided
      if (validatedData.budget_id) {
        await supabase
          .rpc('update_budget_actual', {
            budget_id: validatedData.budget_id,
            amount_to_add: validatedData.amount
          })
      }

      console.log('[Admin Finances API] Successfully created expense:', expense.id)
      return NextResponse.json({ expense }, { status: 201 })

    } else if (action === 'create_revenue') {
      const validatedData = createRevenueSchema.parse(data)

      // Validate that either event_id or tour_id is provided
      if (!validatedData.event_id && !validatedData.tour_id) {
        return NextResponse.json({ error: 'Either event_id or tour_id is required' }, { status: 400 })
      }

      const { data: revenue, error } = await supabase
        .from('revenue')
        .insert(validatedData)
        .select('*')
        .single()

      if (error) {
        console.error('[Admin Finances API] Error creating revenue:', error)
        return NextResponse.json({ error: 'Failed to create revenue record' }, { status: 500 })
      }

      console.log('[Admin Finances API] Successfully created revenue:', revenue.id)
      return NextResponse.json({ revenue }, { status: 201 })

    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 })
    }

    console.error('[Admin Finances API] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('[Admin Finances API] PUT request started')
    
    const authResult = await authenticateApiRequest(request)
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { user, supabase } = authResult

    // Check admin permissions
    const hasAdminAccess = await checkAdminPermissions(user)
    if (!hasAdminAccess) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { id, type, ...updateData } = body

    if (!id || !type) {
      return NextResponse.json({ error: 'ID and type are required' }, { status: 400 })
    }

    if (type === 'expense') {
      const { status: expenseStatus, approved_by } = updateData

      if (expenseStatus && !['pending', 'approved', 'paid', 'rejected'].includes(expenseStatus)) {
        return NextResponse.json({ error: 'Invalid expense status' }, { status: 400 })
      }

      const updateFields: any = {}
      if (expenseStatus) updateFields.status = expenseStatus
      if (approved_by) updateFields.approved_by = approved_by
      if (expenseStatus === 'approved') updateFields.approved_at = new Date().toISOString()
      if (expenseStatus === 'paid') updateFields.paid_at = new Date().toISOString()

      const { data: updatedExpense, error } = await supabase
        .from('expenses')
        .update(updateFields)
        .eq('id', id)
        .select('*')
        .single()

      if (error) {
        console.error('[Admin Finances API] Error updating expense:', error)
        return NextResponse.json({ error: 'Failed to update expense' }, { status: 500 })
      }

      if (!updatedExpense) {
        return NextResponse.json({ error: 'Expense not found' }, { status: 404 })
      }

      return NextResponse.json({ expense: updatedExpense })

    } else if (type === 'budget') {
      const { status: budgetStatus, approved_by } = updateData

      if (budgetStatus && !['active', 'completed', 'cancelled'].includes(budgetStatus)) {
        return NextResponse.json({ error: 'Invalid budget status' }, { status: 400 })
      }

      const updateFields: any = {}
      if (budgetStatus) updateFields.status = budgetStatus
      if (approved_by) {
        updateFields.approved_by = approved_by
        updateFields.approved_at = new Date().toISOString()
      }

      const { data: updatedBudget, error } = await supabase
        .from('budgets')
        .update(updateFields)
        .eq('id', id)
        .select('*')
        .single()

      if (error) {
        console.error('[Admin Finances API] Error updating budget:', error)
        return NextResponse.json({ error: 'Failed to update budget' }, { status: 500 })
      }

      if (!updatedBudget) {
        return NextResponse.json({ error: 'Budget not found' }, { status: 404 })
      }

      return NextResponse.json({ budget: updatedBudget })

    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }

  } catch (error) {
    console.error('[Admin Finances API] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 