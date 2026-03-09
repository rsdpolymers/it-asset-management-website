import { z } from 'zod'

export const AssetStatusEnum = z.enum(['Assigned', 'In Stock', 'Under Repair', 'Scrap', 'Returned'])
export const DeviceTypeEnum = z.enum(['Laptop', 'Desktop', 'Tablet', 'Phone', 'Monitor', 'Printer', 'Router', 'Other', 'TV'])

export const assetSchema = z.object({
  assetTag: z.string().optional(),
  serialNumber: z.string().optional(),
  deviceType: DeviceTypeEnum.optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  purchaseDate: z.string().optional(),
  purchasePrice: z.any().optional(),
  warrantyExpiry: z.string().optional(),
  status: AssetStatusEnum.optional(),
  assignedTo: z.string().optional().nullable(),
  assignedDate: z.string().optional().nullable(),
  department: z.string().optional(),
  location: z.string().optional(),
  vendorName: z.string().optional().nullable(),
  repairDate: z.string().optional().nullable(),
  comments: z.string().optional(),
})

export const employeeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  department: z.string().min(1, 'Department is required'),
  designation: z.string().min(1, 'Designation is required'),
  employeeId: z.string().min(1, 'Employee ID is required'),
})

export type Asset = z.infer<typeof assetSchema>
export type Employee = z.infer<typeof employeeSchema>