import { useState, useCallback, useEffect } from 'react'
import { Asset } from '@/lib/validation'

interface UseAssetsReturn {
  assets: (Asset & { _id: string })[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  addAsset: (data: Asset) => Promise<void>
  updateAsset: (id: string, data: Asset) => Promise<void>
  deleteAsset: (id: string) => Promise<void>
}

export function useAssets(): UseAssetsReturn {
  const [assets, setAssets] = useState<(Asset & { _id: string })[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAssets = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/assets')
      if (!response.ok) throw new Error('Failed to fetch assets')
      const data = await response.json()
      setAssets(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAssets()
  }, [fetchAssets])

  const addAsset = useCallback(async (data: Asset) => {
    try {
      const response = await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to create asset')
      const newAsset = await response.json()
      setAssets((prev) => [newAsset, ...prev])
    } catch (err) {
      throw err instanceof Error ? err : new Error('Unknown error')
    }
  }, [])

  const updateAsset = useCallback(async (id: string, data: Asset) => {
    try {
      const response = await fetch(`/api/assets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to update asset')
      const updatedAsset = await response.json()
      setAssets((prev) =>
        prev.map((asset) => (asset._id === id ? updatedAsset : asset))
      )
    } catch (err) {
      throw err instanceof Error ? err : new Error('Unknown error')
    }
  }, [])

  const deleteAsset = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/assets/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete asset')
      setAssets((prev) => prev.filter((asset) => asset._id !== id))
    } catch (err) {
      throw err instanceof Error ? err : new Error('Unknown error')
    }
  }, [])

  return {
    assets,
    isLoading,
    error,
    refetch: fetchAssets,
    addAsset,
    updateAsset,
    deleteAsset,
  }
}
