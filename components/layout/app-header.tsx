'use client'

import { usePathname } from 'next/navigation'
import { Clock } from 'lucide-react'
import { useEffect, useState } from 'react'

export function AppHeader() {
  const pathname = usePathname()
  const [currentTime, setCurrentTime] = useState<string>('')
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
    
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
    }, 60000) // Update every minute

    return () => clearInterval(timer)
  }, [])

  const getPageTitle = () => {
    switch (pathname) {
      case '/dashboard':
        return 'Dashboard'
      case '/assets':
        return 'Assets'
      case '/reports':
        return 'Reports'
      case '/settings':
        return 'Settings'
      default:
        return 'Dashboard'
    }
  }

  return (
    <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between">
      <div>
        <h2 className="text-lg font-semibold text-foreground">{getPageTitle()}</h2>
      </div>
      <div className="flex items-center gap-4">
        {isMounted && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{currentTime}</span>
          </div>
        )}
      </div>
    </header>
  )
}
