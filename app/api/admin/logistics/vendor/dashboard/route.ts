import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const vendorId = searchParams.get("vendorId")
    const siteMapId = searchParams.get("siteMapId")
    const period = searchParams.get("period") || "month"

    if (!vendorId) {
      return NextResponse.json({ error: "Vendor ID is required" }, { status: 400 })
    }

    // Get vendor dashboard statistics
    const { data: stats, error: statsError } = await supabase
      .from("equipment_instances")
      .select(`
        id,
        status,
        rental_rate,
        catalog:equipment_catalog!inner(
          vendor_id
        )
      `)
      .eq("catalog.vendor_id", vendorId)

    if (statsError) {
      console.error("Error fetching vendor stats:", statsError)
      return NextResponse.json({ error: "Failed to fetch vendor statistics" }, { status: 500 })
    }

    // Calculate statistics
    const totalEquipment = stats?.length || 0
    const availableEquipment = stats?.filter(item => item.status === 'available').length || 0
    const inUseEquipment = stats?.filter(item => item.status === 'in_use').length || 0
    const maintenanceEquipment = stats?.filter(item => item.status === 'maintenance').length || 0
    const totalValue = stats?.reduce((sum, item) => sum + (item.rental_rate || 0), 0) || 0
    const utilizationRate = totalEquipment > 0 ? Math.round((inUseEquipment / totalEquipment) * 100) : 0

    // Get recent activity
    const { data: recentActivity, error: activityError } = await supabase
      .from("site_map_activity_log")
      .select(`
        id,
        action,
        details,
        created_at,
        user:profiles!inner(
          full_name,
          avatar_url
        )
      `)
      .eq("site_map_id", siteMapId || "")
      .order("created_at", { ascending: false })
      .limit(10)

    // Get active workflows
    const { data: workflows, error: workflowsError } = await supabase
      .from("equipment_setup_workflows")
      .select(`
        id,
        name,
        status,
        progress:equipment_setup_tasks(
          status
        )
      `)
      .eq("site_map_id", siteMapId || "")
      .in("status", ["planned", "in_progress"])

    const dashboardData = {
      stats: {
        totalEvents: 24, // Mock data - replace with actual query
        activeEquipment: totalEquipment,
        completedSetups: 18, // Mock data
        revenueThisMonth: totalValue,
        pendingTasks: workflows?.length || 0,
        equipmentUtilization: utilizationRate,
        averageSetupTime: 4.2, // Mock data
        customerSatisfaction: 4.8 // Mock data
      },
      recentActivity: recentActivity || [],
      activeWorkflows: workflows || [],
      equipmentStatus: stats?.map(item => ({
        id: item.id,
        status: item.status,
        utilizationRate: Math.floor(Math.random() * 100), // Mock data
        lastUsed: new Date(Date.now() - Math.random() * 86400000).toISOString()
      })) || []
    }

    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error("Error in vendor dashboard API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { vendorId, action, data } = body

    if (!vendorId) {
      return NextResponse.json({ error: "Vendor ID is required" }, { status: 400 })
    }

    // Handle different dashboard actions
    switch (action) {
      case "update_settings":
        // Update vendor settings logic here
        return NextResponse.json({ success: true, message: "Settings updated" })
      
      case "export_report":
        // Generate and return report data
        return NextResponse.json({ success: true, reportData: {} })
      
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error in vendor dashboard POST API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
