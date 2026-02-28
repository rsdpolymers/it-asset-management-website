'use client'

import { useMemo } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { Package, CheckCircle, AlertCircle, Wrench, Trash2, RotateCcw, Loader2 } from 'lucide-react'
import { useAssets } from '@/hooks/use-assets'

function SummaryCard({ title, value, icon: Icon, color }: { title: string; value: number; icon: React.ReactNode; color: string }) {
  return (
    <Card className="border-border">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value.toLocaleString()}</p>
          </div>
          <div className={`p-3 rounded-lg ${color}`}>
            {Icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const { assets, isLoading } = useAssets()

  // Calculate dashboard statistics
  const dashboardStats = useMemo(() => {
    return {
      totalAssets: assets.length,
      assigned: assets.filter((a) => a.status === 'Assigned').length,
      inStock: assets.filter((a) => a.status === 'In Stock').length,
      underRepair: assets.filter((a) => a.status === 'Under Repair').length,
      scrap: assets.filter((a) => a.status === 'Scrap').length,
      returned: assets.filter((a) => a.status === 'Returned').length,
    }
  }, [assets])

  // Device type distribution
  const deviceTypeData = useMemo(() => {
    const types = new Map<string, number>()
    assets.forEach((asset) => {
      types.set(asset.deviceType, (types.get(asset.deviceType) || 0) + 1)
    })

    const colors = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#ec4899']
    let colorIndex = 0

    return Array.from(types.entries()).map(([name, value]) => ({
      name,
      value,
      color: colors[colorIndex++ % colors.length],
    }))
  }, [assets])

  // Location distribution
  const locationData = useMemo(() => {
    const locations = new Map<string, number>()
    assets.forEach((asset) => {
      locations.set(asset.location, (locations.get(asset.location) || 0) + 1)
    })
    return Array.from(locations.entries()).map(([name, count]) => ({ name, count }))
  }, [assets])

  // Status distribution for bar chart
  const statusData = useMemo(() => {
    return [
      { name: 'Assigned', count: dashboardStats.assigned },
      { name: 'In Stock', count: dashboardStats.inStock },
      { name: 'Under Repair', count: dashboardStats.underRepair },
      { name: 'Scrap', count: dashboardStats.scrap },
      { name: 'Returned', count: dashboardStats.returned },
    ]
  }, [dashboardStats])

  if (isLoading) {
    return (
      <AppLayout>
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </main>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <main className="flex-1 space-y-6 md:space-y-8 px-4 md:px-6 pb-8">

        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Dashboard
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Overview of your IT asset management system
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          <SummaryCard
            title="Total Assets"
            value={dashboardStats.totalAssets}
            icon={<Package className="w-5 h-5 md:w-6 md:h-6 text-primary" />}
            color="bg-blue-100 dark:bg-blue-900"
          />
          <SummaryCard
            title="Assigned"
            value={dashboardStats.assigned}
            icon={<CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-green-600" />}
            color="bg-green-100 dark:bg-green-900"
          />
          <SummaryCard
            title="In Stock"
            value={dashboardStats.inStock}
            icon={<AlertCircle className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />}
            color="bg-blue-100 dark:bg-blue-900"
          />
          <SummaryCard
            title="Under Repair"
            value={dashboardStats.underRepair}
            icon={<Wrench className="w-5 h-5 md:w-6 md:h-6 text-orange-600" />}
            color="bg-orange-100 dark:bg-orange-900"
          />
          <SummaryCard
            title="Scrap"
            value={dashboardStats.scrap}
            icon={<Trash2 className="w-5 h-5 md:w-6 md:h-6 text-red-600" />}
            color="bg-red-100 dark:bg-red-900"
          />
          <SummaryCard
            title="Returned"
            value={dashboardStats.returned}
            icon={<RotateCcw className="w-5 h-5 md:w-6 md:h-6 text-gray-600" />}
            color="bg-gray-100 dark:bg-gray-900"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

          {/* Status Distribution */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Asset Status Distribution</CardTitle>
              <CardDescription>
                Count of assets by status
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] md:h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="name"
                    stroke="hsl(var(--muted-foreground))"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem',
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="hsl(var(--primary))"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Device Type Distribution */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Device Type Distribution</CardTitle>
              <CardDescription>
                Assets by device category
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] md:h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deviceTypeData}
                    cx="50%"
                    cy="50%"
                    outerRadius="80%"
                    dataKey="value"
                    labelLine={false}
                  >
                    {deviceTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Location Distribution */}
          <Card className="xl:col-span-2 w-full">
            <CardHeader>
              <CardTitle>Assets by Location</CardTitle>
              <CardDescription>
                Distribution across office locations and warehouse
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] md:h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={locationData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    type="number"
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke="hsl(var(--muted-foreground))"
                    width={100}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem',
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="hsl(var(--accent))"
                    radius={[0, 8, 8, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Asset Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Asset Summary</CardTitle>
            <CardDescription>
              Quick overview of asset inventory
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm md:text-base">
              <div>
                <p className="text-muted-foreground mb-1">
                  Total Device Types
                </p>
                <p className="text-lg md:text-xl font-semibold">
                  {deviceTypeData.length}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">
                  Total Locations
                </p>
                <p className="text-lg md:text-xl font-semibold">
                  {locationData.length}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">
                  Average per Location
                </p>
                <p className="text-lg md:text-xl font-semibold">
                  {Math.round(
                    dashboardStats.totalAssets /
                    (locationData.length || 1)
                  )}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">
                  Utilization Rate
                </p>
                <p className="text-lg md:text-xl font-semibold">
                  {dashboardStats.totalAssets > 0
                    ? Math.round(
                      (dashboardStats.assigned /
                        dashboardStats.totalAssets) *
                      100
                    )
                    : 0}
                  %
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </AppLayout>
  )
}
