"use client"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Plus, Store, ShoppingCart, BarChart2, Link2 } from "lucide-react"

function ProductGrid() {
  return <div className="text-gray-400">Product grid coming soon...</div>
}

function OrdersTable() {
  return <div className="text-gray-400">Orders table coming soon...</div>
}

function IntegrationCards() {
  return <div className="text-gray-400">Integrations (Shopify, Printful, etc.) coming soon...</div>
}

function StoreAnalytics() {
  return <div className="text-gray-400">Store analytics coming soon...</div>
}

export default function ArtistStorePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent flex items-center gap-3">
        <Store className="h-7 w-7 text-purple-500" />
        Artist Store
      </h1>
              <p className="text-sm text-slate-400">Sell your merchandise and manage products</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto py-8">
      <Tabs defaultValue="products" className="w-full">
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="products">
          <div className="flex justify-end mb-4">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>
          <ProductGrid />
        </TabsContent>
        <TabsContent value="orders">
          <OrdersTable />
        </TabsContent>
        <TabsContent value="integrations">
          <IntegrationCards />
        </TabsContent>
        <TabsContent value="analytics">
          <StoreAnalytics />
        </TabsContent>
      </Tabs>
      </div>
    </div>
  )
} 