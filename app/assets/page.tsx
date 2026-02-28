'use client'

import { useState, useMemo, useCallback } from 'react'
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
  const [selectedAsset, setSelectedAsset] = useState<(Asset & { _id: string }) | undefined>(undefined)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [filterDeviceType, setFilterDeviceType] = useState<string>('')
  const [filterLocation, setFilterLocation] = useState<string>('')
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const matchesSearch =
        !searchQuery ||
        asset.assetTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.model.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = !filterStatus || asset.status === filterStatus
      const matchesDeviceType = !filterDeviceType || asset.deviceType === filterDeviceType
      const matchesLocation = !filterLocation || asset.location === filterLocation

      return matchesSearch && matchesStatus && matchesDeviceType && matchesLocation
    })
  }, [assets, searchQuery, filterStatus, filterDeviceType, filterLocation])

  const statusColors: Record<string, string> = {
    Assigned: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'In Stock': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'Under Repair': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    Scrap: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    Returned: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  }

  const handleOpenModal = (asset?: Asset & { _id: string }) => {
    setSelectedAsset(asset)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedAsset(undefined)
  }

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
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      })
    }
  }

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
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete asset',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const uniqueDeviceTypes = Array.from(new Set(assets.map((a) => a.deviceType)))
  const uniqueLocations = Array.from(new Set(assets.map((a) => a.location)))

  return (
    <AppLayout>
      <main className="flex-1 space-y-6 p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Assets</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Manage all IT assets in your organization</p>
          </div>
          <Button onClick={() => handleOpenModal()} className="gap-2 w-full sm:w-auto">
            <Plus className="w-4 h-4" />
            Add Asset
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by Asset Tag, Serial Number, Brand, or Model..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>

              {/* Filter Selects */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {/* Status Filter */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Status</Label>
                  <Select
                    value={filterStatus || 'all'}
                    onValueChange={(value) =>
                      setFilterStatus(value === 'all' ? '' : value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="Assigned">Assigned</SelectItem>
                      <SelectItem value="In Stock">In Stock</SelectItem>
                      <SelectItem value="Under Repair">Under Repair</SelectItem>
                      <SelectItem value="Scrap">Scrap</SelectItem>
                      <SelectItem value="Returned">Returned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Device Type Filter */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Device Type</Label>
                  <Select
                    value={filterDeviceType || 'all'}
                    onValueChange={(value) =>
                      setFilterDeviceType(value === 'all' ? '' : value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All Types" />
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

                {/* Location Filter */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Location</Label>
                  <Select
                    value={filterLocation || 'all'}
                    onValueChange={(value) =>
                      setFilterLocation(value === 'all' ? '' : value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All Locations" />
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

                {/* Clear Filters Button */}
                <div className="flex flex-col justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery('')
                      setFilterStatus('')
                      setFilterDeviceType('')
                      setFilterLocation('')
                    }}
                    className="w-full"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assets Table */}
        <Card>
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <CardTitle>Assets Table</CardTitle>
              <CardDescription>{filteredAssets.length} assets found</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto -mx-6 px-6 sm:mx-0 sm:px-6">
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredAssets.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm sm:text-base text-muted-foreground">No assets found. Try adjusting your filters.</p>
              </div>
            ) : (
              <div className="min-w-full">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">Asset Tag</TableHead>
                      <TableHead className="whitespace-nowrap hidden sm:table-cell">Device Type</TableHead>
                      <TableHead className="whitespace-nowrap hidden md:table-cell">Brand</TableHead>
                      <TableHead className="whitespace-nowrap hidden lg:table-cell">Model</TableHead>
                      <TableHead className="whitespace-nowrap hidden xl:table-cell">Serial Number</TableHead>
                      <TableHead className="whitespace-nowrap">Location</TableHead>
                      <TableHead className="whitespace-nowrap">Status</TableHead>
                      <TableHead className="whitespace-nowrap hidden md:table-cell">Assigned To</TableHead>
                      <TableHead className="whitespace-nowrap text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAssets.map((asset) => (
                      <TableRow key={asset._id}>
                        <TableCell className="font-medium text-sm">{asset.assetTag}</TableCell>
                        <TableCell className="hidden sm:table-cell text-sm">{asset.deviceType}</TableCell>
                        <TableCell className="hidden md:table-cell text-sm">{asset.brand}</TableCell>
                        <TableCell className="hidden lg:table-cell text-sm">{asset.model}</TableCell>
                        <TableCell className="hidden xl:table-cell text-xs">{asset.serialNumber}</TableCell>
                        <TableCell className="text-sm">{asset.location}</TableCell>
                        <TableCell>
                          <Badge className={statusColors[asset.status]}>{asset.status}</Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm">{asset.assignedTo || '-'}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1 sm:gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenModal(asset)}
                              className="gap-1 text-xs sm:text-sm"
                            >
                              <Edit2 className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span className="hidden sm:inline">Edit</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteClick(asset._id)}
                              className="text-destructive hover:text-destructive gap-1 text-xs sm:text-sm"
                            >
                              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span className="hidden sm:inline">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Asset Modal */}
        <AssetModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleSubmitAsset}
          initialData={selectedAsset}
          employees={employees}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Asset?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. The asset will be permanently deleted from the system.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex justify-end gap-2">
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="bg-destructive hover:bg-destructive/90 gap-2"
              >
                {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                Delete
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </AppLayout>
  )
}
