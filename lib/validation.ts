import { z } from 'zod'

export const AssetStatusEnum = z.enum(['Assigned', 'In Stock', 'Under Repair', 'Scrap', 'Returned'])
export const DeviceTypeEnum = z.enum(['Laptop', 'Desktop', 'Tablet', 'Phone', 'Monitor', 'Printer', 'Router', 'Other'])

export const assetSchema = z.object({
  assetTag: z.string().min(1, 'Asset Tag is required'),
  serialNumber: z.string().min(1, 'Serial Number is required'),
  deviceType: DeviceTypeEnum,
  brand: z.string().min(1, 'Brand is required'),
  model: z.string().min(1, 'Model is required'),
  purchaseDate: z.string().refine(date => !isNaN(Date.parse(date)), 'Invalid purchase date'),
  purchasePrice: z.number().positive('Purchase price must be positive'),
  warrantyExpiry: z.string().refine(date => !isNaN(Date.parse(date)), 'Invalid warranty date'),
  status: AssetStatusEnum,
  assignedTo: z.string().optional().nullable(),
  assignedDate: z.string().optional().nullable(),
  department: z.string().optional(),
  location: z.string().min(1, 'Location is required'),
  vendorName: z.string().optional().nullable(),
  repairDate: z.string().optional().nullable(),
  comments: z.string().optional(),
}).refine(
  (data) => {
    if (data.status === 'Assigned' && !data.assignedTo) {
      return false
    }
    return true
  },
  { message: 'Assigned To is required when status is Assigned', path: ['assignedTo'] }
).refine(
  (data) => {
    if (data.status === 'Under Repair' && !data.vendorName) {
      return false
    }
    return true
  },
  { message: 'Vendor Name is required when status is Under Repair', path: ['vendorName'] }
)

export const employeeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  department: z.string().min(1, 'Department is required'),
  designation: z.string().min(1, 'Designation is required'),
  employeeId: z.string().min(1, 'Employee ID is required'),
})

export type Asset = z.infer<typeof assetSchema>
export type Employee = z.infer<typeof employeeSchema>
