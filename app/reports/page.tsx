'use client'

import { useMemo } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { Loader2 } from 'lucide-react'
import { useAssets } from '@/hooks/use-assets'
import { useEmployees } from '@/hooks/use-employees'

export default function ReportsPage() {
  const { assets, isLoading: assetsLoading } = useAssets()
  const { employees } = useEmployees()

  // Employee-wise asset count
  const employeeAssets = useMemo(() => {
    const empAssets = new Map<string, number>()
    assets.forEach((asset) => {
      if (asset.status === 'Assigned' && asset.assignedTo) {
        empAssets.set(asset.assignedTo, (empAssets.get(asset.assignedTo) || 0) + 1)
      }
    })

    return Array.from(empAssets.entries())
      .map(([empId, count]) => {
        const emp = employees.find((e) => e._id === empId)
        return {
          empId,
          name: emp?.name || 'Unknown',
          count,
        }
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  }, [assets, employees])

  // Device type summary
  const deviceTypeSummary = useMemo(() => {
    const types = new Map<string, { total: number; assigned: number; inStock: number; repair: number; scrap: number }>()

    assets.forEach((asset) => {
      if (!types.has(asset.deviceType)) {
        types.set(asset.deviceType, { total: 0, assigned: 0, inStock: 0, repair: 0, scrap: 0 })
      }

      const entry = types.get(asset.deviceType)!
      entry.total++

      if (asset.status === 'Assigned') entry.assigned++
      else if (asset.status === 'In Stock') entry.inStock++
      else if (asset.status === 'Under Repair') entry.repair++
      else if (asset.status === 'Scrap') entry.scrap++
    })

    return Array.from(types.entries())
      .map(([type, stats]) => ({
        type,
        ...stats,
      }))
      .sort((a, b) => b.total - a.total)
  }, [assets])

  // Department distribution
  const departmentData = useMemo(() => {
    const depts = new Map<string, number>()
    assets.forEach((asset) => {
      if (asset.department) {
        depts.set(asset.department, (depts.get(asset.department) || 0) + 1)
      }
    })

    return Array.from(depts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
  }, [assets])

  // Location summary
  const locationSummary = useMemo(() => {
    const locations = new Map<string, { total: number; assigned: number; inStock: number; repair: number }>()

    assets.forEach((asset) => {
      if (!locations.has(asset.location)) {
        locations.set(asset.location, { total: 0, assigned: 0, inStock: 0, repair: 0 })
      }

      const entry = locations.get(asset.location)!
      entry.total++

      if (asset.status === 'Assigned') entry.assigned++
      else if (asset.status === 'In Stock') entry.inStock++
      else if (asset.status === 'Under Repair') entry.repair++
    })

    return Array.from(locations.entries())
      .map(([location, stats]) => ({
        location,
        ...stats,
      }))
      .sort((a, b) => b.total - a.total)
  }, [assets])

  // Asset age analysis (based on purchase date)
  const assetAgeData = useMemo(() => {
    const now = new Date()
    const ages = {
      'Less than 1 year': 0,
      '1-2 years': 0,
      '2-3 years': 0,
      '3-5 years': 0,
      '5+ years': 0,
    }

    assets.forEach((asset) => {
      const purchaseDate = new Date(asset.purchaseDate)
      const ageInYears = (now.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25)

      if (ageInYears < 1) ages['Less than 1 year']++
      else if (ageInYears < 2) ages['1-2 years']++
      else if (ageInYears < 3) ages['2-3 years']++
      else if (ageInYears < 5) ages['3-5 years']++
      else ages['5+ years']++
    })

    return Object.entries(ages).map(([name, count]) => ({ name, count }))
  }, [assets])

  // Colors for charts
  const colors = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#ec4899']

  if (assetsLoading) {
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
      <main className="flex-1 px-4 md:px-6 pb-8 space-y-6 md:space-y-8">

        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Reports
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Detailed analysis and insights on IT assets
          </p>
        </div>

        {/* Employee-wise Assets */}
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Employees with Most Assets</CardTitle>
            <CardDescription>
              Distribution of assigned assets by employee
            </CardDescription>
          </CardHeader>
          <CardContent>
            {employeeAssets.length === 0 ? (
              <p className="text-muted-foreground">No assigned assets</p>
            ) : (
              <div className="w-full overflow-x-auto">
                <Table className="min-w-[500px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee Name</TableHead>
                      <TableHead className="text-right">
                        Assets Assigned
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employeeAssets.map((emp) => (
                      <TableRow key={emp.empId}>
                        <TableCell>{emp.name}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="secondary">
                            {emp.count}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Device Type Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Device Type Summary</CardTitle>
            <CardDescription>
              Status breakdown by device type
            </CardDescription>
          </CardHeader>
          <CardContent>
            {deviceTypeSummary.length === 0 ? (
              <p className="text-muted-foreground">No devices found</p>
            ) : (
              <div className="w-full overflow-x-auto">
                <Table className="min-w-[900px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Device Type</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Assigned</TableHead>
                      <TableHead className="text-right">In Stock</TableHead>
                      <TableHead className="text-right">Under Repair</TableHead>
                      <TableHead className="text-right">Scrap</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deviceTypeSummary.map((device) => (
                      <TableRow key={device.type}>
                        <TableCell className="font-medium">
                          {device.type}
                        </TableCell>
                        <TableCell className="text-right">
                          {device.total}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            {device.assigned}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {device.inStock}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                            {device.repair}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                            {device.scrap}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

          {/* Department Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Assets by Department</CardTitle>
              <CardDescription>
                Count of assets per department
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] md:h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentData}>
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

          {/* Asset Age Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Asset Age Distribution</CardTitle>
              <CardDescription>
                Assets by age group
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] md:h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={assetAgeData}
                    cx="50%"
                    cy="50%"
                    outerRadius="80%"
                    dataKey="count"
                    labelLine={false}
                  >
                    {assetAgeData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={colors[index % colors.length]}
                      />
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
        </div>

        {/* Location Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Location Summary</CardTitle>
            <CardDescription>
              Asset status by location
            </CardDescription>
          </CardHeader>
          <CardContent>
            {locationSummary.length === 0 ? (
              <p className="text-muted-foreground">No locations found</p>
            ) : (
              <div className="w-full overflow-x-auto">
                <Table className="min-w-[700px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Location</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Assigned</TableHead>
                      <TableHead className="text-right">In Stock</TableHead>
                      <TableHead className="text-right">Under Repair</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {locationSummary.map((loc) => (
                      <TableRow key={loc.location}>
                        <TableCell className="font-medium">
                          {loc.location}
                        </TableCell>
                        <TableCell className="text-right">
                          {loc.total}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            {loc.assigned}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {loc.inStock}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                            {loc.repair}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

      </main>
    </AppLayout>
  )
}
