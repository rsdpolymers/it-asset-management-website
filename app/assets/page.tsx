'use client'

import { useState, useMemo } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Plus, Search, Trash2, Edit2, Loader2 } from 'lucide-react'
import { AssetModal } from '@/components/modals/asset-modal'
import { Asset } from '@/lib/validation'
import { useAssets } from '@/hooks/use-assets'
import { useEmployees } from '@/hooks/use-employees'
import { useToast } from '@/hooks/use-toast'

export default function AssetsPage() {
  const { assets, isLoading, addAsset, updateAsset, deleteAsset, refetch } = useAssets()
  const { employees } = useEmployees()
  const { toast } = useToast()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState<(Asset & { _id: string }) | undefined>()

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [filterDeviceType, setFilterDeviceType] = useState('')
  const [filterLocation, setFilterLocation] = useState('')

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  /**
   * Filter assets
   */
  const filteredAssets = useMemo(() => {
    if (!assets?.length) return []

    return assets.filter((asset) => {
      const query = searchQuery.toLowerCase()

      const matchesSearch =
        !query ||
        asset.assetTag?.toLowerCase().includes(query) ||
        asset.serialNumber?.toLowerCase().includes(query) ||
        asset.brand?.toLowerCase().includes(query) ||
        asset.model?.toLowerCase().includes(query)

      const matchesStatus =
        statusFilter === 'all' || asset.status === statusFilter

      const matchesDeviceType =
        !filterDeviceType || asset.deviceType === filterDeviceType

      const matchesLocation =
        !filterLocation || asset.location === filterLocation

      return (
        matchesSearch &&
        matchesStatus &&
        matchesDeviceType &&
        matchesLocation
      )
    })
  }, [assets, searchQuery, statusFilter, filterDeviceType, filterLocation])

  /**
   * Status colors
   */
  const statusColors: Record<string, string> = {
    Assigned: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'In Stock': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'Under Repair': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    Scrap: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    Returned: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  }

  /**
   * Open Modal
   */
  const handleOpenModal = (asset?: Asset & { _id: string }) => {
    setSelectedAsset(asset)
    setIsModalOpen(true)
  }

  /**
   * Close Modal
   */
  const handleCloseModal = () => {
    setSelectedAsset(undefined)
    setIsModalOpen(false)
  }

  /**
   * Add / Update Asset
   */
  const handleSubmitAsset = async (data: Asset) => {
    try {
      if (selectedAsset?._id) {
        await updateAsset(selectedAsset._id, data)

        toast({
          title: 'Success',
          description: 'Asset updated successfully',
        })
      } else {
        await addAsset(data)

        toast({
          title: 'Success',
          description: 'Asset added successfully',
        })
      }

      refetch()
      handleCloseModal()

    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Something went wrong',
        variant: 'destructive',
      })
    }
  }

  /**
   * Delete
   */
  const handleDeleteClick = (id: string) => {
    setDeleteTarget(id)
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return

    setIsDeleting(true)

    try {
      await deleteAsset(deleteTarget)

      toast({
        title: 'Success',
        description: 'Asset deleted successfully',
      })

      setDeleteTarget(null)
      refetch()

    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to delete asset',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  /**
   * Unique filter options
   */
  const uniqueDeviceTypes = useMemo(() => {
    return Array.from(
      new Set(assets.map((a) => a.deviceType).filter(Boolean))
    ) as string[]
  }, [assets])

  const uniqueLocations = useMemo(() => {
    return Array.from(
      new Set(assets.map((a) => a.location).filter(Boolean))
    ) as string[]
  }, [assets])

  return (
    <AppLayout>
      <main className="flex-1 space-y-6 p-4 md:p-6 lg:p-8">

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Assets</h1>
            <p className="text-muted-foreground">Manage all IT assets</p>
          </div>

          <Button onClick={() => handleOpenModal()} className="gap-2 w-full sm:w-auto">
            <Plus className="w-4 h-4" />
            Add Asset
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search assets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">

              {/* Status */}
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Assigned">Assigned</SelectItem>
                    <SelectItem value="In Stock">In Stock</SelectItem>
                    <SelectItem value="Under Repair">Under Repair</SelectItem>
                    <SelectItem value="Scrap">Scrap</SelectItem>
                    <SelectItem value="Returned">Returned</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Device Type */}
              <div className="space-y-2">
                <Label>Device Type</Label>

                <Select
                  value={filterDeviceType || 'all'}
                  onValueChange={(value) =>
                    setFilterDeviceType(value === 'all' ? '' : value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>

                    {uniqueDeviceTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label>Location</Label>

                <Select
                  value={filterLocation || 'all'}
                  onValueChange={(value) =>
                    setFilterLocation(value === 'all' ? '' : value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>

                    {uniqueLocations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Clear */}
              <div className="flex items-end">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setSearchQuery('')
                    setStatusFilter('all')
                    setFilterDeviceType('')
                    setFilterLocation('')
                  }}
                >
                  Clear Filters
                </Button>
              </div>

            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Assets</CardTitle>
            <CardDescription>{filteredAssets.length} assets found</CardDescription>
          </CardHeader>

          <CardContent className="overflow-x-auto">

            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin" />
              </div>
            ) : (

              <Table>

                <TableHeader>
                  <TableRow>
                    <TableHead>Asset Tag</TableHead>
                    <TableHead className="hidden md:table-cell">Device</TableHead>
                    <TableHead className="hidden lg:table-cell">Brand</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Assigned</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>

                  {filteredAssets.map((asset) => {

                    const employee = employees.find(
                      (e) => e._id === asset.assignedTo
                    )

                    return (
                      <TableRow key={asset._id}>

                        <TableCell className="font-medium">
                          {asset.assetTag}
                        </TableCell>

                        <TableCell className="hidden md:table-cell">
                          {asset.deviceType}
                        </TableCell>

                        <TableCell className="hidden lg:table-cell">
                          {asset.brand}
                        </TableCell>

                        <TableCell>
                          {asset.location}
                        </TableCell>

                        <TableCell>
                          <Badge className={asset.status ? statusColors[asset.status] : ''}>
                            {asset.status}
                          </Badge>
                        </TableCell>

                        <TableCell className="max-w-[160px] truncate hidden md:table-cell">
                          {employee?.name || '-'}
                        </TableCell>

                        <TableCell className="text-right space-x-2">

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenModal(asset)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive"
                            onClick={() => handleDeleteClick(asset._id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>

                        </TableCell>

                      </TableRow>
                    )
                  })}

                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Modal */}
        <AssetModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleSubmitAsset}
          initialData={selectedAsset}
          employees={employees}
        />

        {/* Delete Dialog */}
        <AlertDialog open={!!deleteTarget}>
          <AlertDialogContent>

            <AlertDialogHeader>
              <AlertDialogTitle>Delete Asset?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="flex justify-end gap-2">

              <AlertDialogCancel onClick={() => setDeleteTarget(null)}>
                Cancel
              </AlertDialogCancel>

              <AlertDialogAction
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Delete
              </AlertDialogAction>

            </div>
          </AlertDialogContent>
        </AlertDialog>

      </main>
    </AppLayout>
  )
}