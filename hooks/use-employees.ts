import { useState, useCallback, useEffect } from 'react'
import { Employee } from '@/lib/validation'

interface UseEmployeesReturn {
  employees: (Employee & { _id: string })[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useEmployees(): UseEmployeesReturn {
  const [employees, setEmployees] = useState<(Employee & { _id: string })[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEmployees = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/employees')
      if (!response.ok) throw new Error('Failed to fetch employees')
      const data = await response.json()
      setEmployees(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEmployees()
  }, [fetchEmployees])

  return {
    employees,
    isLoading,
    error,
    refetch: fetchEmployees,
  }
}
