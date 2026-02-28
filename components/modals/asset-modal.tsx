'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { assetSchema, Asset } from '@/lib/validation'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { AlertCircle, Loader2 } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

interface AssetModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: Asset) => Promise<void>
  initialData?: Asset & { _id?: string }
  employees: Array<{ _id: string; name: string; email: string }>
}

type FormData = Asset

export function AssetModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  employees,
}: AssetModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showAssignedFields, setShowAssignedFields] = useState(
    initialData?.status === 'Assigned'
  )
  const [showRepairFields, setShowRepairFields] = useState(
    initialData?.status === 'Under Repair'
  )

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(assetSchema),
    defaultValues: initialData || {
      status: 'In Stock',
      location: '',
    },
  })

  const status = watch('status')

  useEffect(() => {
    setShowAssignedFields(status === 'Assigned')
    setShowRepairFields(status === 'Under Repair')
    
    if (status !== 'Assigned') {
      setValue('assignedTo', null)
      setValue('assignedDate', null)
    }
    if (status !== 'Under Repair') {
      setValue('vendorName', null)
    }
  }, [status, setValue])

  const handleFormSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      await onSubmit(data)
      reset()
      onClose()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Asset' : 'Add New Asset'}</DialogTitle>
          <DialogDescription>
            {initialData ? 'Update the asset details' : 'Fill in all the required fields to add a new asset'}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-180px)] pr-4">
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 pr-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="font-semibold">Basic Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="assetTag">Asset Tag *</Label>
                  <Input
                    id="assetTag"
                    {...register('assetTag')}
                    placeholder="e.g., ASSET001"
                    className={errors.assetTag ? 'border-destructive' : ''}
                  />
                  {errors.assetTag && (
                    <p className="text-sm text-destructive flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {errors.assetTag.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serialNumber">Serial Number *</Label>
                  <Input
                    id="serialNumber"
                    {...register('serialNumber')}
                    placeholder="e.g., SN123456"
                    className={errors.serialNumber ? 'border-destructive' : ''}
                  />
                  {errors.serialNumber && (
                    <p className="text-sm text-destructive flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {errors.serialNumber.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deviceType">Device Type *</Label>
                  <Select defaultValue={initialData?.deviceType} onValueChange={(value) => setValue('deviceType', value as any)}>
                    <SelectTrigger className={errors.deviceType ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Select device type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Laptop">Laptop</SelectItem>
                      <SelectItem value="Desktop">Desktop</SelectItem>
                      <SelectItem value="Tablet">Tablet</SelectItem>
                      <SelectItem value="Phone">Phone</SelectItem>
                      <SelectItem value="Monitor">Monitor</SelectItem>
                      <SelectItem value="Printer">Printer</SelectItem>
                      <SelectItem value="Router">Router</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.deviceType && (
                    <p className="text-sm text-destructive flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {errors.deviceType.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select value={status} onValueChange={(value) => setValue('status', value as any)}>
                    <SelectTrigger className={errors.status ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Assigned">Assigned</SelectItem>
                      <SelectItem value="In Stock">In Stock</SelectItem>
                      <SelectItem value="Under Repair">Under Repair</SelectItem>
                      <SelectItem value="Scrap">Scrap</SelectItem>
                      <SelectItem value="Returned">Returned</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.status && (
                    <p className="text-sm text-destructive flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {errors.status.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Device Details */}
            <div className="space-y-4">
              <h3 className="font-semibold">Device Details</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brand">Brand *</Label>
                  <Input
                    id="brand"
                    {...register('brand')}
                    placeholder="e.g., Dell"
                    className={errors.brand ? 'border-destructive' : ''}
                  />
                  {errors.brand && (
                    <p className="text-sm text-destructive flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {errors.brand.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model">Model *</Label>
                  <Input
                    id="model"
                    {...register('model')}
                    placeholder="e.g., Latitude 5410"
                    className={errors.model ? 'border-destructive' : ''}
                  />
                  {errors.model && (
                    <p className="text-sm text-destructive flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {errors.model.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Purchase Information */}
            <div className="space-y-4">
              <h3 className="font-semibold">Purchase Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="purchaseDate">Purchase Date *</Label>
                  <Input
                    id="purchaseDate"
                    type="date"
                    {...register('purchaseDate')}
                    className={errors.purchaseDate ? 'border-destructive' : ''}
                  />
                  {errors.purchaseDate && (
                    <p className="text-sm text-destructive flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {errors.purchaseDate.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purchasePrice">Purchase Price (₹) *</Label>
                  <Input
                    id="purchasePrice"
                    type="number"
                    {...register('purchasePrice', { valueAsNumber: true })}
                    placeholder="0.00"
                    className={errors.purchasePrice ? 'border-destructive' : ''}
                  />
                  {errors.purchasePrice && (
                    <p className="text-sm text-destructive flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {errors.purchasePrice.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="warrantyExpiry">Warranty Expiry *</Label>
                <Input
                  id="warrantyExpiry"
                  type="date"
                  {...register('warrantyExpiry')}
                  className={errors.warrantyExpiry ? 'border-destructive' : ''}
                />
                {errors.warrantyExpiry && (
                  <p className="text-sm text-destructive flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {errors.warrantyExpiry.message}
                  </p>
                )}
              </div>
            </div>

            {/* Assignment Information (Conditional) */}
            {showAssignedFields && (
              <div className="space-y-4 border border-blue-200 bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                <h3 className="font-semibold">Assignment Information</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="assignedTo">Assigned To *</Label>
                    <Select defaultValue={initialData?.assignedTo || ''} onValueChange={(value) => setValue('assignedTo', value)}>
                      <SelectTrigger className={errors.assignedTo ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Select employee" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map((emp) => (
                          <SelectItem key={emp._id} value={emp._id}>
                            {emp.name} ({emp.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.assignedTo && (
                      <p className="text-sm text-destructive flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {errors.assignedTo.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="assignedDate">Assigned Date *</Label>
                    <Input
                      id="assignedDate"
                      type="date"
                      {...register('assignedDate')}
                      className={errors.assignedDate ? 'border-destructive' : ''}
                    />
                    {errors.assignedDate && (
                      <p className="text-sm text-destructive flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {errors.assignedDate.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Repair Information (Conditional) */}
            {showRepairFields && (
              <div className="space-y-4 border border-orange-200 bg-orange-50 dark:bg-orange-950 p-4 rounded-lg">
                <h3 className="font-semibold">Repair Information</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vendorName">Vendor Name *</Label>
                    <Input
                      id="vendorName"
                      {...register('vendorName')}
                      placeholder="e.g., Dell Service Center"
                      className={errors.vendorName ? 'border-destructive' : ''}
                    />
                    {errors.vendorName && (
                      <p className="text-sm text-destructive flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {errors.vendorName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="repairDate">Repair Date</Label>
                    <Input
                      id="repairDate"
                      type="date"
                      {...register('repairDate')}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Location Information */}
            <div className="space-y-4">
              <h3 className="font-semibold">Location Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    {...register('location')}
                    placeholder="e.g., Delhi Office - Floor 3"
                    className={errors.location ? 'border-destructive' : ''}
                  />
                  {errors.location && (
                    <p className="text-sm text-destructive flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {errors.location.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    {...register('department')}
                    placeholder="e.g., IT Department"
                  />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="font-semibold">Additional Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="comments">Comments</Label>
                <Textarea
                  id="comments"
                  {...register('comments')}
                  placeholder="Add any additional notes or comments"
                  rows={3}
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t sticky bottom-0 bg-background">
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="gap-2">
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {initialData ? 'Update Asset' : 'Add Asset'}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
