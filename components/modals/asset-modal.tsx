'use client'

import React, { useState, useEffect } from 'react'
import { useForm, FieldError } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { assetSchema, Asset } from '@/lib/validation'

// Helper function to safely extract error messages
const getErrorMessage = (error: FieldError | undefined): string => {
  if (!error) return ''
  if (typeof error.message === 'string') return error.message
  return 'Invalid field'
}
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

  useEffect(() => {
    if (initialData) {
      reset(initialData)
    } else {
      reset({
        status: 'In Stock',
        location: '',
      })
    }
  }, [initialData, reset])

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
      const url = initialData?._id
        ? `/api/assets/${initialData._id}`
        : '/api/assets'

      const method = initialData?._id ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to save asset')
      }

      reset()
      onClose()

    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }
  const deviceType = watch('deviceType')

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[85vh] h-[85vh] flex flex-col p-0">
        <div className="flex flex-col h-full">

          {/* Header */}
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle>
              {initialData ? 'Edit Asset' : 'Add New Asset'}
            </DialogTitle>
            <DialogDescription>
              {initialData
                ? 'Update the asset details'
                : 'Fill in all required fields to add a new asset'}
            </DialogDescription>
          </DialogHeader>

          {/* Scrollable Body */}
          <ScrollArea className="flex-1 overflow-y-auto px-6">
            <form
              onSubmit={handleSubmit(handleFormSubmit)}
              className="py-4 space-y-6  mx-1"
            >

              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground">
                  Basic Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="assetTag">Asset Tag</Label>
                    <Input
                      id="assetTag"
                      {...register('assetTag')}
                      placeholder="ASSET001"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="serialNumber">Serial Number</Label>
                    <Input
                      id="serialNumber"
                      {...register('serialNumber')}
                      placeholder="SN123456"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  {/* Device Type */}
                  <div className="space-y-2">
                    <Label>Device Type</Label>

                    <Select
                      value={deviceType || ''}
                      onValueChange={(value) =>
                        setValue('deviceType', value as any)
                      }
                    >
                      <SelectTrigger>
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
                        <SelectItem value="TV">TV</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <Label>Status</Label>

                    <Select
                      value={status}
                      onValueChange={(value) =>
                        setValue('status', value as any)
                      }
                    >
                      <SelectTrigger
                        className={errors.status ? 'border-destructive' : ''}
                      >
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
                  </div>

                </div>
              </div>

              {/* Device Details */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground">
                  Device Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  <div className="space-y-2">
                    <Label>Brand</Label>
                    <Input
                      {...register('brand')}
                      placeholder="Dell"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Model</Label>
                    <Input
                      {...register('model')}
                      placeholder="Latitude 5410"
                    />
                  </div>

                </div>
              </div>

              {/* Purchase Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground">
                  Purchase Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  <div className="space-y-2">
                    <Label>Purchase Date</Label>
                    <Input
                      type="date"
                      {...register('purchaseDate')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Purchase Price (₹)</Label>

                    <Input
                      type="number"
                      {...register('purchasePrice', { valueAsNumber: true })}
                      placeholder="0"
                    />

                    {errors.purchasePrice && (
                      <p className="text-sm text-destructive flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {getErrorMessage(errors.purchasePrice as FieldError)}
                      </p>
                    )}
                  </div>

                </div>

                <div className="space-y-2">
                  <Label>Warranty Expiry</Label>
                  <Input
                    type="date"
                    {...register('warrantyExpiry')}
                  />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground">
                  Location Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input
                      {...register('location')}
                      placeholder="G15/D124/MO"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Input
                      {...register('department')}
                    />
                  </div>

                </div>
              </div>

              {/* Assigned Information */}
              {showAssignedFields && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground">
                    Assignment Information
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                    {/* Assigned Employee */}
                    <div className="space-y-2">
                      <Label>Assigned Employee</Label>

                      <Select
                        value={watch('assignedTo') ?? undefined }
                        onValueChange={(value) => setValue('assignedTo', value as any)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder="Select employee"
                            className="truncate"
                          />
                        </SelectTrigger>

                        <SelectContent>
                          {employees.map((emp) => (
                            <SelectItem key={emp._id} value={emp._id}>
                              {emp.name} ({emp.email})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Assigned Date */}
                    <div className="space-y-2">
                      <Label>Assigned Date</Label>
                      <Input
                        type="date"
                        {...register('assignedDate')}
                      />
                    </div>

                  </div>
                </div>
              )}

              {/* Comments */}
              <div className="space-y-2">
                <Label>Comments</Label>
                <Textarea
                  {...register('comments')}
                  placeholder="Additional notes..."
                />
              </div>

            </form>
          </ScrollArea>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>

            <Button
              onClick={handleSubmit(handleFormSubmit)}
              disabled={isLoading}
              className="gap-2"
            >
              {isLoading && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              {initialData ? 'Update Asset' : 'Add Asset'}
            </Button>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  )
}
